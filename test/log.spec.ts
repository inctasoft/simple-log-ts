import { describe, jest, expect, test, beforeEach } from '@jest/globals';
import { Log } from '../src/log';

// mock console output streams
const console_error = console.error = jest.fn()
const console_info = console.info = jest.fn()
const console_log = console.log = jest.fn()
const console_warn = console.warn = jest.fn()

const testLogMessage = "this is test log message"
const testCorrelationToken = "this is correlation id"
const env = process.env

beforeEach(() => {
    process.env = { ...env }
})

test.each`
LOGLEVEL    |expectedLogMethods 
${'DEBUG'}  |${['logdebug', 'loginfo', 'logwarn', 'logerror', 'logcrit']}
${'INFO'}   |${['loginfo', 'logwarn', 'logerror', 'logcrit']}
${'WARN'}   |${['logwarn', 'logerror', 'logcrit']}
${'ERROR'}  |${['logerror', 'logcrit']}
${'CRIT'}   |${['logcrit']}
${'OTHER'}  |${['logcrit']} // logcrit is always enabled, if LOGLEVEL is not part of supported values
    `("If LOGLEVEL=$LOGLEVEL then $expectedLogMethods methods are active",
    (args) => {
        const LOGLEVEL = args.LOGLEVEL as string;
        const expectedLogMethods = args.expectedLogMethods as string[];

        //ARRANGE
        process.env.LOGLEVEL = LOGLEVEL;
        const log = new Log(testCorrelationToken)

        // ACT
        log.debug(testLogMessage);
        log.info(testLogMessage);
        log.warn(testLogMessage);
        log.error(testLogMessage);
        log.crit(testLogMessage);

        // ASSERT logdebug
        if ((expectedLogMethods).includes('logdebug')) {
            expect(console.log).toBeCalledTimes(1);
            const actualCallArgumentsValidJson = JSON.parse(String(...console_log.mock.calls[0]));
            expect(actualCallArgumentsValidJson).toEqual(expect.objectContaining({
                timestamp: expect.any(Number),
                "data": `${testLogMessage}`,
                "correlation": testCorrelationToken,
                "level": "DEBUG"
            }))
        } else {
            expect(console.log).toBeCalledTimes(0)
        }

        // ASSERT loginfo
        if ((expectedLogMethods).includes('loginfo')) {
            expect(console.info).toBeCalledTimes(1);
            const actualCallArgumentsValidJson = JSON.parse(String(...console_info.mock.calls[0]));
            expect(actualCallArgumentsValidJson).toEqual(expect.objectContaining({
                timestamp: expect.any(Number),
                "data": `${testLogMessage}`,
                "correlation": testCorrelationToken,
                "level": "INFO"
            }))
        } else {
            expect(console.info).toBeCalledTimes(0)
        }

        // ASSERT logwarn
        if ((expectedLogMethods).includes('logwarn')) {
            expect(console.warn).toBeCalledTimes(1)
            const actualCallArgumentsValidJson = JSON.parse(String(...console_warn.mock.calls[0]));
            expect(actualCallArgumentsValidJson).toEqual(expect.objectContaining({
                timestamp: expect.any(Number),
                "data": `${testLogMessage}`,
                "correlation": testCorrelationToken,
                "level": "WARN"
            }))
        } else {
            expect(console.warn).toBeCalledTimes(0)
        }

        // ASSERT logerror
        let expectedConsoleErrCalls = 0;
        if (expectedLogMethods.includes('logerror')) {
            expectedConsoleErrCalls += 1;
            const actualCallArgumentsValidJson = JSON.parse(String(...console_error.mock.calls[expectedConsoleErrCalls-1]));
            expect(actualCallArgumentsValidJson).toEqual(expect.objectContaining({
                timestamp: expect.any(Number),
                "data": `${testLogMessage}`,
                "correlation": testCorrelationToken,
                "level": "ERROR"
            }))
        }

        // ASSERT logcrit
        if (expectedLogMethods.includes('logcrit')) {
            expectedConsoleErrCalls += 1;
            const actualCallArgumentsValidJson = JSON.parse(String(...console_error.mock.calls[expectedConsoleErrCalls-1]));
            expect(actualCallArgumentsValidJson).toEqual(expect.objectContaining({
                timestamp: expect.any(Number),
                "data": `${testLogMessage}`,
                "correlation": testCorrelationToken,
                "level": "CRIT"
            }))
        }

        // ASSERT how many times console.error was called, having in mind both CRIT and ERROR use it
        expect(console.error).toBeCalledTimes(expectedConsoleErrCalls)
    })
test("if correlation_id is not provided, 'UNKNOWN' is used", () => {
    const log = new Log() // no correlation_id provided
    log.warn(testLogMessage)
    expect(console.warn).toBeCalledTimes(1)
    const actualCallArgumentsValidJson = JSON.parse(String(...console_warn.mock.calls[0]));
    expect(actualCallArgumentsValidJson).toEqual(expect.objectContaining({
        timestamp: expect.any(Number),
        "data": `${testLogMessage}`,
        "correlation": "UNKNOWN",
        "level": "WARN"
    }))
})
test("if LOGLEVEL not defined, default level is WARN", () => {
    process.env.LOGLEVEL = undefined
    const log = new Log();

    log.debug(testLogMessage)
    log.info(testLogMessage)
    log.warn(testLogMessage)
    log.error(testLogMessage)
    log.crit(testLogMessage)

    expect(console.info).toBeCalledTimes(0)
    expect(console.log).toBeCalledTimes(0)
    expect(console.warn).toBeCalledTimes(1)
    expect(console.error).toBeCalledTimes(2) //1 for error, 1 for crit
})

const expectedCorrelationToken = 'THE TEST CORELLATION ID'
describe('setting correlation id', () => {
    test('by passing plain string', () => {
        const log = new Log(expectedCorrelationToken)
        expect(log.correlation_id).toBe(expectedCorrelationToken);
    });

    test('by passing object contining `correlation_id: sting`', () => {
        const log = new Log({ correlation_id: expectedCorrelationToken, someOtherProp: 'will not be used' })
        expect(log.correlation_id).toBe(expectedCorrelationToken);
    });
});