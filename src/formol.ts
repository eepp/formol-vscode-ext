import { spawn } from 'child_process';

export type CommentKind = 'c' | 'prefix';

export interface FormolOptions {
    pythonBin: string;
    scriptPath: string;
    kind: CommentKind;
    startCol: number;
    maxLineLen: number;
    prefix?: string;
}

// Invokes the bundled Python helper to reformat `comment` using Formol,
// resolving to the new comment text.
export function runFormol(comment: string,
                          opts: FormolOptions): Promise<string> {
    const args = [
        opts.scriptPath,
        '--kind', opts.kind,
        '--start-col', String(opts.startCol),
        '--max-line-len', String(opts.maxLineLen),
    ];

    if (opts.prefix !== undefined) {
        args.push('--prefix', opts.prefix);
    }

    return new Promise((resolve, reject) => {
        const proc = spawn(opts.pythonBin, args);
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
        proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
        proc.on('error', reject);
        proc.on('close', (code) => {
            if (code === 0) {
                resolve(stdout);
            } else {
                const msg = stderr.trim() || `exit code ${code}`;
                reject(new Error(msg));
            }
        });

        proc.stdin.write(comment);
        proc.stdin.end();
    });
}
