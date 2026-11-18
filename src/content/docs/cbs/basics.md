---
title: CBS basics
description: How Risuai's curly-brace syntax (CBS) is read and evaluated, with examples of conditions, loops, and variables.
verifiedVersion: "2026.10.295"
---

CBS (Curly Braced Syntax) is Risuai's template syntax, written inside double curly braces like `{{char}}`. You can use it almost anywhere in Risuai, including character descriptions, prompts, lorebooks, regex scripts, and chat messages, and it is replaced by its result when processed.

This page explains **how the syntax actually behaves**. For the list of individual functions, see the [CBS reference](/cbs/reference/).

## The basic shape

```text
{{name}}
{{name::arg1::arg2}}
```

Arguments follow the function name, separated by `::`. For example, `{{getvar::hp}}` becomes the value of the `hp` variable, and `{{randint::1::6}}` becomes a whole number from 1 to 6.

- **Names are matched loosely.** Case does not matter, and spaces, `_`, and `-` are ignored, so `{{Get_Var::hp}}` and `{{getvar::hp}}` are the same. Arguments are compared exactly as written.
- **Unknown names are left alone.** A name that is not registered, like `{{nosuchfunction::x}}`, is printed as is, with no error. If braces show up in the output, suspect a typo first.
- **The old single `:` still works.** If there is only one colon right after the name, the text is split at `:`. `{{getvar:hp}}` works, but an argument containing `:` gets cut in the wrong place, so use `::` in anything new.
- **`<user>`, `<char>`, and `<bot>` turn into CBS.** Regardless of case, they are replaced with `{{user}}`, `{{char}}`, and `{{bot}}` before processing. They look like HTML tags, but they are not HTML.

## Evaluated from the inside out

CBS can be nested, and the **innermost** part is evaluated first. The outer function receives the already evaluated result as its argument.

```text
{{upper::{{getvar::name}}}}
```

`{{getvar::name}}` first turns into its value (say, `risu`), then `{{upper::risu}}` is evaluated and becomes `RISU`.

## Expressions: `{{? }}`

```text
{{? 1+2}}                     → 3
{{? ({{getvar::hp}} - 10) * 2}}
```

You can use the four arithmetic operators, exponents (`^`), remainders (`%`), comparisons (`<`, `>`, `<=`, `>=`, `==`, `!=`), and parentheses. A comparison becomes `1` when true and `0` when false.

:::caution[The space after the question mark is required]
Written without the space, as in `{{?1+2}}`, it is not recognized as an expression and stays as plain text. Always write it with a space, like `{{? 1+2}}`.
:::

## True and false

In CBS, **only `1` and `true` are true**. Everything else is false, including `yes`, `2`, and the empty string.

That means the condition below is false even when `hp` is `7`. It does not check whether a value is set.

```text
{{#when::{{getvar::hp}}}}...{{/when}}
```

