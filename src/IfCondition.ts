export function ifAny(attributeList: string, if_any: string[] = []) {
    if (!if_any.length) return true;

    return if_any.some((attr) => attributeList.includes(attr));
}

export function ifAll(attributeList: string, if_all: string[] = []) {
    if (!if_all.length) return true;

    return if_all.every((attr) => attributeList.includes(attr));
}

export function ifNot(test: string, if_not: string[] = []) {
    return !ifAny(test, if_not);
}