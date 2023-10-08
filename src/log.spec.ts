import { describe, jest, expect, test, beforeEach } from '@jest/globals';
import { Log } from './log';

// mock console output streams
console.error = jest.fn()
console.info = jest.fn()
console.log = jest.fn()
console.warn = jest.fn()

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
    `("If LOGLEVEL=$LOGLEVEL then $expectedLogMethods methods are active",
    ({ LOGLEVEL, expectedLogMethods }) => {
        //ARRANGE
        process.env.LOGLEVEL = LOGLEVEL as string;
        const log = new Log(testCorrelationToken)

        // ACT
        log.debug(testLogMessage);
        log.info(testLogMessage);
        log.warn(testLogMessage);
        log.error(testLogMessage);
        log.crit(testLogMessage);

        // ASSERT logdebug
        if ((expectedLogMethods as string[]).includes('logdebug')) {
            expect(console.log).toBeCalledTimes(1)
            expect(console.log).toBeCalledWith(expect.objectContaining({ timestamp: expect.any(Number), "data": `'${testLogMessage}'`, "correlation": testCorrelationToken, "level": "DEBUG" }))
        } else {
            expect(console.log).toBeCalledTimes(0)
        }
        // ASSERT loginfo
        if ((expectedLogMethods as string[]).includes('loginfo')) {
            expect(console.info).toBeCalledTimes(1)
            expect(console.info).toBeCalledWith(expect.objectContaining({ timestamp: expect.any(Number), "data": `'${testLogMessage}'`, "correlation": testCorrelationToken, "level": "INFO" }))
        } else {
            expect(console.info).toBeCalledTimes(0)
        }

        // ASSERT logwarn
        if ((expectedLogMethods as string[]).includes('logwarn')) {
            expect(console.warn).toBeCalledTimes(1)
            expect(console.warn).toBeCalledWith(expect.objectContaining({ timestamp: expect.any(Number), "data": `'${testLogMessage}'`, "correlation": testCorrelationToken, "level": "WARN" }))
        } else {
            expect(console.warn).toBeCalledTimes(0)
        }

        // ASSERT logerror
        expect(console.error).toBeCalledTimes((expectedLogMethods as string[]).includes('logerror')
            && (expectedLogMethods as string[]).includes('logcrit') ? 2
            : (expectedLogMethods as string[]).includes('logerror') ? 1
                : (expectedLogMethods as string[]).includes('logcrit') ? 1 : 0)
        if ((expectedLogMethods as string[]).includes('logerror')) {
            expect(console.error).toBeCalledWith(expect.objectContaining({ timestamp: expect.any(Number), "data": `'${testLogMessage}'`, "correlation": testCorrelationToken, "level": "ERROR" }))
        }
        // ASSERT logcrit
        if ((expectedLogMethods as string[]).includes('logcrit')) {
            expect(console.error).toBeCalledWith(expect.objectContaining({ timestamp: expect.any(Number), "data": `'${testLogMessage}'`, "correlation": testCorrelationToken, "level": "CRIT" }))
        }
    })
test("if not set_correlation_token prior log* call 'UNKNOWN' is used", () => {
    const log = new Log(undefined) // no correlation_id is set
    log.warn(testLogMessage)
    expect(console.warn).toBeCalledTimes(1)
    expect(console.warn).lastCalledWith(expect.objectContaining({ timestamp: expect.any(Number), "data": `'${testLogMessage}'`, "correlation": "UNKNOWN", "level": "WARN" }))
})
test("if not LOGLEVEL default level is WARN", () => {
    process.env.LOGLEVEL = undefined
    const log = new Log({correlation_id: undefined}); // no correlation_id is set

    log.debug(testLogMessage)
    log.info(testLogMessage)
    log.warn(testLogMessage)
    log.error(testLogMessage)
    log.crit(testLogMessage)

    expect(console.info).toBeCalledTimes(0)
    expect(console.log).toBeCalledTimes(0)
    expect(console.warn).toBeCalledTimes(1)
    expect(console.error).toBeCalledTimes(2) //1 for error, 1 for crit
    expect(console.warn).nthCalledWith(1, expect.objectContaining({ timestamp: expect.any(Number), "data": `'${testLogMessage}'`, "correlation": "UNKNOWN", "level": "WARN" }))
    expect(console.error).nthCalledWith(1, expect.objectContaining({ timestamp: expect.any(Number), "data": `'${testLogMessage}'`, "correlation": "UNKNOWN", "level": "ERROR" }))
    expect(console.error).nthCalledWith(2, expect.objectContaining({ timestamp: expect.any(Number), "data": `'${testLogMessage}'`, "correlation": "UNKNOWN", "level": "CRIT" }))
})

const expectedCorrelationToken = 'THE TEST CORELLATION ID'
describe('setting correlation id', () => {
    test('by passing plain string', () => {
        const log = new Log(expectedCorrelationToken)
        expect(log.correlation_id).toBe(expectedCorrelationToken);
    });

    test('by passing String(\'...\')', () => {
        const log = new Log(String(expectedCorrelationToken))
        expect(log.correlation_id).toBe(expectedCorrelationToken);
    });

    test('by passing new String(\'...\')', () => {
        const log = new Log(new String(expectedCorrelationToken))
        expect(log.correlation_id).toBe(expectedCorrelationToken);
    });

    test('by passing object contining `correlation_id: sting`', () => {
        const log = new Log({ correlation_id: expectedCorrelationToken, someOtherProp: 'will not be used' })
        expect(log.correlation_id).toBe(expectedCorrelationToken);
    });
});