The [`and`](/cbs/reference/#cbs-and), [`or`](/cbs/reference/#cbs-or), and [`not`](/cbs/reference/#cbs-not) functions are stricter and treat **only `1`** as true. To these functions, even `true` is false.

To check whether a value is set, use a comparison operator. It also helps to remember that reading a missing variable gives `null`, not an empty string.

```text
{{#when::{{getvar::hp}}::isnot::null}}hp is set.{{/when}}
```

## Conditions: `#when`

```text
{{#when::{{getvar::hp}}::<=::0}}
You collapse.
{{:else}}
You can still hold on.
{{/when}}
```

Open with `{{#when::condition}}` and close with `{{/when}}`. When the condition is true, the part before `{{:else}}` is kept; when it is false, the part after it is kept.

### Operators

| Syntax | True when |
| --- | --- |
| `A::and::B` | Both A and B are true |
| `A::or::B` | Either A or B is true |
| `not::A` | A is false |
| `A::is::B` | A and B are the exact same string |
| `A::isnot::B` | A and B are different strings |
| `A::>::B`, `A::<::B`, `A::>=::B`, `A::<=::B` | The comparison holds after converting both to numbers |
| `var::name` | The chat variable `name` is true |
| `name::vis::value` | The chat variable `name` equals `value` |
| `name::visnot::value` | The chat variable `name` does not equal `value` |
| `toggle::name` | The toggle `name` is on (the global variable `toggle_name` is true) |
| `name::tis::value`, `name::tisnot::value` | The toggle `name` equals / does not equal `value` |

There are also special words you can put in front of a condition.

- `keep::condition`: does not trim blank lines around the block.
- `legacy::condition`: behaves like the old `#if`. `{{:else}}` cannot be used in this mode.

### Operators group from the right

With several operators, they are evaluated **from the rightmost one**, one at a time. This differs from mathematical precedence and from reading left to right, so be careful.

```text
{{#when::A::and::B::or::C}}     →  A and (B or C)
{{#when::not::A::and::B}}       →  not (A and B)
```

For example, `{{#when::0::and::0::or::1}}` is `0 and (0 or 1)`, so it is false. If this gets confusing, compute the condition first with the [`and`](/cbs/reference/#cbs-and), [`or`](/cbs/reference/#cbs-or), and [`not`](/cbs/reference/#cbs-not) functions.

```text
{{#when::{{or::{{and::{{getvar::a}}::{{getvar::b}}}}::{{getvar::c}}}}}}
Shown only when (a and b) or c.
{{/when}}
```

:::caution[Unknown operators are silently ignored]
If you misspell an operator, as in `{{#when::A::iss::B}}`, there is no error: the operator and A are dropped, and only **whether B is true** is checked. If a condition behaves strangely, check the operator's spelling.
:::

### `{{:else}}` and line breaks

- In a **multi-line** block, `{{:else}}` must sit **on a line of its own** with nothing else on it.
- In a **single-line** block, it can go anywhere, as in `{{#when::1}}yes{{:else}}no{{/when}}`.
- Multi-line blocks have their leading and trailing blank lines trimmed. Indentation at the start of each line is kept. To keep the blank lines too, use `keep`.

:::danger[The false branch is evaluated too]
`#when` **evaluates all the CBS inside the block first**, whatever the condition, and only then discards the branch it does not need. So a `{{setvar}}` in the false branch still runs.

```text
{{#when::0}}{{setvar::hp::0}}{{/when}}
```

This block prints nothing, but inside a chat message it sets `hp` to `0`. To change a variable conditionally, use one of these instead:

- Choose the value with the condition: `{{setvar::hp::{{#when::condition}}0{{:else}}{{getvar::hp}}{{/when}}}}`
- Use `legacy` mode. `{{#when::legacy::condition}}` does not evaluate its contents at all when false. In exchange, `{{:else}}` is not available.
- Use a trigger script.
:::

## Loops: `#each`

```text
{{#each ["apple","pear","orange"] as fruit}}
- {{slot::fruit}}
{{/each}}
```

The block is repeated once for each element of the array, with `{{slot::name}}` replaced by that element.

- The array can be a JSON array (`["a","b"]`) or a string separated by `§` (`a§b`). You can also pass the result of a function like [`makearray`](/cbs/reference/#cbs-makearray).
- CBS inside the block is evaluated **after** `slot` has been substituted. So `{{#each [1,2] as x}}{{? {{slot::x}}*10}}{{/each}}` becomes `1020`.
- The `slot` name must exactly match the name written after `as`.
- By default, indentation at the start of each line and whitespace around the block are trimmed. To keep them, use `{{#each::keep array as name}}`.

## Variables

| Kind | Read | Write | Scope |
| --- | --- | --- | --- |
| Chat variable | `{{getvar::name}}` | `{{setvar::name::value}}`, `{{addvar::name::number}}`, `{{setdefaultvar::name::value}}` | The current chat. Saved along with the chat. |
| Global variable | `{{getglobalvar::name}}` | (cannot be written from CBS) | Every chat and character |
| Temporary variable | `{{tempvar::name}}` | `{{settempvar::name::value}}` | The single text being processed right now |

Reading a chat variable that does not exist gives `null`, unless the character or the prompt template defines a default value for it, in which case you get that value.

### When does `setvar` run?

`setvar`, `addvar`, and `setdefaultvar` run **only when they are inside a message saved in the chat history**. They run when a message is sent and after an AI response arrives, by scanning every chat message; CBS that has run is removed from the message, so it only takes effect once.

They do not run anywhere else:

- When a message is shown on the chat screen, it is only hidden, not run.
- Written in a character description, lorebook, prompt, or similar place, it is not run and stays as plain text.

That is why a common approach is to have a regex script insert `{{setvar::...}}` into the AI response so it is saved in the message. For anything more involved, use a trigger script.

## Showing text as is

Ways to display CBS syntax itself on screen:

| Syntax | What it does |
| --- | --- |
| `{{#puredisplay}}...{{/puredisplay}}` | Shows the CBS inside as is, without evaluating it. |
| `{{#escape}}...{{/escape}}` | Swaps `{`, `}`, `(`, and `)` inside for special characters so later processing does not read them as CBS, and turns them back into the original characters when drawing to the screen or sending to the AI. Use `{{#escape::keep}}` to preserve whitespace. |
| `{{bo}}`, `{{bc}}` | Insert special characters that look like `{{` and `}}`. |

`#pure` is no longer recommended and has been replaced by `#puredisplay`.

## Comments

| Syntax | Prompt sent to the AI | Chat screen |
| --- | --- | --- |
| `{{comment::text}}` | Removed | Shown as a comment box |
| `{{// text}}` | See below | See below |

:::caution[`{{// ...}}` is not removed the way you might expect]
The CBS reference calls `{{// ...}}` a comment, but in the source code of the version this page was checked against, the only place that removes it is the **lorebook keyword check**. It stays as plain text after the CBS parser runs. To hide something reliably from both the prompt and the screen, you can wrap it like this. The false branch of a `legacy` block does not even evaluate the CBS inside.

```text
{{#when::legacy::0}}
This never appears anywhere.
{{/when}}
```
:::

## Syntax that is no longer recommended

- `{{#if condition}}...{{/if}}` and `{{#if_pure condition}}...{{/if_pure}}`: they cannot take operators and have been replaced by `#when`. `#if_pure` is the same as `{{#when::keep::condition}}`.
- `{{#pure}}`: replaced by `{{#puredisplay}}`.

## Syntax missing from the reference

The parser has a few more blocks that are not listed in the reference. There is no official description of them and their behavior may change, so treat this as a hint only.

- `{{#func name ...}}...{{/func}}` and `{{call::name::args}}`: define a block like a function and call it. Inside the block, `{{arg::0}}` is the function name, and the arguments start at `{{arg::1}}`.
- `{{#code}}...{{/code}}`: removes line breaks and tabs and turns escapes like `\n`, `\t`, and `\uXXXX` into the actual characters.
