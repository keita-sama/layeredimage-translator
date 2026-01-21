// lord forgive me this might be the worlds most horriblest code.

// this turns a string like "attribute attrname default null if_xxx([])"
// into a list like so ["attribute", "attrname"...] and so on.
// helpful because parsing by them by splitting spaces is retarded.

export function parseExpressions(sourceString: string) {
    const expressions: string[] = [];
    let src = sourceString.trim();
    let currentChar = src[0];

    function advance() {
        src = src.slice(1);
        currentChar = src[0];
    }
    function eol() {
        return src.length === 0;
    }

    function simpleExpr() {
        if (eol()) return;
        let inBrackets = false;
        let expr = '';

        while (!eol()) {
            if (currentChar === '(') inBrackets = true;
            if (inBrackets) {
                // NO, i don't care if it's "[]" brackets smh.
                while (inBrackets && !eol()) {
                    if (currentChar === ')') {
                        inBrackets = false;
                        break;
                    }
                    expr += currentChar;
                    advance();
                    // if (eol()) break;
                }
            } else {
                expr += currentChar;
                advance();
            }

            if (currentChar === ' ') break;
        }

        // pray this never hits you up in prod lmao, the issue should be resolved long before 
        // this error should ever get triggered, i think.
        if (inBrackets) throw Error('Bracket Pair not finished!');

        expressions.push(expr.trim());
    }

    while (!eol()) {
        simpleExpr();
    }
    return expressions;
}

// test.
console.log(
    parseExpressions('attribute nose default if_any(["no_blush", "nobl"])'),
);
