#!/usr/bin/env node
// Builds the CBS reference page from the Risuai source code.
//
// Where the source comes from can be changed with environment variables:
//   RISUAI_SOURCE_DIR  Path to a local Risuai checkout. When set, no network access is needed.
//   RISUAI_REPO        Repository to clone (default: https://github.com/kwaroran/Risuai)
//   RISUAI_REF         Branch or tag to clone (default: main)
//
// The output (OUTPUT below) is listed in .gitignore and regenerated on every build.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { categories, uncategorized } from './cbs-categories.mjs';
import { extractCbs } from './lib/extract-cbs.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_REPO = 'https://github.com/kwaroran/Risuai';
const OUTPUT = join(ROOT, 'src/content/docs/cbs/reference.md');

// ---------------------------------------------------------------------------
// Reading the source

function git(args, opts = {}) {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
}

function loadSource() {
    const repo = (process.env.RISUAI_REPO || DEFAULT_REPO).replace(/\.git$/, '').replace(/\/$/, '');
    const localDir = process.env.RISUAI_SOURCE_DIR;

    if (localDir) {
        const dir = resolve(localDir);
        let commit = null;
        try {
            commit = git(['-C', dir, 'rev-parse', 'HEAD']);
        } catch {}
        return {
            repo,
            commit,
            cbs: readFileSync(join(dir, 'src/ts/cbs.ts'), 'utf8'),
            version: JSON.parse(readFileSync(join(dir, 'version.json'), 'utf8')).version,
            origin: dir,
        };
    }

    const ref = process.env.RISUAI_REF || 'main';
    const cache = join(ROOT, '.cache/risuai');
    rmSync(cache, { recursive: true, force: true });
    mkdirSync(dirname(cache), { recursive: true });
    console.log(`[cbs] Fetching ${repo} (${ref})...`);
    try {
        git(['clone', '--depth', '1', '--filter=blob:none', '--no-checkout', '--branch', ref, `${repo}.git`, cache]);
    } catch (err) {
        throw new Error(
            `Could not fetch the Risuai repository: ${err.stderr || err.message}\n` +
                'If you are offline, set RISUAI_SOURCE_DIR to the path of a local checkout.',
        );
    }
    return {
        repo,
        commit: git(['-C', cache, 'rev-parse', 'HEAD']),
        cbs: git(['-C', cache, 'show', 'HEAD:src/ts/cbs.ts']),
        version: JSON.parse(git(['-C', cache, 'show', 'HEAD:version.json'])).version,
        origin: `${repo}@${ref}`,
    };
}

// ---------------------------------------------------------------------------
// Markdown conversion

