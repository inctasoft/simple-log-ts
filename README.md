# simple-log-ts

## NOTEs

- _This repo and the code in it (although working) is used to scafold a github workflows for a Node.js SDLC._
- _If you are looking for a decent logger in the context of AWS, you may want to consider using https://docs.powertools.aws.dev/lambda/typescript/latest/core/logger/_


# On Github Workflow in this repo

- `dev`, `main`, `release/**`, `hotfix/**` are protected branches
- `dev` is default branch
- on push to  `main`:
  - package version is bumped depending on commit messages, using https://github.com/phips28/gh-action-bump-version:
    - see https://github.com/phips28/gh-action-bump-version#workflow on commit messages
  - new tag is being created with the newly bumped version
- on push to `main`, `release/**` or `hotfix/**`, commits are pulled back in `dev` branch 
  - in the case of a push to `main`, this job will also pull the version bump commit from `main` into `dev`
- on push to `main` (TODO) `gh release` is created

# On the code in this repo

```
npm install @inctasoft/simple-log-ts
```

Exposes a `Log` class that is to be initialized with a `correlation_id` string. Once a log instance is created, each log method will also print the `correlation_id`.

Useful in event driven apps where each event carries info that you would later want to search for, and correlate with other events.

- applied is `inspect(d, false, 10, false))` on arguments passed 
- uses `LOGLEVEL` environment variable to decide which log statements are to be printed.

Example usage: 

```
import { Log } from "./log";

const my_correlation_id = {correlation_id: 'some_guid'} 

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
  correlation: 'some_guid',
  data: '{\n' +
    '  a: 1,\n' +
    "  b: 'xyz',\n" +
    "  c: { nested: [ 'elem1', 'elem2', 3 ], more_nested: { d: 1, e: '2' } }\n" +
    '}'
}
{
  timestamp: 1696731355444,
  level: 'ERROR',
  correlation: 'some_guid',
  data: "'Lorem ipsum'"
}
{
  timestamp: 1696731355444,
  level: 'CRIT',
  correlation: 'some_guid',
  data: '42'
}
```

Notice how only `WARN`, `ERROR` and `CRIT` log statements are printed. This is because `process.env.LOGLEVEL` was not set and in this case `WARN` level is assumed. See `log.spec.ts` for details. 

NOTE that both `CRIT` and `ERROR` levels uses console.error stream. However by setting `process.env.LOGLEVEL` to `CRIT` one can filter out other errors, leaving only those logged by the `crit` method.
