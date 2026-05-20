// Returns the visual column of character `charIndex` in `line`, given
// the visual width of a tab character.
export function visualColumn(line: string, charIndex: number,
                             tabSize: number): number {
    let col = 0;

    for (let i = 0; i < charIndex && i < line.length; i++) {
        if (line[i] === '\t') {
            col += tabSize - (col % tabSize);
        } else {
            col += 1;
        }
    }

    return col;
}
