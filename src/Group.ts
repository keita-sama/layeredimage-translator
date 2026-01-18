import { Attribute } from "./Attribute";
import { LogicKeyword } from "./Attribute";

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
    setIfCondtion(type: LogicKeyword, conditons: string[]) {
        this[type] = conditons;
    }
}