import { describe, jest, expect, test, beforeEach } from '@jest/globals';
import { Log } from '../src/log';

jest.mock('console');
console.error = jest.fn()
console.info = jest.fn()
console.log = jest.fn()
const console_warn = console.warn = jest.fn()
const IsoDateMatcher = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const logMetadataMatcher = (level: string) => ({
    timestamp: expect.stringMatching(IsoDateMatcher),
    "correlation": testCorrelationToken,
    "level": level
});

const testLogDataString = "this is test log message";
const testCorrelationToken = "this is correlation id";
const env = process.env;

const testMap = new Map<any, any>([
    ['a', 1], ['b', new Date()],
    ['nestedMap', new Map<any, any>([
        ['c', 3], ['nestedSet', new Set([1, new Map<any, any>([
            ['deep_nested_map_key1', 1], ['deep_nested_map_key2', new Set(['deep_nested_set_elem1', 'deep_nested_set_elem2'])]])])]])]
]);
const testObject = { prop1: testMap, prop2: [1, { nested: 2 }] };
const testSet = new Set<any>([testMap, testObject, 'test_set_elem']);

beforeEach(() => {
    process.env = { ...env }
})
describe('process.env.LOGLEVEL', () => {

    test.each`
    LOGLEVEL    |expectedLogMethods 
    ${'DEBUG'}  |${['logdebug', 'loginfo', 'logwarn', 'logerror', 'logcrit']}
    ${'INFO'}   |${['loginfo', 'logwarn', 'logerror', 'logcrit']}
    ${'WARN'}   |${['logwarn', 'logerror', 'logcrit']}
    ${'ERROR'}  |${['logerror', 'logcrit']}
    ${'CRIT'}   |${['logcrit']}
    ${'ANY_OTHER'}  |${['logcrit']} // logcrit is always enabled, even if LOGLEVEL is not part of supported values
        `("$LOGLEVEL activates $expectedLogMethods",
        (args) => {
            const LOGLEVEL = args.LOGLEVEL as string;
            const expectedLogMethods = args.expectedLogMethods as string[];

            //ARRANGE
            process.env.LOGLEVEL = LOGLEVEL;
            const log = new Log(testCorrelationToken)

            // ACT
            log.debug(testLogDataString);
            log.info(testLogDataString);
            log.warn(testLogDataString);
            log.error(testLogDataString);
            log.crit(testLogDataString);

            // ASSERT logdebug
            if ((expectedLogMethods).includes('logdebug')) {
                expect(console.log).toBeCalledTimes(1);
            } else {
                expect(console.log).toBeCalledTimes(0)
            }

            // ASSERT loginfo
            if ((expectedLogMethods).includes('loginfo')) {
                expect(console.info).toBeCalledTimes(1);
            } else {
                expect(console.info).toBeCalledTimes(0)
            }

            // ASSERT logwarn
            if ((expectedLogMethods).includes('logwarn')) {
                expect(console.warn).toBeCalledTimes(1)
            } else {
                expect(console.warn).toBeCalledTimes(0)
            }

            // ASSERT how many times console.error was called, having in mind both CRIT and ERROR use it
            let expectedConsoleErrCalls = 0;
            if (expectedLogMethods.includes('logerror')) {
                expectedConsoleErrCalls += 1;
            }
            if (expectedLogMethods.includes('logcrit')) {
                expectedConsoleErrCalls += 1;
            }
            expect(console.error).toBeCalledTimes(expectedConsoleErrCalls)
        });
    test("if LOGLEVEL is undefined, default level is WARN", () => {
        process.env.LOGLEVEL = undefined
        const log = new Log();

        log.debug(testLogDataString)
        log.info(testLogDataString)
        log.warn(testLogDataString)
        log.error(testLogDataString)
        log.crit(testLogDataString)

        expect(console.info).toBeCalledTimes(0)
        expect(console.log).toBeCalledTimes(0)
        expect(console.warn).toBeCalledTimes(1)
        expect(console.error).toBeCalledTimes(2) //1 for error, 1 for crit
    });
});

describe('setting correlation id', () => {
    test('by passing plain string', () => {
        const log = new Log(testCorrelationToken)
        expect(log.correlation_id).toBe(testCorrelationToken);
    });

    test('by passing object contining `correlation_id: sting`', () => {
        const log = new Log({ correlation_id: testCorrelationToken, someOtherProp: 'will not be used' })
        expect(log.correlation_id).toBe(testCorrelationToken);
    });

    test("if correlation_id is not provided, 'UNKNOWN' is used", () => {
        const log = new Log() // no correlation_id provided
        expect(log.correlation_id).toBe('UNKNOWN');
    });
});

