[SonarCloud results](https://sonarcloud.io/summary/overall?id=inctasoft_simple-log-ts)

# NOTE
- __This template repo and the code in it (although working) is used to scafold a simple Node.js SDLC.__
- _The minimal code in here represents a simple logger, providing support for loglevels and `correlation` string that is always printed_
- _If you are looking for more sophisticate logger in the context of AWS serverless, you may want to consider using https://docs.powertools.aws.dev/lambda/typescript/latest/core/logger/_

## CICD Workflow

- `dev` is default branch

- `dev`, `main`, `release/**`, `hotfix/**` are protected branches.

  - PRs to them will trigger github workflow to Build, Test, Sonarcloud scan

- on push to  `main`:

  - package version is bumped depending on commit messages

    - see https://github.com/phips28/gh-action-bump-version#workflow on commit messages

  - new tag is being created with the new version

  - npm package with the new version is pushed to https://registry.npmjs.org/

  - npm package with the new version is pushed to https://npm.pkg.github.com/

- on push to `main`, `release/**` or `hotfix/**`, commits are pulled back in `dev` branch 

  - in the case of a push to `main`, this job will also pull the version bump commit from `main` into `dev`

- on push to `main` (TODO) `gh release` is created

## Using the template 

- Upon creating a repository from the template the CICD pipeline will fail for the `sonarcloud` step
- You would want to first change contentsof `package.json` adding the name of your package, dependencies, etc.
- make sure these secrets exists, have access to your repo and are valid:
  - `PAT_TOKEN_GHA_AUTH` the token of the account to setup git for automatic version bumps and mergebacks in dev. Needs a `repo` scope
  - `SONAR_TOKEN` - sonar cloud token. You will need a https://sonarcloud.io/ account and a corresponding project
  - `NPM_TOKEN` - NPM token (classic). You will need a https://www.npmjs.com/ account
## On simple-log-ts code

```
npm install @inctasoft/simple-log-ts
```

Exposes a `Log` class that is to be initialized with a `correlation_id` string. Once a log instance is created, each log method will also print the `correlation_id`.

Useful in event driven apps where each event carries info that you would later want to search for, and correlate with other events.

- applied is 
```
formatWithOptions({ colors: true, depth: 10, showHidden: false }, '%j', {
                timestamp: new Date().getTime(),
                level: loglevel,
                correlation: this._correlation_id,
                ...logData
            }) 
```
- uses `LOGLEVEL` environment variable to decide which log statements are to be printed.

Example usage: 

```
import { Log } from "./log";

const my_correlation_id = {correlation_id: 'some_guid'} 

const log = new Log(my_correlation_id);

const my_object = { a: 1, b: 'xyz', c: { nested: ['elem1', 'elem2', 3], more_nested: { nested_1: ['elem1_1', 'elem1_2', 5] } } };
const my_string = 'Lorem ipsum';
const my_number = 42;

log.debug(my_object);
log.info(my_object);
log.warn(my_object);
log.error(my_string);
log.crit(my_number);

```

result:

```
{"timestamp":1696816253862,"level":"WARN","correlation":"my_correlation_id","a":1,"b":"xyz","c":{"nested":["elem1","elem2",3],"more_nested":{"nested_1":["elem1_1","elem1_2",5]}}}
{"timestamp":1696816253863,"level":"ERROR","correlation":"my_correlation_id","data":"Lorem ipsum"}
{"timestamp":1696816253863,"level":"CRIT","correlation":"my_correlation_id","data":42}
```

Notice how only `WARN`, `ERROR` and `CRIT` log statements are printed. This is because `process.env.LOGLEVEL` was not set and in this case `WARN` level is assumed. See `log.spec.ts` for details. 

NOTE that both `CRIT` and `ERROR` levels uses console.error stream. However by setting `process.env.LOGLEVEL` to `CRIT` one can filter out other errors, leaving only those logged by the `crit` method.
