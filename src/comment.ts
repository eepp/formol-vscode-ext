import * as vscode from 'vscode';
import { visualColumn } from './visual';

// Describes a contiguous block comment in a text document.
export interface CommentBlock {
    // Inclusive range to replace with the formatted comment.
    range: vscode.Range;

    // Original text to feed to Formol (includes leading whitespace of
    // the first line so that Formol can infer the tab width).
    text: string;

    // Visual column of the leading delimiter (`/*` or `#`).
    startCol: number;
}

// Returns the formattable region for a plain text document (the whole
// document) or `undefined` if it's empty.
export function findFullText(doc: vscode.TextDocument):
        CommentBlock | undefined {
    if (doc.lineCount === 0) {
        return undefined;
    }

    const lastLine = doc.lineCount - 1;
    const range = new vscode.Range(0, 0, lastLine,
                                   doc.lineAt(lastLine).text.length);
    const text = doc.getText(range);

    if (text.length === 0) {
        return undefined;
    }

    return { range, text, startCol: 0 };
}

// Returns the formattable region for a Git commit message document:
// everything from the start up to the line just before the first line
// whose first character is `#` (the comment block that Git generates).
// Trailing blank lines are excluded from the region so they survive
// verbatim around the `#` block.
export function findGitCommitText(doc: vscode.TextDocument):
        CommentBlock | undefined {
    let firstHashLine = doc.lineCount;

    for (let i = 0; i < doc.lineCount; i++) {
        if (doc.lineAt(i).text.startsWith('#')) {
            firstHashLine = i;
            break;
        }
    }

    let endLine = firstHashLine - 1;

    while (endLine >= 0 && doc.lineAt(endLine).text.trim() === '') {
        endLine--;
    }

    if (endLine < 0) {
        return undefined;
    }

    const range = new vscode.Range(0, 0, endLine,
                                   doc.lineAt(endLine).text.length);
    const text = doc.getText(range);
    return { range, text, startCol: 0 };
}

// Finds the C/C++ block comment containing `line`, or `undefined` if
// the line isn't inside one.
//
// The block starts at the nearest line at or above `line` whose first
// non-whitespace text is `/*` and ends at the nearest line at or below
// the start whose text contains `*/`. Both ends are required and `line`
// must lie within them.
export function findCBlock(doc: vscode.TextDocument, line: number,
                           tabSize: number): CommentBlock | undefined {
    let startLine = -1;

    for (let i = line; i >= 0; i--) {
        const text = doc.lineAt(i).text;
        const trimmed = text.trimStart();

        if (trimmed.startsWith('/*')) {
            startLine = i;
            break;
        }

        // If we hit a `*/` before a `/*` while walking up, the caret
        // sits after a closed comment, not inside one.
        if (i < line && trimmed.includes('*/')) {
            return undefined;
        }
    }

    if (startLine < 0) {
        return undefined;
    }

    const startText = doc.lineAt(startLine).text;
    const startChar = startText.indexOf('/*');

    let endLine = -1;
    let endChar = -1;

    for (let i = startLine; i < doc.lineCount; i++) {
        const text = doc.lineAt(i).text;
        // Don't match the `*/` that's part of the opening `/*` on the
        // first line.
        const searchFrom = i === startLine ? startChar + 2 : 0;
        const idx = text.indexOf('*/', searchFrom);

        if (idx >= 0) {
            endLine = i;
            endChar = idx + 2;
            break;
        }
    }

    if (endLine < 0 || line > endLine) {
        return undefined;
    }

    // Pass the raw lines, including leading whitespace on the first
    // line, so Formol can infer the tab width.
    const inputRange = new vscode.Range(startLine, 0, endLine,
                                        doc.lineAt(endLine).text.length);
    const text = doc.getText(inputRange);

    // Formol emits the new comment starting at `/*` with no leading
    // indent on the first line (subsequent lines carry the indent), so
    // the replacement range starts at the `/*` character itself.
    const range = new vscode.Range(startLine, startChar, endLine, endChar);
    const startCol = visualColumn(startText, startChar, tabSize);
    return { range, text, startCol };
}

// Finds the Python `#`-prefixed block comment containing `line`, or
// `undefined` if `line` isn't a `#` line.
//
// The block is the maximal contiguous run of lines around `line` whose
// indentation (the whitespace before `#`) matches exactly.
export function findPyBlock(doc: vscode.TextDocument, line: number,
                            tabSize: number): CommentBlock | undefined {
    const hashPat = /^(\s*)#/;
    const lineText = doc.lineAt(line).text;
    const m = lineText.match(hashPat);

    if (!m) {
        return undefined;
    }

    const indent = m[1];
    let start = line;
    let end = line;

    while (start > 0) {
        const prev = doc.lineAt(start - 1).text.match(hashPat);

        if (!prev || prev[1] !== indent) {
            break;
        }

        start--;
    }

    while (end < doc.lineCount - 1) {
        const next = doc.lineAt(end + 1).text.match(hashPat);

        if (!next || next[1] !== indent) {
            break;
        }

        end++;
    }

    // Formol emits each output line including the indentation, so the
    // replacement range covers each line from column 0.
    const range = new vscode.Range(start, 0, end,
                                   doc.lineAt(end).text.length);
    const text = doc.getText(range);
    const startCol = visualColumn(doc.lineAt(start).text,
                                  indent.length, tabSize);
    return { range, text, startCol };
}
