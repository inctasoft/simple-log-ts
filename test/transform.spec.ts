import { expect, test } from '@jest/globals';
import { Transform } from '../src/transform';

const tDefault = new Transform();
const tPrintingTypes = new Transform({ printMapSetTypes: true });

test('unsupported types are transformed by transformObject', () => {
    const t = new Transform();
    const transformObjectSpy = jest.spyOn(t, 'obj');
    t.transform(Buffer.from('some string'));
    expect(transformObjectSpy).toBeCalledTimes(1);
});

it('Does not handle circular reference', () => {
    const a: any = { a: 1 }
    Object.assign(a, { b: a });
    expect(() => tDefault.transform(a)).toThrow("Maximum call stack size exceeded");
});

test('transforms Date to ISOString', () => {
    const testDate = new Date();
    expect(tDefault.transform(testDate)).toEqual(testDate.toISOString());
    expect(tPrintingTypes.transform(testDate)).toEqual(testDate.toISOString());
});

test('map', () => {
    expect(tDefault.map(new Map([['a', 1]]))).toEqual({ a: 1 });
    expect(tPrintingTypes.map(new Map([['a', 1]]))).toEqual({ "[Map]": { a: 1 } });
});

test('array', () => {
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

