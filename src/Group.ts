import { Attribute } from './Attribute';
import { LogicKeyword } from './Attribute';

export class Group {
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
    listAttributes() {
        return this.attributes.map((attr) => attr.name);
    }
    getAttributes() {
        return this.attributes;
    }
    getMatchingAttributes(name: string) {
        return this.getAttributes().filter((attr) => attr.name === name);
    }
    setIfCondtion(type: LogicKeyword, conditons: string[]) {
        this[type] = conditons;
    }
}
