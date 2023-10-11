[SonarCloud results](https://sonarcloud.io/summary/overall?id=inctasoft_simple-log-ts)
# simple-ts-log

```
npm install @inctasoft/simple-log-ts
```

Exposes a `Log` class that could be initialized with a `correlation_id` string. Each log method will always print the `correlation_id`, even if it is not provided (in this case prints `UNKNOWN`). Useful when you explore logs for events, that _should_ have it, but for some reason it is missing.

If you do not want to use `correlation_id`, initialize the log by `new Log({skipCorrelation: true})`.

- `process.env.LOGLEVEL` controls which log methods are active.
  - `['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRIT']`
  - default level is `WARN` (if `process.env.LOGLEVEL` is not present) 
  - `log.crit` always prints, even if you set `process.env.LOGLEVEL` to something different from known levels
- The Log will transform `Map` and `Set` objects so that they are also printed
- The Log can optionally print types of objects being logged (by passing `printTypes: true` in the constructor).

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

- Notice that only 'WARN', 'ERROR' and 'CRIT' log statements are printed. This is because `process.env.LOGLEVEL` was not set. See `log.spec.ts` for details. 
- Notice that both `CRIT` and `ERROR` levels uses console.error stream. However by setting `process.env.LOGLEVEL` to `CRIT` one can filter out other errors, leaving only those logged by the `crit` method. OR, you can completley silence the log if you never use `log.crit`, and set `LOGLEVEL` to anything different than 'DEBUG','INFO','WARN', or 'ERROR'.
- _For more sophisticated logger in the context of AWS serverless, you may want to consider using https://docs.powertools.aws.dev/lambda/typescript/latest/core/logger/_

## CICD

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



