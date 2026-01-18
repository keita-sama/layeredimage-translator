class LayeredImage {
    name: string;
    groups: Group[];
    constructor(name: string) {
        this.name = name;
        this.groups = [];
    }
    addGroup(name: string) {
        this.groups.push(new Group(name));
    }
    getGroups() {
        return this.groups;
    }
    getLastGroup() {
        return this.groups.at(-1);
    }
    getAttributes() {
        return this.groups.map((group) => group.getAttributes()).flat();
    }
    getAttribute(name: string) {
        return this.getAttributes().find((attr) => attr.name === name);
    }
    listAttributes() {
        return this.groups.map((group) => group.listAttributes()).flat();
    }
    // get
}

type Asset = string | null;
// not gonna use this.

class Group {
    name: string;
    attributes: Attribute[];

    if_any: string[];
    if_all: string[];
    if_not: string[];

    constructor(name: string) {
        this.name = name;
        this.attributes = [];

        this.if_any = [];
        this.if_all = [];
        this.if_not = [];
    }

    getLastAttr() {
        return this.attributes.at(-1);
    }
    listAttributes() {
        return this.attributes.map((attr) => attr.name);
    }
    getAttributes() {
        return this.attributes;
    }
    getAttribute(name: string) {
        return this.attributes.find((x) => x.name);
    }
}

class Attribute {
    always?: boolean;
    asset: Asset;
    group?: string;

    name: string;
    default: boolean;
    null: boolean;

    if_any: string[];
    if_all: string[];
    if_not: string[];

    constructor() {
        this.always;

        this.name = ''; // represents this attributes name.
        this.default = false;
        this.null = false; // this just means there won't be an asset. tends to be no logic
        // represents logical strings.
        this.if_any = [];
        this.if_all = [];
        this.if_not = [];

        this.asset = null;
    }
}

const fs = require('node:fs');

const file = fs.readFileSync('./MPT/sayori_layeredimage.rpy').toString();

const splitFile: string[] = file
    .replace(/#.*$/gm, '') // Remove the comments.
    .replace(/\:/g, '')
    .split(/\r\n?|\n/) // split by new lines
    .map((x: string) => x.trim()) // trim tabs and empty content that might be left at the end of strings.
    .filter((x: string) => x); // remove empty

type UnparsedLayeredImage = { name: string; sentences: string[] };

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

function ifAny(test: string, if_any = []) {
    if (!if_any.length) return true;
    const eval_str = if_any.map((x) => `test.includes("${x}")`).join(' || ');

    return eval(eval_str);
}

function ifAll(test: string, if_all = []) {
    if (!if_all.length) return true;
    const eval_str = if_all.map((x) => `test.includes("${x}")`).join(' && ');

    return eval(eval_str);
}

function ifNot(test: string, if_not = []) {
    return !ifAny(test, if_not);
}

type Tag = { name: string; group: string };


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
        return [this.image.name, this.tags.map((x) => x.name).join(' ')].join(
            ' ',
        );
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
            if (group.if_any.length) {

                groupAny = ifAny(imageStatus, group.if_any);
            }
            if (group.if_all.length)
                groupAll = ifAll(imageStatus, group.if_all);
            if (group.if_not.length)
                groupNot = ifNot(imageStatus, group.if_not);

            // console.log(group.name, groupAny, groupAll, groupNot);

            // skip the group because it doesn't meet critera to add tags.
            if (!(groupAny && groupAll && groupNot)) continue;

            // console.log(group.name + ' added!');
            for (const attribute of group.getAttributes()) {
                if (!attribute.default) continue; // go to the next attribute
                imageStatus = this.getImageStatus();
                // if (imageStatus.attribute.name)

                let [attrAny, attrAll, attrNot] = [true, true, true]; // by default if there's no condition and it's default it's shown

                if (attribute.if_any.length)
                    attrAny = ifAny(imageStatus, attribute.if_any);
                if (attribute.if_all.length)
                    attrAll = ifAll(imageStatus, attribute.if_all);
                if (attribute.if_not.length)
                    attrNot = ifNot(imageStatus, attribute.if_not);

                if (!(attrAny && attrAll && attrNot)) continue;

                this.tags.push(attribute);

                if (attribute.asset) {
                    this.assets.push(attribute.asset); // NOTE: This is actually important
                }
                else {
                    this.assets.push(null)
                }
            }
        }
    }
    changeAttribute(name: string) {
        const attr: Attribute = this.image.getAttribute(name);

        const oldAttrIdx = this.tags.findIndex((x: Attribute) => x.group === attr.group);
        if (oldAttrIdx !== -1) {
            this.tags[oldAttrIdx] = attr; // replace the attribute
        }
    }
}

const test = new ShowImage(parsedImages[0]);

test.initDefaultAttr();

console.log(test.getTags());
test.changeAttribute('b1a');
test.changeAttribute('e1d');
test.changeAttribute('casual');
test.changeAttribute('rup');
console.log(test.getTags());

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
            attribute.group = layeredimage.getLastGroup().name
                ? layeredimage.getLastGroup().name
                : attribute.name;
            layeredimage.getLastGroup().attributes.push(attribute);
        }
    }
    function parseGroup(groupSentence: string) {
        const items = groupSentence.split(' ');
        const logicKeywords = ['if_any', 'if_not', 'if_all'];

        items.shift(); // remove the group
        const group = new Group(items[0]);
        items.shift();

        if (!items.length) return group;

        for (let word of items) {
            if (logicKeywords.includes(word.slice(0, 6))) {
                const logicWord = word.slice(0, 6);
                const conditons = eval(word.match(/\[.*\]/)[0]);
                group[logicWord] = conditons;
                continue; // get back to this
            }
        }

        return group;
    }
    function parseAttribute(attrSentence: string, pos: number) {
        let splitAttr = attrSentence.split(' ');
        const attribute = new Attribute();

        let nulled = false;
        // TODO: 'default:' should be properly parsed;
        const reservedKeywords = ['default', 'null'];
        const logicKeywords = ['if_any', 'if_not', 'if_all'];

        // TODO: slice first two elements, THEN parse.
        for (let word of splitAttr) {
            if (word === 'always') {
                attribute.always = true;
                attribute.asset = splitAttr[1];
                break;
            }
            if (word === 'attribute') continue;
            if (reservedKeywords.includes(word)) {
                attribute[word] = true;
                if (word === 'null') {
                    nulled = true;
                    break;
                } else {
                    continue;
                }
            }
            if (logicKeywords.includes(word.slice(0, 6))) {
                const logicWord = word.slice(0, 6);
                const conditons = eval(word.match(/\[.*\]/)[0]);
                attribute[logicWord] = conditons;
                continue; // get back to this
            }

            // if its not any of the above assume it's the attribute name
            attribute.name = word;
        }

        if (!nulled) attribute.asset = sentences[pos + 1];

        return attribute;
    }
    return layeredimage;
}
