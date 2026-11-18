// Reads Risuai's src/ts/cbs.ts as an AST, without running it,
// and pulls the documentation out of its registerFunction({...}) calls.
import { parse } from '@babel/parser';

/**
 * @typedef {object} CbsEntry
 * @property {string} name
 * @property {string[]} alias
 * @property {string} description
 * @property {{ message: string, since?: string, replacement?: string } | undefined} deprecated
 * @property {boolean} internalOnly
 * @property {boolean} docOnly
 * @property {number} line
 */

class ExtractError extends Error {}

/** Accepts only string literals, template literals without substitutions, and + concatenations of the two. */
function staticString(node, what) {
    if (!node) return undefined;
    switch (node.type) {
        case 'StringLiteral':
            return node.value;
        case 'TemplateLiteral':
            if (node.expressions.length > 0) break;
            return node.quasis.map((q) => q.value.cooked).join('');
        case 'BinaryExpression':
            if (node.operator !== '+') break;
            return staticString(node.left, what) + staticString(node.right, what);
    }
    throw new ExtractError(
        `Cannot read ${what} statically (line ${node.loc?.start.line}, node ${node.type}). ` +
            'The extractor (scripts/lib/extract-cbs.mjs) needs updating.',
    );
}

function prop(obj, key) {
    return obj.properties.find(
        (p) =>
            p.type === 'ObjectProperty' &&
            ((p.key.type === 'Identifier' && p.key.name === key) ||
                (p.key.type === 'StringLiteral' && p.key.value === key)),
    )?.value;
}

function walk(node, visit) {
    if (!node || typeof node.type !== 'string') return;
    visit(node);
    for (const key of Object.keys(node)) {
        if (key === 'loc' || key === 'leadingComments' || key === 'trailingComments') continue;
        const child = node[key];
        if (Array.isArray(child)) child.forEach((c) => walk(c, visit));
        else if (child && typeof child.type === 'string') walk(child, visit);
    }
}

/**
 * @param {string} source The cbs.ts source text
 * @returns {{ entries: CbsEntry[], warnings: string[] }}
 */
export function extractCbs(source) {
    const ast = parse(source, { sourceType: 'module', plugins: ['typescript'] });
    /** @type {CbsEntry[]} */
    const raw = [];

    walk(ast.program, (node) => {
        if (
            node.type !== 'CallExpression' ||
            node.callee.type !== 'Identifier' ||
            node.callee.name !== 'registerFunction'
        ) {
            return;
        }
        const arg = node.arguments[0];
        if (arg?.type !== 'ObjectExpression') {
            throw new ExtractError(`The registerFunction argument is not an object literal (line ${node.loc.start.line}).`);
        }
        const line = node.loc.start.line;
        const name = staticString(prop(arg, 'name'), `name (line ${line})`);
        const aliasNode = prop(arg, 'alias');
        let alias = [];
        if (aliasNode) {
            if (aliasNode.type !== 'ArrayExpression') {
                throw new ExtractError(`alias is not an array literal (line ${line}).`);
            }
            alias = aliasNode.elements.map((el) => staticString(el, `alias (line ${line})`));
        }
        const description = staticString(prop(arg, 'description'), `description (line ${line})`) ?? '';

        let deprecated;
        const depNode = prop(arg, 'deprecated');
        if (depNode) {
            if (depNode.type !== 'ObjectExpression') {
                throw new ExtractError(`deprecated is not an object literal (line ${line}).`);
            }
            deprecated = {
                message: staticString(prop(depNode, 'message'), `deprecated.message (line ${line})`) ?? '',
                since: staticString(prop(depNode, 'since'), `deprecated.since (line ${line})`),
                replacement: staticString(prop(depNode, 'replacement'), `deprecated.replacement (line ${line})`),
            };
        }

        const internalNode = prop(arg, 'internalOnly');
        const internalOnly = internalNode?.type === 'BooleanLiteral' && internalNode.value === true;
        const callbackNode = prop(arg, 'callback');
        const docOnly = callbackNode?.type === 'StringLiteral' && callbackNode.value === 'doc_only';

        raw.push({ name, alias, description, deprecated, internalOnly, docOnly, line });
    });

    // The app sets names and aliases into a Map in order, so for a repeated name the later registration wins.
    const warnings = [];
    const lastIndexByName = new Map();
    raw.forEach((e, i) => lastIndexByName.set(e.name, i));
    const entries = raw.filter((e, i) => {
        const keep = lastIndexByName.get(e.name) === i;
        if (!keep) {
            const winner = raw[lastIndexByName.get(e.name)];
            warnings.push(`'${e.name}' is registered twice (lines ${e.line} and ${winner.line}). Only the later one is documented.`);
        }
        return keep;
    });

    const owner = new Map();
    for (const e of entries) {
        for (const key of [e.name, ...e.alias]) {
            const prev = owner.get(key);
            if (prev && prev !== e.name) {
                warnings.push(`'${key}' belongs to both '${prev}' and '${e.name}'. In the app, '${e.name}' wins.`);
            }
            owner.set(key, e.name);
        }
    }

    return { entries, warnings };
}

export { ExtractError };
