import { Group } from "./Group";

export class LayeredImage {
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
}