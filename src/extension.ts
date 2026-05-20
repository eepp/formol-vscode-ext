import * as path from 'path';
import * as vscode from 'vscode';

import {
    CommentBlock,
    findCBlock,
    findFullText,
    findGitCommitText,
    findPyBlock,
} from './comment';
import { CommentKind, runFormol } from './formol';
import { commentKindFor } from './languages';

const PY_PREFIX = '# ';

export function activate(context: vscode.ExtensionContext): void {
    const scriptPath = path.join(context.extensionPath, 'python',
                                 'format_comment.py');
    const cmd = vscode.commands.registerCommand(
        'formol.reformat',
        () => reformat(scriptPath),
    );
    context.subscriptions.push(cmd);
}

export function deactivate(): void {}

interface Target {
    block: CommentBlock;
    kind: CommentKind;
}

async function reformat(scriptPath: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    const doc = editor.document;
    const lang = doc.languageId;
    const target = detectTarget(doc, editor, lang);

    if (!target) {
        vscode.window.showErrorMessage(noTargetMessage(lang));
        return;
    }

    const config = vscode.workspace.getConfiguration('formol');
    const maxLineLen = config.get<number>('maxLineLength', 72);
    const pythonBin = config.get<string>('pythonBin', 'python3');
    let formatted: string;

    try {
        formatted = await runFormol(target.block.text, {
            pythonBin,
            scriptPath,
            kind: target.kind,
            startCol: target.block.startCol,
            maxLineLen,
            prefix: target.kind === 'prefix' ? PY_PREFIX : undefined,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Formol: ${msg}`);
        return;
    }

    await editor.edit((eb) => eb.replace(target.block.range, formatted));
}

function detectTarget(doc: vscode.TextDocument, editor: vscode.TextEditor,
                      lang: string): Target | undefined {
    if (lang === 'plaintext') {
        const block = findFullText(doc);
        return block ? { block, kind: 'full' } : undefined;
    }

    if (lang === 'git-commit') {
        const block = findGitCommitText(doc);
        return block ? { block, kind: 'full' } : undefined;
    }

    if (editor.selections.length !== 1 || !editor.selection.isEmpty) {
        vscode.window.showErrorMessage(
            'Formol: a single caret with no selection is required.');
        return undefined;
    }

    const kind = commentKindFor(lang);

    if (!kind || kind === 'full') {
        return undefined;
    }

    const line = editor.selection.active.line;
    const tabSize = tabSizeOf(editor);
    const block = kind === 'c'
        ? findCBlock(doc, line, tabSize)
        : findPyBlock(doc, line, tabSize);
    return block ? { block, kind } : undefined;
}

function noTargetMessage(lang: string): string {
    if (lang === 'plaintext' || lang === 'git-commit') {
        return 'Formol: nothing to reformat.';
    }

    return 'Formol: the caret is not inside a recognized block comment.';
}

function tabSizeOf(editor: vscode.TextEditor): number {
    const ts = editor.options.tabSize;
    return typeof ts === 'number' && ts > 0 ? ts : 8;
}
