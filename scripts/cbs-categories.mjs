// Categories for the CBS reference.
// The comment sections in the upstream cbs.ts do not match real categories, so they are curated here by hand.
// A new upstream function lands in 'Uncategorized' and the generator prints a warning; add it here when that happens.

/** @type {{ id: string, label: string, names: string[] }[]} */
export const categories = [
    {
        id: 'blocks',
        label: 'Blocks & control flow',
        names: ['#when', ':else', '#each', 'slot', '#escape', '#puredisplay', '//', '?', 'declare', 'position', '#if', '#if_pure', '#pure'],
    },
    {
        id: 'character',
        label: 'Character & user',
        names: ['char', 'user', 'personality', 'description', 'scenario', 'exampledialogue', 'persona'],
    },
    {
        id: 'prompt',
        label: 'Prompt & model',
        names: ['mainprompt', 'jb', 'jbtoggled', 'globalnote', 'authornote', 'lorebook', 'hiddenkey', 'model', 'axmodel', 'maxcontext', 'prefillsupported'],
    },
    {
        id: 'chat',
        label: 'Chat & messages',
        names: [
            'chatindex', 'firstmsgindex', 'isfirstmsg', 'role', 'lastmessage', 'lastmessageid',
            'previouscharchat', 'previoususerchat', 'previouschatlog', 'history', 'userhistory', 'charhistory',
            'messagetime', 'messagedate', 'messageunixtimearray', 'messageidleduration', 'idleduration',
        ],
    },
    {
        id: 'time',
        label: 'Date & time',
        names: ['date', 'time', 'unixtime', 'isotime', 'isodate'],
    },
    {
        id: 'variables',
        label: 'Variables',
        names: ['getvar', 'setvar', 'addvar', 'setdefaultvar', 'getglobalvar', 'tempvar', 'settempvar', 'return'],
    },
    {
        id: 'logic',
        label: 'Comparison & logic',
        names: ['equal', 'notequal', 'greater', 'less', 'greaterequal', 'lessequal', 'and', 'or', 'not', 'all', 'any', 'iserror'],
    },
    {
        id: 'math',
        label: 'Numbers & math',
        names: [
            'calc', 'round', 'floor', 'ceil', 'abs', 'remaind', 'pow', 'fixnum', 'tonumber',
            'min', 'max', 'sum', 'average', 'fromhex', 'tohex',
        ],
    },
    {
        id: 'random',
        label: 'Random & dice',
        names: ['random', 'pick', 'randint', 'dice', 'roll', 'rollp', 'hash'],
    },
    {
        id: 'string',
        label: 'Strings',
        names: [
            'length', 'lower', 'upper', 'capitalize', 'trim', 'replace', 'reverse',
            'startswith', 'endswith', 'contains', 'split', 'join', 'spread',
            'unicodeencode', 'unicodedecode', 'u', 'ue', 'xor', 'xordecrypt', 'crypt',
        ],
    },
    {
        id: 'array',
        label: 'Arrays & objects',
        names: [
            'makearray', 'makedict', 'range', 'arraylength', 'arrayelement', 'dictelement', 'element',
            'arraypush', 'arraypop', 'arrayshift', 'arraysplice', 'arrayassert', 'objectassert', 'filter',
        ],
    },
    {
        id: 'display',
        label: 'Display & formatting',
        names: [
            'br', 'cbr', 'blank', 'comment', 'button', 'risu', 'tex', 'ruby', 'codeblock', 'file', 'bkspc', 'erase',
            'bo', 'bc', 'decbo', 'decbc',
            'displayescapedbracketopen', 'displayescapedbracketclose',
            'displayescapedanglebracketopen', 'displayescapedanglebracketclose',
            'displayescapedcolon', 'displayescapedsemicolon',
        ],
    },
    {
        id: 'assets',
        label: 'Assets',
        names: [
            'asset', 'emotion', 'image', 'img', 'audio', 'bgm', 'bg', 'video', 'video-img',
            'inlay', 'inlayed', 'inlayeddata', 'path', 'source',
            'assetlist', 'emotionlist', 'chardisplayasset', 'moduleassetlist',
        ],
    },
    {
        id: 'system',
        label: 'System & environment',
        names: ['metadata', 'moduleenabled', 'screenwidth', 'screenheight', 'trigger_id'],
    },
];

export const uncategorized = {
    id: 'uncategorized',
    label: 'Uncategorized (newly added)',
};
