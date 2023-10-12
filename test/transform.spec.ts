import { expect, test } from '@jest/globals';
import { transform, transformArray, transformError, transformMap, transformObject, transformSet } from '../src/transform';
import * as transformModule from '../src/transform';

describe('transform', () => {
    test('unsupported types are transformed by transformObject', () => {
        const transformObjectSpy = jest.spyOn(transformModule, 'transformObject');
        transform(Buffer.from('some string'), false);
        expect(transformObjectSpy).toBeCalledTimes(1);
    });
});

test('transformMap', () => {
    expect(transformMap(new Map([['a', 1]]), false)).toEqual({ a: 1 });
    expect(transformMap(new Map([['a', 1]]), true)).toEqual({ "[Map]": { a: 1 } });
});

test('transformArray', () => {
    expect(transformArray(['a'], false)).toEqual(['a']);
    expect(transformArray(['a', new Map([['b', 2]])], true)).toEqual(['a', { "[Map]": { b: 2 } }]);
});

test('transformSet', () => {
    expect(transformSet(new Set(['a', new Map([['b', 2]])]), false)).toEqual(['a', { b: 2 }]);
    expect(transformSet(new Set(['a', new Map([['b', 2]])]), true)).toEqual({ "[Set]": ['a', { "[Map]": { b: 2 } }] });
});

test('transformObject', () => {
    expect(transformObject({ a: 1, b: new Set(['b', 'c']) }, false)).toEqual({ a: 1, b: ['b', 'c'] });
    expect(transformObject({ a: 1, b: new Set(['b', 'c']) }, true)).toEqual({ a: 1, b: { "[Set]": ['b', 'c'] } });
});

test('transformError', () => {
    expect(transformError(new Error('error message'))).toEqual({ "[Error]": { message: "error message", stack: expect.stringContaining("Error:") } });
});