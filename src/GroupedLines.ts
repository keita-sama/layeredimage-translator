// Stores a logical set of code.
// literally just so i don't have to fucking die.
export class GroupedLines {
    lines: string[];
    currentLine?: string;
    constructor(lines?: string[]) {
        this.lines = lines || [];
        if (this?.lines?.length) this.currentLine = this.lines[0];
    }
    eof() {
        if (!this.lines) return;

        return this.lines.length === 0;
    }
    advance() {
        if (!this.lines) return;

        this.lines.shift();
        this.currentLine = this.lines[0];
    }
    addLine(line: string) {
        this.lines?.push(line)
    }
}

const test = new GroupedLines();

test.addLine('lyered oies')

console.log(test)