describe('objects logging depending on printTypes flag', () => {
    describe('(default) when config.printTypes = false', () => {
        const expectTransformed_testMap = {
            "a": 1,
            "b": expect.stringMatching(IsoDateMatcher),
            "nestedMap": {
                "c": 3,
                "nestedSet": [1, {
                    "deep_nested_map_key1": 1,
                    "deep_nested_map_key2": [
                        'deep_nested_set_elem1',
                        'deep_nested_set_elem2'
                    ]
                }]
            }
        };
        const expectTranformed_testObject = {
            prop1: expectTransformed_testMap,
            prop2: [1, { nested: 2 }]
        };
        const expectTranformed_testSet = [expectTransformed_testMap, expectTranformed_testObject, 'test_set_elem'];

        test('Date', () => {
            const expectedJsonLogged = {
                ...logMetadataMatcher("WARN"),
                message: expect.stringMatching(IsoDateMatcher)
            };
            const log = new Log(testCorrelationToken)
            log.warn(new Date());
            const actualCallArgumentsValidJson = JSON.parse(String(console_warn.mock.calls[0][0]));
            expect(actualCallArgumentsValidJson).toEqual(expectedJsonLogged);
        });

        test('Map', () => {
            const expected = {
                ...logMetadataMatcher("WARN"),
                message: expectTransformed_testMap
            };
            const log = new Log(testCorrelationToken)
            log.warn(testMap);
            const actualCallArgumentsValidJson = JSON.parse(String(console_warn.mock.calls[0][0]));
            expect(actualCallArgumentsValidJson).toEqual(expected);
        });

        test('Object', () => {

            const expectedJsonLogged = {
                ...logMetadataMatcher("WARN"),
                message: expectTranformed_testObject
            };

            const log = new Log(testCorrelationToken)
            log.warn(testObject);

            const actualCallArgumentsValidJson = JSON.parse(String(console_warn.mock.calls[0][0]));
            expect(actualCallArgumentsValidJson).toEqual(expectedJsonLogged);
        });

        test('Set', () => {
            const expectedJsonLogged = {
                ...logMetadataMatcher("WARN"),
                message: expectTranformed_testSet
            };
            const log = new Log(testCorrelationToken)
            log.warn(testSet);
            const actualCallArgumentsValidJson = JSON.parse(String(console_warn.mock.calls[0][0]));
            expect(actualCallArgumentsValidJson).toEqual(expectedJsonLogged);
        });
    });

    describe('when config.printTypes = true', () => {
        const expectTransformed_testMap = {
            "[Map]": {
                "a": 1,
                "b": {
                    "[Date]": expect.stringMatching(IsoDateMatcher),
                },
                "nestedMap": {
                    "[Map]": {
                        "c": 3,
                        "nestedSet": {
                            "[Set]": [
                                1, {
                                    "[Map]": {
                                        "deep_nested_map_key1": 1,
                                        "deep_nested_map_key2": {
                                            "[Set]": [
                                                "deep_nested_set_elem1",
                                                "deep_nested_set_elem2",
                                            ],
                                        },
                                    },
                                }
                            ]
                        }
                    }
                }
            }
        };
        const expectTranformed_testObject = {
            "[Object]": {
                prop1: expectTransformed_testMap,
                prop2: {
                    "[Array]": [1, { "[Object]": { nested: 2 } }]
                }
            }
        };
        const expectTranformed_testSet = {
            "[Set]": [expectTransformed_testMap, expectTranformed_testObject, 'test_set_elem']
        };

        test('Date', () => {
            const expectedJsonLogged = {
                ...logMetadataMatcher("WARN"),
                message: { "[Date]": expect.stringMatching(IsoDateMatcher) }
            };

            const log = new Log({ correlation_id: testCorrelationToken, printTypes: true });
            log.warn(new Date());

            const actualCallArgumentsValidJson = JSON.parse(String(console_warn.mock.calls[0][0]));
            expect(actualCallArgumentsValidJson).toEqual(expectedJsonLogged);
        });

        test('Map', () => {
            const expected = {
                ...logMetadataMatcher("WARN"),
                message: expectTransformed_testMap
            };
            const log = new Log({ correlation_id: testCorrelationToken, printTypes: true });
            log.warn(testMap);
            const actualCallArgumentsValidJson = JSON.parse(String(console_warn.mock.calls[0][0]));
            expect(actualCallArgumentsValidJson).toEqual(expected);
        });

        test('Object', () => {

            const expectedJsonLogged = {
                ...logMetadataMatcher("WARN"),
                message: expectTranformed_testObject
            };

            const log = new Log({ correlation_id: testCorrelationToken, printTypes: true });
            log.warn(testObject);

            const actualCallArgumentsValidJson = JSON.parse(String(console_warn.mock.calls[0][0]));
            expect(actualCallArgumentsValidJson).toEqual(expectedJsonLogged);
        });

        test('Set', () => {
            const expectedJsonLogged = {
                ...logMetadataMatcher("WARN"),
                message: expectTranformed_testSet
            };
            const log = new Log({ correlation_id: testCorrelationToken, printTypes: true });
            log.warn(testSet);
            const actualCallArgumentsValidJson = JSON.parse(String(console_warn.mock.calls[0][0]));
            expect(actualCallArgumentsValidJson).toEqual(expectedJsonLogged);
        });
    });
});