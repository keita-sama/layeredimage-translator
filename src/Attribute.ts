export type Asset = string | null;
export type LogicKeyword = 'if_any' | 'if_all' | 'if_not';
export type ReservedKeyword = 'always' | 'default' | 'null';

export class Attribute {
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
    setIfCondtion(type: LogicKeyword, conditons: string[]) {
        this[type] = conditons;
        return this;
    }
    setReservedProperty(type: ReservedKeyword, value: boolean) {
        this[type] = value;
        return this;
    }
}
