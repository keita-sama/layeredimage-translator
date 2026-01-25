import fs from 'node:fs';
import { LayeredImage } from './src/LayeredImage';
import { Group } from './src/Group';
import {
    Attribute,
    Asset,
    LogicKeyword,
    ReservedKeyword,
} from './src/Attribute';
import { ifAny, ifAll, ifNot } from './src/IfCondition';
import { parseExpressions } from './silly';
import { GroupedLines } from './src/GroupedLines';

type UnparsedLayeredImage = { name: string; lines: GroupedLines };

const file = fs.readFileSync('./MPT/sayori_layeredimage.rpy').toString();
const splitFile: string[] = file
    .replace(/#.*$/gm, '') // Remove the comments.
    .replace(/\:/g, '')
    .split(/\r\n?|\n/) // split by new lines
    .map((x: string) => x.trim()) // trim tabs and empty content that might be left at the end of strings.
    .filter((x: string) => x); // remove empty

const unparsedlayeredImages: UnparsedLayeredImage[] = [];
const fileText = new GroupedLines(splitFile);

while (!fileText.eof()) {
    const layeredImageObj: UnparsedLayeredImage = {
        name: '',
        lines: new GroupedLines(),
    };

    if (fileText.currentLine?.startsWith('layeredimage')) {
        layeredImageObj.name = fileText.currentLine.slice(
            'layeredimage'.length + 1,
        );
        fileText.advance();
        let parsingImage = true;
        while (!fileText.eof() && parsingImage === true) {
            layeredImageObj.lines.addLine(fileText.currentLine);
            fileText.advance();
            if (fileText.currentLine?.startsWith('layeredimage'))
                parsingImage = false;
        }
    }

    unparsedlayeredImages.push(layeredImageObj);
    // fileText.advance();
}

console.log(unparsedlayeredImages);
