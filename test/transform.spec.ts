import { expect, test } from '@jest/globals';
import { Transform, inddexedClass } from '../src/transform';
import { inspect } from 'util';
import { doesNotMatch } from 'assert';

const tDefault = new Transform({inspectOptions: {}, printMapSetTypes: false}) as Transform & inddexedClass;
const tPrintingTypes = new Transform({inspectOptions: {}, printMapSetTypes: true }) as Transform & inddexedClass;

test('unsupported types are transformed by transformObject', () => {
    const transformObjectSpy = jest.spyOn(tDefault, 'obj');
    tDefault.transform(Buffer.from('some string'));
    expect(transformObjectSpy).toBeCalledTimes(1);
});


test('transforms Date to ISOString', () => {
    const testDate = new Date();
    expect(tDefault.transform(testDate)).toEqual(testDate.toISOString());
    expect(tPrintingTypes.transform(testDate)).toEqual(testDate.toISOString());
});

test('map', () => {
    const a = new Map<any, any>([['a', 1]])
    a.set('b', a);
    expect(tDefault.map(a)).toEqual(inspect(a));
    expect(tPrintingTypes.map(a)).toEqual(inspect(a));
});

test('arr', () => {
    expect(tDefault.arr(['a'])).toEqual(['a']);
    expect(tPrintingTypes.arr(['a', new Map([['b', 2]])])).toEqual(['a', { "[Map]": { b: 2 } }]);
});

test('set', () => {
    expect(tDefault.set(new Set(['a', new Map([['b', 2]])]))).toEqual(['a', { b: 2 }]);
    expect(tPrintingTypes.set(new Set(['a', new Map([['b', 2]])]))).toEqual({ "[Set]": ['a', { "[Map]": { b: 2 } }] });
});

test('obj', () => {
    expect(tDefault.obj({ a: 1, b: new Set(['b', 'c']) })).toEqual({ a: 1, b: ['b', 'c'] });
    expect(tPrintingTypes.obj({ a: 1, b: new Set(['b', 'c']) })).toEqual({ a: 1, b: { "[Set]": ['b', 'c'] } });
});


test('err', () => {
    const testErrorMsg = "error message";
    const expected = { "[Error]": { message: testErrorMsg, stack: expect.stringContaining("Error:") } }
    // despite config, errors are printed the same
    expect(tDefault.err(new Error('error message'))).toEqual(expected);
    expect(tPrintingTypes.err(new Error('error message'))).toEqual(expected);
    expect(tDefault.transform(new Error('error message'))).toEqual(expected);
    expect(tPrintingTypes.transform(new Error('error message'))).toEqual(expected);
});

describe('handles circular reference', () => {
    test.each(Object.keys(tDefault))("%s",
        (transformMethod: string, doneCb) => {
            const obj: any = {};
            obj.a = [obj];
            obj.b = {};
            obj.b.inner = obj.b;
            obj.b.obj = obj;
            expect(() => tDefault[transformMethod](obj)).not.toThrow();
            if (transformMethod === 'err') {
                return doneCb(); // 'Error' objects assumed with {stack, message}, never having circular
            }
            expect(tDefault[transformMethod](obj)).toEqual(inspect(obj));
            doneCb();
        });
});

