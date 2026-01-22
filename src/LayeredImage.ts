import { Group } from "./Group";

export class LayeredImage {
    name: string;
    groups: Group[];
    constructor(name: string) {
        this.name = name;
        this.groups = [];
    }
    // return the group;
    addGroup(name: string) {
        this.groups.push(new Group(name));
        return this.getGroups().at(-1);
    }
    getGroups() {
        return this.groups;
    }
    getAttributes() {
        return this.groups.map((group) => group.getAttributes()).flat();
    }
    getAttribute(name: string) {
        return this.getAttributes().find((attr) => attr.name === name);
    }
    getMatchingAttributes(name: string) {
        return this.getAttributes().filter((attr) => attr.name === name);
    }
    listAttributes() {
        return this.groups.map((group) => group.listAttributes()).flat();
    }
}