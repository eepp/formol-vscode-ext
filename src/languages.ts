import { CommentKind } from './formol';

// Languages whose primary block comment is `/* ... */`.
const C_STYLE = new Set<string>([
    'c',
    'cpp',
    'csharp',
    'css',
    'dart',
    'go',
    'groovy',
    'java',
    'javascript',
    'javascriptreact',
    'kotlin',
    'less',
    'objective-c',
    'objective-cpp',
    'php',
    'rust',
    'scala',
    'scss',
    'swift',
    'typescript',
    'typescriptreact',
]);

// Languages whose primary line comment marker is `#`.
const HASH_STYLE = new Set<string>([
    'cmake',
    'dockerfile',
    'elixir',
    'julia',
    'makefile',
    'nix',
    'perl',
    'powershell',
    'properties',
    'python',
    'r',
    'ruby',
    'shellscript',
    'tcl',
    'toml',
    'yaml',
]);

// Returns the comment kind for `languageId`, or `undefined` if the
// language isn't supported.
export function commentKindFor(languageId: string): CommentKind | undefined {
    if (C_STYLE.has(languageId)) {
        return 'c';
    }

    if (HASH_STYLE.has(languageId)) {
        return 'prefix';
    }

    return undefined;
}
