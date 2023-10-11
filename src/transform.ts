export const transform = (value: any, printTypes: boolean) => {
    let transformed = value;
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            transformed = transformArray(value, printTypes);
        } else if (value instanceof Date) {
            transformed = printTypes ? { "[Date]": value.toISOString() } : value.toISOString();
        } else if (value instanceof Map) {
            transformed = transformMap(value, printTypes);
        } else if (value instanceof Set) {
            transformed = transformSet(value, printTypes);
        } else {
            transformed = transformObject(value, printTypes);
        }
    }
    return transformed;
}

export const transformObject = (obj: Record<string, any>, printTypes: boolean) => {
    const transformed = Object.entries(obj).reduce<Record<string, any>>((accum, [objKey, objValue]) => {
        if (typeof objValue === 'object') {
            accum[objKey] = transform(objValue, printTypes)
        } else {
            accum[objKey] = objValue
        }
        return accum
    }, {});
    return printTypes ? { "[Object]": transformed } : transformed
};

export const transformMap = (map: Map<any, any>, printTypes: boolean) => {
    const transformed = Array.from(map.entries()).reduce<Record<string, any>>((accum, [mapKey, mapValue]) => {
        if (typeof mapValue === 'object') {
            accum[mapKey] = transform(mapValue, printTypes)
        } else {
            accum[mapKey] = mapValue
        }
        return accum
    }, {});
    return printTypes ? { "[Map]": transformed } : transformed
};

export const transformSet = (set: Set<any> | Array<any>, printTypes: boolean) => {
    const transformed = Array.from(set).map((setElem: any): Array<any> => {
        if (typeof setElem === 'object') {
            return transform(setElem, printTypes);
        }
        return setElem;
    });
    return printTypes ? { "[Set]": transformed } : transformed
};

export const transformArray = (arr: Array<any>, printTypes: boolean) => {
    const transformed = Array.from(arr).map((arrElem: any): Array<any> => {
        if (typeof arrElem === 'object') {
            return transform(arrElem, printTypes);
        }
        return arrElem;
    });
    return printTypes ? { "[Array]": transformed } : transformed
};