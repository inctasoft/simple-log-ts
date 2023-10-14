[SonarCloud results](https://sonarcloud.io/summary/overall?id=inctasoft_simple-log-ts)
# simple-log-ts

```
npm install @inctasoft/simple-log-ts
```

Exposes a `Log` class with `debug`, `info`, `warn`, `error` and `crit` methods.
- Logs are in JSON format, useful for parsing from log ingesting services
- In case of circular references, output is still JSON, but the message property will contain a string with the value of `util.inspect(data)`
- Optional `correlation_id` can be passed to constructor, which is always logged
- `Error`, `Map` `Set` objects are trnsformed into JSON and also printed
- After trasformations of input data, applied is: `formatWithOptions(inspectOptions, '%j', logData);` 
- `inspectOptions` defults to: `{ colors: true, depth: 10, showHidden: false }`, and can be overwritten by providing `inspectOptions` to the `Log` constructor


## Usage
- Empty config
```typescript
import { Log } from "@inctasoft/simple-log-ts";

const log = new Log();
log.error("oops something hapened, new Error('some err msg'));
```
results in:
```json
{"timestamp":"2023-10-11T21:50:47.405Z","level":"ERROR","message":"oops something hapened","correlation":"undefined","[Error]":{"stack":"Error: some err msg\n    at Object..(the err stack)","message":"some err msg"}}```
```
- Log complex objects, and providing `correlation_id`
```typescript
import { Log } from "@inctasoft/simple-log-ts";
process.env.LOGLEVEL = 'DEBUG' // un-silence debug method
const log = new Log({ correlation_id: 'some_guid' });
log.debug({
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
{"timestamp":"2023-10-12T00:14:44.139Z","level":"DEBUG","message":{"a":1,"b":"xyz","my_set":["foo","bar"],"nested":{"my_arr":["elem1",{"mapKey":{"prop1":1,"prop2":"2023-10-12T00:14:44.139Z"}}]}},"correlation":"some_guid"}
```
- If you are interested in which transformed objects were of `Map` or `Set` types, provide `printMapSetTypes: true`
- `Error` objects are always printed as `{"[Error]": {stack:"...", message: "..."}}`
- If you are not into using correlation_id, provide `printCorrelation: false`
```typescript
import { Log } from "@inctasoft/simple-log-ts";

const log = new Log({ printMapSetTypes: true, printCorrelation: false});
log.error({
    a: 1, b: 'xyz', my_set: new Set(['foo', 'bar']), nested: {
        my_arr: [
            'elem1',
            new Map([['mapKey', {
                prop1: 1,
                prop2: new Date()
            }]])]
    }
}, new Error("oops something unexpected happened"));
```
results in:
```json
{"timestamp":"2023-10-12T01:57:31.983Z","level":"ERROR","message":{"a":1,"b":"xyz","my_set":{"[Set]":["foo","bar"]},"nested":{"my_arr":["elem1",{"[Map]":{"mapKey":{"prop1":1,"prop2":"2023-10-12T01:57:31.983Z"}}}]}},"[Error]":{"stack":"Error: oops something unexpected happened\n    at Object..(the err stack)","message":"oops something unexpected happened"}}
```
- Circular reference handlig
```typescript
import { Log } from "../src/log";

const obj: any = {};
obj.a = [obj];
obj.b = {};
obj.b.inner = obj.b;
obj.b.obj = obj;

new Log().warn(obj)
```
results in:
```json
{"timestamp":"2023-10-14T05:59:48.714Z","level":"WARN","message":"<ref *1> {\n  a: [ [Circular *1] ],\n  b: <ref *2> { inner: [Circular *2], obj: [Circular *1] }\n}","correlation":"undefined"}
```
## Log levels
| process.env.LOGLEVEL | active methods | notes |
|---|---|---|
| `DEBUG`| `debug`,`info`,`warn`,`error`,`crit`| | 
| `INFO` | `info`,`warn`,`error`,`crit`|| 
| `WARN` | `warn`,`error`,`crit`| default, if no `LOGLEVEL` is present |
| `ERROR`| `error`,`crit`| Both `crit` and `error` use `console.error` and accept optional second `Error` argument |
| `SILENT` <br/> (or any other value)| `crit` | Lets you silence all logs, if not using `crit` method(as it is always active, no matter of `LOGLEVEL` value) |

## This repo as template
- Upon creating a repository from the template the Gthub Actions pipeline will fail for the `sonarcloud` step
- You would want to first
  - One-time execute `npm run prepare` to install git hooks
  - remove other files, change contents of `package.json`, etc.
  - make sure these secrets exists, have access to your repo and are valid:
    - `PAT_TOKEN_GHA_AUTH` the token of the account to setup git for automatic version bumps and mergebacks in dev. Needs a `repo` scope
    - `SONAR_TOKEN` - sonar cloud token. You will need a https://sonarcloud.io/ account and a corresponding project
    - `NPM_TOKEN` - NPM token (classic). You will need a https://www.npmjs.com/ account

* On push to `main`, `release/**` or `hotfix/**`, commits are pulled back in `dev` branch 
* On push to  `main`:
  * package version is bumped depending on commit messages
    * see https://github.com/phips28/gh-action-bump-version#workflow on commit messages
    * (version bump commit will be automerged in `dev` from _2._)
  * new tag is being created with the new version

* _pre-commit_ hooks are running tests and linting commit messages. Using `git cz` is encouraged
* Once a Github release from tag _is manually created_ 
  * npm package with the new version is pushed to https://registry.npmjs.org/
  * npm package with the new version is pushed to https://npm.pkg.github.com/
  