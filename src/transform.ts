import { InspectOptions, inspect } from "util";

export const _configSymbol = Symbol('_configSymbol');

export type TransformConfig = {
    printMapSetTypes: boolean,
    inspectOptions: InspectOptions
}

export type inddexedClass = {
    [key: string]: Function
}

export class Transform {
    // using Symbol makes Transform config prop not iterable
    // leaving all Transform iterable props being tranform methods
    [_configSymbol]: TransformConfig;

    constructor(config: TransformConfig) {
        this[_configSymbol] = {
            printMapSetTypes: config.printMapSetTypes,
            inspectOptions: config.inspectOptions
        }
    }

    public transform = (value: any) => {
        let transformed = value;
        if (typeof value === 'object') {
            if (value instanceof Error) {
                transformed = this.err(value);
            } else if (Array.isArray(value)) {
                transformed = this.arr(value);
            } else if (value instanceof Date) {
                transformed = value.toISOString();
            } else if (value instanceof Map) {
                transformed = this.map(value);
            } else if (value instanceof Set) {
                transformed = this.set(value);
            } else {
                transformed = this.obj(value);
            }
        }
        return transformed;
    }

    public obj = (obj: Record<string, any>) => {
        const incpectResult = inspect(obj, this[_configSymbol].inspectOptions.showHidden, this[_configSymbol].inspectOptions.depth, this[_configSymbol].inspectOptions.colors);
        if (/\[Circular\s\*\d+\]/.test(incpectResult)) {
            return incpectResult;
        }
        const transformed = Object.entries(obj).reduce<Record<string, any>>((accum, [objKey, objValue]) => {
            if (typeof objValue === 'object') {
                accum[objKey] = this.transform(objValue)
            } else {
                accum[objKey] = objValue
            }
            return accum
        }, {});
        return transformed
    };

    public map = (map: Map<any, any>) => {
        const incpectResult = inspect(map, this[_configSymbol].inspectOptions.showHidden, this[_configSymbol].inspectOptions.depth, this[_configSymbol].inspectOptions.colors);
        if (/\[Circular\s\*\d+\]/.test(incpectResult)) {
            return incpectResult;
        }
        const transformed = Array.from(map.entries()).reduce<Record<string, any>>((accum, [mapKey, mapValue]) => {
            if (typeof mapValue === 'object') {
                accum[mapKey] = this.transform(mapValue)
            } else {
                accum[mapKey] = mapValue
            }
            return accum
        }, {});
        return this[_configSymbol].printMapSetTypes ? { "[Map]": transformed } : transformed
    };

    public set = (set: Set<any>) => {
        const incpectResult = inspect(set, this[_configSymbol].inspectOptions.showHidden, this[_configSymbol].inspectOptions.depth, this[_configSymbol].inspectOptions.colors);
        if (/\[Circular\s\*\d+\]/.test(incpectResult)) {
            return incpectResult;
        }
        const transformed = Array.from(set).map((setElem: any): Array<any> => {
            if (typeof setElem === 'object') {
                return this.transform(setElem);
            }
            return setElem;
        });
        return this[_configSymbol].printMapSetTypes ? { "[Set]": transformed } : transformed
    };

    public arr = (arr: Array<any>) => {
        const incpectResult = inspect(arr, this[_configSymbol].inspectOptions.showHidden, this[_configSymbol].inspectOptions.depth, this[_configSymbol].inspectOptions.colors);
        if (/\[Circular\s\*\d+\]/.test(incpectResult)) {
            return incpectResult;
        }
        const transformed = Array.from(arr).map((arrElem: any): Array<any> => {
            if (typeof arrElem === 'object') {
                return this.transform(arrElem);
            }
            return arrElem;
        });
        return transformed
    };

    public err = (err: Error) => ({
        "[Error]": {
            message: err.message,
            stack: err.stack
        }
    });
}