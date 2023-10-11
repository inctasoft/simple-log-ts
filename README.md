[SonarCloud results](https://sonarcloud.io/summary/overall?id=inctasoft_simple-log-ts)
# simple-ts-log

```
npm install @inctasoft/simple-log-ts
```

Exposes a `Log` class that is to be initialized with a `correlation_id` string. Once a log instance is created, each log method will also print the `correlation_id`.

Useful in event driven apps where each event carries info that you would later want to search for, and correlate with other events.

- uses `LOGLEVEL` environment variable to decide which log statements are to be printed.
- transforms `Map` and `Set` objects so that they are also printed
- optionally print types of objects being logged (by passing `printTypes: true` in the constructor)

Example usage: 

```typescript
import { Log } from "@inctasoft/simple-log-ts";

const log = new Log({ correlation_id: 'my_correlation_id' });

const my_object = {
    a: 1, b: 'xyz', c: {
        nested: ['elem1', new Map([['mapKey', { prop1: 1, prop2: new Date() }]]), 3],
        more_nested: { nested_1: ['elem1_1', new Set(['a', 'b', new Map([['foo', 'bar']])]), 5] }
    }
};
const my_string = 'Lorem ipsum';
const my_number = 42;

log.debug(my_object);
log.info(my_object);
log.warn(my_object);
log.error(my_string);
log.crit(my_number);

```

result:

```json
{"timestamp":"2023-10-11T10:40:34.415Z","level":"WARN","correlation":"my_correlation_id","message":{"a":1,"b":"xyz","c":{"nested":["elem1",{"mapKey":{"prop1":1,"prop2":"2023-10-11T10:40:34.415Z"}},3],"more_nested":{"nested_1":["elem1_1",["a","b",{"foo":"bar"}],5]}}}}
{"timestamp":"2023-10-11T10:40:34.415Z","level":"ERROR","correlation":"my_correlation_id","message":"Lorem ipsum"}
{"timestamp":"2023-10-11T10:40:34.415Z","level":"CRIT","correlation":"my_correlation_id","message":42}
```

- Notice how only `WARN`, `ERROR` and `CRIT` log statements are printed. This is because `process.env.LOGLEVEL` was not set and in this case `WARN` level is assumed. See `log.spec.ts` for details. 
- Notice that both `CRIT` and `ERROR` levels uses console.error stream. However by setting `process.env.LOGLEVEL` to `CRIT` one can filter out other errors, leaving only those logged by the `crit` method.
- If you set `LOGLEVEL` to something different from `DEBUG`,`INFO`,`WARN`,`ERROR` or `CRIT`, for example `LOGLEVEL=SILENT`, `CRIT` level is still printed
- _For more sophisticated logger in the context of AWS serverless, you may want to consider using https://docs.powertools.aws.dev/lambda/typescript/latest/core/logger/_

## CICD Workflow


* PRs to `dev`, `main`, `release/**`, `hotfix/**` will trigger github workflow to Build, Test, Sonarcloud scan
* On push to `main`, `release/**` or `hotfix/**`, commits are pulled back in `dev` branch 
* On push to  `main`:
  * package version is bumped depending on commit messages
    * see https://github.com/phips28/gh-action-bump-version#workflow on commit messages
    * (version bump commit will be automerged in `dev` from _2._)
  * new tag is being created with the new version
  * npm package with the new version is pushed to https://registry.npmjs.org/
  * npm package with the new version is pushed to https://npm.pkg.github.com/
  * (TODO) `gh release` is created __!__ https://medium.com/giant-machines/releases-the-easy-way-3ec1c2c3502b

## Using the template repository

- Upon creating a repository from the template the CICD pipeline will fail for the `sonarcloud` step
- You would want to first change contentsof `package.json` adding the name of your package, dependencies, etc.
- make sure these secrets exists, have access to your repo and are valid:
  - `PAT_TOKEN_GHA_AUTH` the token of the account to setup git for automatic version bumps and mergebacks in dev. Needs a `repo` scope
  - `SONAR_TOKEN` - sonar cloud token. You will need a https://sonarcloud.io/ account and a corresponding project
  - `NPM_TOKEN` - NPM token (classic). You will need a https://www.npmjs.com/ account



