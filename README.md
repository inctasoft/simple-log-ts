[SonarCloud results](https://sonarcloud.io/summary/overall?id=inctasoft_simple-log-ts)
# simple-log-ts

```
npm install @inctasoft/simple-log-ts
```

Exposes a `Log` class with `debug`, `info`, `warn`, `error` and `crit` methods.
- Logs are in JSON format, useful for parsing from log ingesting services
- `Error`, `Map` `Set` objects are trnsformed into JSON and also printed

| process.env.LOGLEVEL | active methods | notes |
|---|---|---|
| `DEBUG`| `debug`,`info`,`warn`,`error`,`crit`| | 
| `INFO` | `info`,`warn`,`error`,`crit`|| 
| `WARN` | `warn`,`error`,`crit`| default, if no `LOGLEVEL` is present |
| `ERROR`| `error`,`crit`| Both `crit` and `error` use `console.error` and accept optional second `Error` argument |
| `SILENT` <br/> (or any other value)| `crit` | Lets you silence all logs, if not using `crit` method(as it is always active, no matter of `LOGLEVEL` value) |

Examples:
- Empty config
```typescript
import { Log } from "@inctasoft/simple-log-ts";

const log = new Log();
log.error("oops something hapened, new Error('some err msg'));
```
results in:
```json
{"timestamp":"2023-10-11T21:50:47.405Z","level":"ERROR","message":"oops something hapened","correlation":"undefined","[Error]":{"stack":"Error: some err msg\n    at Object......","message":"some err msg"}}```
```
- Printing complex objects, and providing `correlation_id`
```typescript
import { Log } from "@inctasoft/simple-log-ts";

const log = new Log({ correlation_id: 'some_guid' });
log.warn({
    a: 1, b: 'xyz', my_set: new Set(['foo', 'bar']), nested: {
        my_arr: [
            'elem1',
            new Map([['mapKey', {
                prop1: 1,
                prop2: new Date()
            }]])]
    }
});
```
results in:
```json
{"timestamp":"2023-10-11T21:43:13.765Z","level":"WARN","message":{"a":1,"b":"xyz","my_set":["foo","bar"],"nested":{"my_arr":["elem1",{"mapKey":{"prop1":1,"prop2":"2023-10-11T21:43:13.765Z"}}]}},"correlation":"some_guid"}
```
- If you are interested in which transformed objects were of `Map` or `Set` types, provide `printMapSetTypes: true`
- If you are not into using correlation_id, provide `printCorrelation: false`
```typescript
import { Log } from "@inctasoft/simple-log-ts";

const log = new Log({ printMapSetTypes: true, printCorrelation: false});
log.warn({
    a: 1, b: 'xyz', my_set: new Set(['foo', 'bar']), nested: {
        my_arr: [
            'elem1',
            new Map([['mapKey', {
                prop1: 1,
                prop2: new Date()
            }]])]
    }
});
```
log statement:
```json
{"timestamp":"2023-10-11T22:04:00.503Z","level":"WARN","message":{"a":1,"b":"xyz","my_set":{"[Set]":["foo","bar"]},"nested":{"my_arr":["elem1",{"[Map]":{"mapKey":{"prop1":1,"prop2":"2023-10-11T22:04:00.503Z"}}}]}}}
```

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
* _pre-commit_ hooks are running tests and linting commit messages. Using `git cz` is encouraged

## Using the template repository

- Upon creating a repository from the template the CICD pipeline will fail for the `sonarcloud` step
- You would want to first 
  - remove other files, change contents of `package.json`, etc.
  - make sure these secrets exists, have access to your repo and are valid:
    - `PAT_TOKEN_GHA_AUTH` the token of the account to setup git for automatic version bumps and mergebacks in dev. Needs a `repo` scope
    - `SONAR_TOKEN` - sonar cloud token. You will need a https://sonarcloud.io/ account and a corresponding project
    - `NPM_TOKEN` - NPM token (classic). You will need a https://www.npmjs.com/ account
  