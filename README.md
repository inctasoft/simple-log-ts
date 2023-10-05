# simple-ts-logging

Exposes a `Log` class that is to be initialized with a `correlation_id` string. Once a log instance is created, each log method will also print the `correlation_id`.

Useful in event driven apps where each event carries info that you would later want to search for, and correlate with other events.

Library uses inspect from `util` node package.

It uses `LOGLEVEL` environment variable to decide which log statements are to be printed.

Example usage: 
Suppose we want to print 3 different variables in a log statement:

```
import { Log } from "@incta/simple-log-ts";

const my_correlation_id = 'my_correlation_id' // or {correlation_id: 'my_correlation_id'}
const log = new Log(my_correlation_id);

const my_object = {a:1, b: 'xyz', c: { nested: ['elem1','elem2', 3], more_nested: {d:1, e: '2'} } };
const my_string = 'Lorem ipsum';
const my_number = 42;

// log methods in order of priority, see log.spec.ts
log.debug(my_object, my_string, my_number);  
log.info(my_object, my_string, my_number);
log.warn(my_object, my_string, my_number);
log.error(my_object, my_string, my_number);
log.crit(my_object, my_string, my_number);

```

result:

```
{
  '0': '{\n' +
    '  a: 1,\n' +
    "  b: 'xyz',\n" +
    "  c: { nested: [ 'elem1', 'elem2', 3 ], more_nested: { d: 1, e: '2' } }\n" +
    '}',
  '1': "'Lorem ipsum'",
  '2': '42',
  loglevel: 'WARN',
  correlation: 'my_correlation_id'
}
{
  '0': '{\n' +
    '  a: 1,\n' +
    "  b: 'xyz',\n" +
    "  c: { nested: [ 'elem1', 'elem2', 3 ], more_nested: { d: 1, e: '2' } }\n" +
    '}',
  '1': "'Lorem ipsum'",
  '2': '42',
  loglevel: 'ERROR',
  correlation: 'my_correlation_id'
}
{
  '0': '{\n' +
    '  a: 1,\n' +
    "  b: 'xyz',\n" +
    "  c: { nested: [ 'elem1', 'elem2', 3 ], more_nested: { d: 1, e: '2' } }\n" +
    '}',
  '1': "'Lorem ipsum'",
  '2': '42',
  loglevel: 'CRIT',
  correlation: 'my_correlation_id'
}
```

Notice how only `WARN`, `ERROR` and `CRIT` log statements are printed. This is because `process.env.LOGLEVEL` was not set and in this case `WARN` level is assumed. See `log.spec.ts` for details
