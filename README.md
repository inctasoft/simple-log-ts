# simple-log-ts

```
npm install @inctasoft/simple-log-ts
```

Exposes a `Log` class that is to be initialized with a `correlation_id` string. Once a log instance is created, each log method will also print the `correlation_id`.

Useful in event driven apps where each event carries info that you would later want to search for, and correlate with other events.

- applied is `inspect(d, false, 10, false))` on arguments passed 
- uses `LOGLEVEL` environment variable to decide which log statements are to be printed.

_happy to receive prs extending the lib_

Example usage: 
Suppose we want to print 3 different variables in a log statement:

```
import { Log } from "./log";

const my_correlation_id = 'my_correlation_id' // or {correlation_id: 'my_correlation_id'}
const log = new Log(my_correlation_id);

const my_object = {a:1, b: 'xyz', c: { nested: ['elem1','elem2', 3], more_nested: {d:1, e: '2'} } };
const my_string = 'Lorem ipsum';
const my_number = 42;

log.debug(my_string);  
log.info(my_number);
log.warn(my_object);
log.error(my_string);
log.crit(my_number);

```

result:

```
{
  timestamp: 1696731355442,
  level: 'WARN',
  correlation: 'my_correlation_id',
  data: '{\n' +
    '  a: 1,\n' +
    "  b: 'xyz',\n" +
    "  c: { nested: [ 'elem1', 'elem2', 3 ], more_nested: { d: 1, e: '2' } }\n" +
    '}'
}
{
  timestamp: 1696731355444,
  level: 'ERROR',
  correlation: 'my_correlation_id',
  data: "'Lorem ipsum'"
}
{
  timestamp: 1696731355444,
  level: 'CRIT',
  correlation: 'my_correlation_id',
  data: '42'
}
```

Notice how only `WARN`, `ERROR` and `CRIT` log statements are printed. This is because `process.env.LOGLEVEL` was not set and in this case `WARN` level is assumed. See `log.spec.ts` for details. 

NOTE that both `CRIT` and `ERROR` levels uses console.error stream. However by setting `process.env.LOGLEVEL` to `CRIT` one can filter out other errors, leaving only those logged by the `crit` method.
