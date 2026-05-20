import * as path from 'path';
import * as vscode from 'vscode';

import { CommentBlock, findCBlock, findPyBlock } from './comment';
import { CommentKind, runFormol } from './formol';
import { commentKindFor } from './languages';

const PY_PREFIX = '# ';

export function activate(context: vscode.ExtensionContext): void {
    const scriptPath = path.join(context.extensionPath, 'python',
                                 'format_comment.py');
    const cmd = vscode.commands.registerCommand(
        'formol.reformatBlockComment',
        () => reformat(scriptPath),
    );
    context.subscriptions.push(cmd);
}

export function deactivate(): void {}

async function reformat(scriptPath: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        return;
    }

    if (editor.selections.length !== 1 || !editor.selection.isEmpty) {
        vscode.window.showErrorMessage(
            'Formol: a single caret with no selection is required.');
        return;
    }

    const doc = editor.document;
    const lang = doc.languageId;
    const detected = detectBlock(doc, editor.selection.active.line, lang,
                                 tabSizeOf(editor));

    if (!detected) {
        vscode.window.showErrorMessage(
            'Formol: the caret is not inside a recognized block comment.');
        return;
    }

    const config = vscode.workspace.getConfiguration('formol');
    const maxLineLen = config.get<number>('maxLineLength', 72);
    const pythonBin = config.get<string>('pythonBin', 'python3');
    let formatted: string;

    try {
        formatted = await runFormol(detected.block.text, {
            pythonBin,
            scriptPath,
            kind: detected.kind,
            startCol: detected.block.startCol,
            maxLineLen,
            prefix: detected.kind === 'prefix' ? PY_PREFIX : undefined,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Formol: ${msg}`);
        return;
    }

    await editor.edit((eb) => eb.replace(detected.block.range, formatted));
}

interface Detected {
    block: CommentBlock;
    kind: CommentKind;
}

function detectBlock(doc: vscode.TextDocument, line: number, lang: string,
                     tabSize: number): Detected | undefined {
    const kind = commentKindFor(lang);

    if (!kind) {
        return undefined;
    }

    const block = kind === 'c'
        ? findCBlock(doc, line, tabSize)
        : findPyBlock(doc, line, tabSize);
    return block ? { block, kind } : undefined;
}

function tabSizeOf(editor: vscode.TextEditor): number {
    const ts = editor.options.tabSize;
    return typeof ts === 'number' && ts > 0 ? ts : 8;
}
