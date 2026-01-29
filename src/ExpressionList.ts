export class ExpressionList {
    expressions: string[];
    src: string;
    currentChar: string;
    constructor(line: string) {
        this.expressions = [];
        this.src = line;
        this.currentChar = this.src[0];
    }
    advance() {
        this.src = this.src.slice(1);
        this.currentChar = this.src[0];
    }
    eol() {
        return this.src.length === 0;
    }
    simpleExpr() {
        if (this.eol()) return;
        let inBrackets = false;
        let expr = '';

        while (!this.eol()) {
            if (this.currentChar === '(') inBrackets = true;
            if (inBrackets) {
                // NO, i don't care if it's "[]" brackets smh.
                while (inBrackets && !this.eol()) {
                    if (this.currentChar === ')') {
                        inBrackets = false;
                        break;
                    }
                    expr += this.currentChar;
                    this.advance();
                    // if (eol()) break;
                }
            } else {
                expr += this.currentChar;
                this.advance();
            }

            if (this.currentChar === ' ') break;
        }

        // pray this never hits you up in prod lmao, the issue should be resolved long before
        // this error should ever get triggered, i think.
        if (inBrackets) throw Error('Bracket Pair not finished!');

        this.expressions.push(expr.trim());
    }
    parse() {
        while (!this.eol()) {
            this.simpleExpr();
        }
        return this
    }
}