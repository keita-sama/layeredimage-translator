import fs from 'node:fs';
import { LayeredImage } from './src/LayeredImage';
import { Group } from './src/Group';
import {
    Attribute,
    Asset,
    LogicKeyword,
    ReservedKeyword,
} from './src/Attribute';

type UnparsedLayeredImage = { name: string; sentences: string[] };

const file = fs.readFileSync('./MPT/yuri_layeredimage.rpy').toString();
const splitFile: string[] = file
    .replace(/#.*$/gm, '') // Remove the comments.
    .replace(/\:/g, '')
    .split(/\r\n?|\n/) // split by new lines
    .map((x: string) => x.trim()) // trim tabs and empty content that might be left at the end of strings.
    .filter((x: string) => x); // remove empty

const imagesToParse: UnparsedLayeredImage[] = [];

for (let j = 0; j < splitFile.length - 1; j++) {
    const imageObj: UnparsedLayeredImage = { name: '', sentences: [] };
    if (splitFile[j].startsWith('layeredimage')) {
        imageObj.name = splitFile[j].split(' ').slice(1).join(' ');
        for (let k = j; k < splitFile.length - 1; k++) {
            // check if the NEXT line is a new image
            // if it is, cut group parsing so the new image can be made
            // sets the index at the current new image so the loop works
            j = k;
            if (splitFile[k + 1].startsWith('layeredimage')) {
                break;
            }
            if (k < splitFile.length - 1) {
                imageObj.sentences.push(splitFile[k]);
            }
        }
    }

    imagesToParse.push(imageObj);
}

const parsedImages = imagesToParse.map(parseLayeredImage);

// NOTE: re-enable this LATER
fs.writeFileSync(
    './parsed.json',
    JSON.stringify(imagesToParse.map(parseLayeredImage), null, 4),
);

function ifAny(test: string, if_any: string[] = []) {
    if (!if_any.length) return true;
    const eval_str = if_any.map((x) => `test.includes("${x}")`).join(' || ');

    return eval(eval_str);
}

function ifAll(test: string, if_all: string[] = []) {
    if (!if_all.length) return true;
    const eval_str = if_all.map((x) => `test.includes("${x}")`).join(' && ');

    return eval(eval_str);
}

function ifNot(test: string, if_not: string[] = []) {
    return !ifAny(test, if_not);
}

function parseLayeredImage({ name, sentences }: UnparsedLayeredImage) {
    const layeredimage = new LayeredImage(name);

    for (let i = 0; i < sentences.length - 1; i++) {
        if (sentences[i].startsWith('group')) {
            layeredimage.groups.push(parseGroup(sentences[i]));
            continue;
        }
        if (sentences[i].startsWith('attribute')) {
            // assume it' going in the most recent group;
            const attribute = parseAttribute(sentences[i], i);

            const lastGroup = layeredimage.getGroups().at(-1);

            if (lastGroup) {
                attribute.group = lastGroup.name;
                lastGroup.attributes.push(attribute);
            } else {
                // TODO: It should actually append its own group;
                attribute.group = attribute.name;
            }
        }
    }
    function parseGroup(groupSentence: string) {
        const items = groupSentence.split(' ');
        const logicKeywords: LogicKeyword[] = ['if_any', 'if_not', 'if_all'];

        // remove the word "group"
        items.shift();
        const group = new Group(items[0]);
        // remove the name;
        items.shift();

        if (!items.length) return group;

        for (const indentifier of items) {
            if (
                logicKeywords.some((keyword) => indentifier.startsWith(keyword))
            ) {
                const logicWord = indentifier.slice(0, 6);

                // This extracts the list of conditions using RegEx;
                const parsedConditions = indentifier.match(/\[.*\]/);

                if (!parsedConditions?.length)
                    throw Error("There's no condtions to parse.");
                const conditons = eval(parsedConditions[0]);
                group.setIfCondtion(logicWord as LogicKeyword, conditons);
                continue; // get back to this
            }
        }
        return group;
    }
    function parseAttribute(attrSentence: string, pos: number) {
        const splitAttr = attrSentence.split(' ');
        const attribute = new Attribute();

        let nulled = false;
        // TODO: 'default:' should be properly parsed;
        const reservedKeywords: ReservedKeyword[] = ['default', 'null'];
        const logicKeywords: LogicKeyword[] = ['if_any', 'if_not', 'if_all'];

        let isName = false;
        for (const indentifier of splitAttr) {
            if (indentifier === 'attribute') {
                isName = true;
                continue;
            }
            if (isName) {
                attribute.name = indentifier;
                isName = false;
                continue;
            }
            if (indentifier === 'always') {
                attribute.setReservedProperty('always', true);
                attribute.asset = splitAttr[1];
                break;
            }
            if (reservedKeywords.some((keyword) => keyword === indentifier)) {
                attribute.setReservedProperty(
                    indentifier as ReservedKeyword,
                    true,
                );
                if (indentifier !== 'null') continue;
                nulled = true;
                break;
            }
            if (
                logicKeywords.some((keyword) => indentifier.startsWith(keyword))
            ) {
                const logicWord = indentifier.slice(0, 6);

                // This extracts the list of conditions using RegEx;
                const parsedConditions = indentifier.match(/\[.*\]/);
                // console.log(parsedConditions)

                if (!parsedConditions?.length)
                    throw Error("There's no condtions to parse.");
                const conditons = eval(parsedConditions[0]);
                attribute.setIfCondtion(logicWord as LogicKeyword, conditons);
                continue; // get back to this
            }
        }

        if (!nulled) attribute.asset = sentences[pos + 1];
        return attribute;
    }
    return layeredimage;
}

class ShowImage {
    image: LayeredImage;
    tags: Attribute[];
    assets: Asset[];

    constructor(image: LayeredImage) {
        this.image = image;
        this.tags = [];
        this.assets = [];
    }
    getImageStatus() {
        return `${this.image.name} ${this.tags.map((x) => x.name).join(' ')}`;
    }
    addTag(attribute: Attribute) {
        // this.tags.push(name)
        this.tags.push(attribute);

        return this;
    }
    getTags() {
        return this.tags.map((tag) => tag.name);
    }
    initDefaultAttr() {
        let imageStatus = this.getImageStatus();
        const groups = this.image.getGroups();

        for (const group of groups) {
            imageStatus = this.getImageStatus();
            let [groupAny, groupAll, groupNot] = [true, true, true];
            if (group.if_any.length)
                groupAny = ifAny(imageStatus, group.if_any);
            if (group.if_all.length)
                groupAll = ifAll(imageStatus, group.if_all);
            if (group.if_not.length)
                groupNot = ifNot(imageStatus, group.if_not);

            // DEBUG: console.log(group.name, groupAny, groupAll, groupNot);

            // skip the group because it doesn't meet critera to add tags.
            if (!(groupAny && groupAll && groupNot)) continue;

            // console.log(group.name + ' added!');
            for (const attribute of group.getAttributes()) {
                if (!attribute.default) continue; // go to the next attribute
                imageStatus = this.getImageStatus();
                // if (imageStatus.attribute.name)

                // by default if there's no condition and it's default it's shown
                let [attrAny, attrAll, attrNot] = [true, true, true];

                if (attribute.if_any.length)
                    attrAny = ifAny(imageStatus, attribute.if_any);
                if (attribute.if_all.length)
                    attrAll = ifAll(imageStatus, attribute.if_all);
                if (attribute.if_not.length)
                    attrNot = ifNot(imageStatus, attribute.if_not);

                if (!(attrAny && attrAll && attrNot)) continue;

                this.addTag(attribute);

                if (attribute.asset) {
                    this.assets.push(attribute.asset); // NOTE: This is actually important
                } else {
                    this.assets.push(null);
                }
            }
        }
    }
    changeAttribute(name: string) {
        const imageStatus = this.getImageStatus();
        // const allAttributes = this.image.getAttributes();
        const changedAttribute: Attribute | undefined =
            this.image.getAttribute(name);

        if (!changedAttribute) return;
        const oldAttrIdx = this.tags.findIndex(
            (x: Attribute) => x.group === changedAttribute.group,
        );

        let [attrAny, attrAll, attrNot] = [true, true, true];

        if (changedAttribute.if_any.length)
            attrAny = ifAny(imageStatus, changedAttribute.if_any);
        if (changedAttribute.if_all.length)
            attrAll = ifAll(imageStatus, changedAttribute.if_all);
        if (changedAttribute.if_not.length)
            attrNot = ifNot(imageStatus, changedAttribute.if_not);

        if (attrAny && attrAll && attrNot) {
            if (oldAttrIdx !== -1) {
                this.tags[oldAttrIdx] = changedAttribute; // replace the attribute
            } else {
                this.tags.push(changedAttribute);
            }
            console.log(`[ACCEPTED!] ${changedAttribute.name}`)
        }
        else {
            console.log(`[REJECTED!] ${changedAttribute.name}`)
        }
    }
}

// console.log(parsedImages[0]);
const test = new ShowImage(parsedImages[0]);
test.initDefaultAttr();

console.log(test.getImageStatus());
test.changeAttribute('b1a');
test.changeAttribute('e1d');
test.changeAttribute('casual');
test.changeAttribute('rcut');
test.changeAttribute('rup');
console.log(test.getImageStatus());

// TODO: Recomputing of coditionals when attributes change.
