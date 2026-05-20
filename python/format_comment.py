#!/usr/bin/env python3

# Bridge between the Formol VS Code extension and the `formol` Python
# package. Reads the raw comment from stdin and writes the reformatted
# comment to stdout.

import argparse
import sys

import formol


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--kind', choices=('c', 'prefix'), required=True)
    ap.add_argument('--start-col', type=int, default=0)
    ap.add_argument('--max-line-len', type=int, default=72)
    ap.add_argument('--prefix', default='# ')
    args = ap.parse_args()
    comment = sys.stdin.read()

    try:
        if args.kind == 'c':
            out = formol.format_c_block_comment(comment, args.start_col,
                                                args.max_line_len)
        else:
            out = formol.format_prefixed_block_comment(comment,
                                                       args.start_col,
                                                       args.max_line_len,
                                                       args.prefix)
    except ValueError as exc:
        print(f'formol: invalid comment: {exc}', file=sys.stderr)
        return 2

    sys.stdout.write(out)
    return 0


if __name__ == '__main__':
    sys.exit(main())
