export const transform = (value: any, printMapSetTypes: boolean) => {
    let transformed = value;
    if (typeof value === 'object') {
        if (value instanceof Error) {
            transformed = transformError(value);
        } else if (Array.isArray(value)) {
            transformed = transformArray(value, printMapSetTypes);
        } else if (value instanceof Date) {
            transformed = value.toISOString();
        } else if (value instanceof Map) {
            transformed = transformMap(value, printMapSetTypes);
        } else if (value instanceof Set) {
            transformed = transformSet(value, printMapSetTypes);
        } else {
            transformed = transformObject(value, printMapSetTypes);
        }
    }
    return transformed;
}

export const transformObject = (obj: Record<string, any>, printMapSetTypes: boolean) => {
    const transformed = Object.entries(obj).reduce<Record<string, any>>((accum, [objKey, objValue]) => {
        if (typeof objValue === 'object') {
            accum[objKey] = transform(objValue, printMapSetTypes)
        } else {
            accum[objKey] = objValue
        }
        return accum
    }, {});
    return transformed
};

export const transformMap = (map: Map<any, any>, printMapSetTypes: boolean) => {
    const transformed = Array.from(map.entries()).reduce<Record<string, any>>((accum, [mapKey, mapValue]) => {
        if (typeof mapValue === 'object') {
            accum[mapKey] = transform(mapValue, printMapSetTypes)
        } else {
            accum[mapKey] = mapValue
        }
        return accum
    }, {});
    return printMapSetTypes ? { "[Map]": transformed } : transformed
};

export const transformSet = (set: Set<any> | Array<any>, printMapSetTypes: boolean) => {
    const transformed = Array.from(set).map((setElem: any): Array<any> => {
        if (typeof setElem === 'object') {
            return transform(setElem, printMapSetTypes);
        }
        return setElem;
    });
    return printMapSetTypes ? { "[Set]": transformed } : transformed
};

export const transformArray = (arr: Array<any>, printMapSetTypes: boolean) => {
    const transformed = Array.from(arr).map((arrElem: any): Array<any> => {
        if (typeof arrElem === 'object') {
            return transform(arrElem, printMapSetTypes);
        }
        return arrElem;
    });
    return transformed
};

export const transformError = (err: Error) => ({
    "[Error]": Object.getOwnPropertyNames(err).reduce((accum, key) => ({
        ...accum,
        // @ts-ignore
        [key]: err[key]
    }), {})
});