/** Turns a name into an HTML id: '#when' → 'cbs-block-when', '//' → 'cbs-slash-slash' */
function idFor(name) {
    const body = name
        .toLowerCase()
        .replace(/#/g, 'block-')
        .replace(/:/g, 'colon-')
        .replace(/\//g, 'slash-')
        .replace(/\?/g, 'question-')
        .replace(/[^a-z0-9_-]/g, (c) => `x${c.codePointAt(0).toString(16)}-`)
        .replace(/-+$/, '');
    return `cbs-${body}`;
}

function codeSpan(text) {
    const longest = Math.max(0, ...(text.match(/`+/g) ?? []).map((m) => m.length));
    const fence = '`'.repeat(longest + 1);
    const pad = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
    return `${fence}${pad}${text}${pad}${fence}`;
}

/** Escapes characters in plain text (outside code) that Markdown or HTML would otherwise interpret. */
function escapeProse(text) {
    return text.replace(/[\\`*_[\]<>|~&]/g, (c) => `\\${c}`);
}

/** Finds {{...}} spans, nesting included. Anything unbalanced is left as plain text. */
function findCbsSpans(text) {
    const spans = [];
    let i = 0;
    while (i < text.length) {
        const start = text.indexOf('{{', i);
        if (start === -1) break;
        let depth = 0;
        let j = start;
        let end = -1;
        while (j < text.length - 1) {
            if (text[j] === '{' && text[j + 1] === '{') {
                depth++;
                j += 2;
            } else if (text[j] === '}' && text[j + 1] === '}') {
                depth--;
                j += 2;
                if (depth === 0) {
                    end = j;
                    break;
                }
            } else {
                j++;
            }
        }
        if (end === -1) break;
        spans.push([start, end]);
        i = end;
    }
    // Spans joined only by an ellipsis or whitespace, like `{{#each A}} ... {{/each}}`, are merged into one.
    const merged = [];
    for (const span of spans) {
        const prev = merged.at(-1);
        if (prev && /^\s*(\.\.\.|…)?\s*$/.test(text.slice(prev[1], span[0]))) prev[1] = span[1];
        else merged.push([...span]);
    }
    return merged;
}

/** One line of plain text to Markdown: CBS spans become code, the rest is escaped. */
function formatInline(text) {
    let out = '';
    let last = 0;
    for (const [s, e] of findCbsSpans(text)) {
        out += escapeProse(text.slice(last, s)) + codeSpan(text.slice(s, e));
        last = e;
    }
    return out + escapeProse(text.slice(last));
}

/** Splits a description into body and usage. By the app's convention, the usage example follows the last 'Usage::'. */
function splitUsage(description) {
    const idx = description.lastIndexOf('Usage::');
    if (idx === -1) return { body: description.trim(), usage: '' };
    return { body: description.slice(0, idx).trim(), usage: description.slice(idx + 'Usage::'.length).trim() };
}

/** Multi-line body to Markdown blocks. Lines starting with '{{' become list items. */
function formatBody(body) {
    const blocks = [];
    let list = [];
    let para = [];
    const flushList = () => list.length && (blocks.push(list.join('\n')), (list = []));
    const flushPara = () => para.length && (blocks.push(para.join('\n')), (para = []));
    for (const raw of body.split('\n')) {
        const line = raw.trim();
        if (!line) {
            flushList();
            flushPara();
        } else if (line.startsWith('{{')) {
            flushPara();
            list.push(`- ${formatInline(line)}`);
        } else {
            flushList();
            // Keep list or heading markers at the start of a line from being read as Markdown.
            para.push(formatInline(line).replace(/^([#+-]|\d+\.)/, '\\$1'));
        }
    }
    flushList();
    flushPara();
    return blocks.join('\n\n');
}

// ---------------------------------------------------------------------------
// Page assembly

const STRINGS = {
    title: 'CBS reference',
    description: 'Every CBS function in Risuai, generated from the Risuai source code.',
    generatedTitle: 'Generated page',
    generated: (src) =>
        `This page is generated from ${codeSpan('src/ts/cbs.ts')} in the Risuai source code. ` +
        `Manual edits are overwritten on the next build. Categories live in ${codeSpan('scripts/cbs-categories.mjs')}.\n\n` +
        `Based on Risuai ${codeSpan(src.version)}${src.commitLink ? ` · commit ${src.commitLink}` : ''}`,
    intro: `New to CBS? Start with [CBS basics](/cbs/basics/). Function names are case-insensitive, and ${codeSpan('_')}, ${codeSpan('-')} and spaces are ignored, so ${codeSpan('{{Get_Var::hp}}')} is the same as ${codeSpan('{{getvar::hp}}')}.`,
    stats: (total) => `${total} functions in total.`,
    overview: 'Overview',
    category: 'Category',
    functions: 'Functions',
    aliases: 'Aliases',
    usage: 'Usage',
    source: 'View source',
    deprecated: 'Deprecated',
    useInstead: (link) => `Use ${link} instead.`,
    docOnly: 'This is not a regular function: the parser or the asset renderer handles it separately.',
};

function groupEntries(entries, warnings) {
    const byName = new Map(entries.map((e) => [e.name, e]));
    const used = new Set();
    const groups = [];
    for (const cat of categories) {
        const items = [];
        for (const name of cat.names) {
            const entry = byName.get(name);
            if (!entry) {
                warnings.push(`'${name}' (${cat.id}) in the category list is missing upstream. It may have been removed or renamed.`);
                continue;
            }
            if (used.has(name)) {
                warnings.push(`'${name}' appears twice in the category list.`);
                continue;
            }
            used.add(name);
            items.push(entry);
        }
        if (items.length) groups.push({ ...cat, items });
    }
    const rest = entries.filter((e) => !used.has(e.name));
    if (rest.length) {
        warnings.push(`${rest.length} uncategorized functions: ${rest.map((e) => e.name).join(', ')} → add them to scripts/cbs-categories.mjs.`);
        groups.push({ ...uncategorized, items: rest });
    }
    return groups;
}

function renderEntry(entry, ctx) {
    const t = STRINGS;
    const id = idFor(entry.name);
    const lines = [`<h3 id="${id}"><a href="#${id}"><code>${entry.name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></a></h3>`, ''];

    const aliases = [...new Set(entry.alias)].filter((a) => a !== entry.name);
    if (aliases.length) lines.push(`${t.aliases}: ${aliases.map(codeSpan).join(', ')}`, '');

    if (entry.deprecated) {
        const rep = entry.deprecated.replacement;
        const repLink = rep ? (ctx.ids.has(rep) ? `[${codeSpan(rep)}](#${idFor(rep)})` : codeSpan(rep)) : '';
        lines.push(`:::caution[${t.deprecated}]`, formatInline(entry.deprecated.message));
        if (repLink) lines.push('', t.useInstead(repLink));
        lines.push(':::', '');
    }

    const { body, usage } = splitUsage(entry.description);
    if (body) lines.push(formatBody(body), '');

    if (entry.docOnly) lines.push(`*${t.docOnly}*`, '');
    if (usage) lines.push(`**${t.usage}:** ${formatInline(usage)}`, '');
    if (ctx.sourceUrl) lines.push(`[${t.source} ↗](${ctx.sourceUrl}#L${entry.line})`, '');
    return lines.join('\n');
}

function renderPage(groups, src) {
    const t = STRINGS;
    const commitLink = src.commit ? `[${codeSpan(src.commit.slice(0, 7))}](${src.repo}/commit/${src.commit})` : '';
    const ctx = {
        ids: new Set(groups.flatMap((g) => g.items.map((e) => e.name))),
        sourceUrl: src.commit ? `${src.repo}/blob/${src.commit}/src/ts/cbs.ts` : null,
    };
    const total = groups.reduce((n, g) => n + g.items.length, 0);

    const sections = groups.map((g) =>
        [`## ${g.label}`, '', ...g.items.map((e) => renderEntry(e, ctx))].join('\n'),
    );
    const overview = [
        `| ${t.category} | ${t.functions} |`,
        '| --- | --- |',
        ...groups.map((g) => `| ${g.label} | ${g.items.map((e) => `[${codeSpan(e.name)}](#${idFor(e.name)})`).join(' · ')} |`),
    ].join('\n');

    const frontmatter = [
        '---',
        `title: ${JSON.stringify(t.title)}`,
        `description: ${JSON.stringify(t.description)}`,
        'editUrl: false',
        'lastUpdated: false',
        'tableOfContents:',
        '  maxHeadingLevel: 2',
        `verifiedVersion: ${JSON.stringify(src.version)}`,
        '---',
    ].join('\n');

    const page = [
        frontmatter,
        '',
        '<!-- Generated file. Do not edit by hand. (scripts/generate-cbs.mjs) -->',
        '',
        `:::note[${t.generatedTitle}]`,
        t.generated({ version: src.version, commitLink }),
        ':::',
        '',
        t.intro,
        '',
        t.stats(total),
        '',
        `## ${t.overview}`,
        '',
        overview,
        '',
        ...sections,
    ].join('\n');

    return { page, total };
}

// ---------------------------------------------------------------------------

function main() {
    const src = loadSource();
    const { entries: all, warnings } = extractCbs(src.cbs);
    const entries = all.filter((e) => !e.internalOnly);
    if (entries.length < 50) {
        throw new Error(`Only ${entries.length} CBS entries found. The upstream structure may have changed; check the extractor.`);
    }
    const groups = groupEntries(entries, warnings);

    const { page, total } = renderPage(groups, src);
    mkdirSync(dirname(OUTPUT), { recursive: true });
    writeFileSync(OUTPUT, page);
    console.log(`[cbs] ${total} entries → ${OUTPUT.slice(ROOT.length + 1)}`);
    console.log(`[cbs] Source: ${src.origin} · version ${src.version}${src.commit ? ` · ${src.commit.slice(0, 7)}` : ''}`);
    for (const w of new Set(warnings)) console.warn(`[cbs] Warning: ${w}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        main();
    } catch (err) {
        console.error(`[cbs] Failed: ${err.message}`);
        process.exit(1);
    }
}
