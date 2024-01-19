# Contributing

* **All PRs are welcome** in the `develop` branch.
* Please, stick to the defined [Purpose](https://github.com/vbuch/node-signpdf#purpose) of the repo and try to write your code as readable as possible.
* [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/) + [Lerna](https://lerna.js.org/) are used in this **monorepo**.
* We do code reviews and may ask you to change things before we merge code.
* Note that [gitmoji](https://gitmoji.carloscuesta.me/) is used in the commit messages. That's not a must but we think it's nice.

## Useful commands

- `$ yarn lint` - As run in your pre-commit
- `$ yarn test` - As run in your pre-push
- `$ ./node_modules/.bin/lerna run build` builds all the packages in their respective `dist` folders.
- `$ ./node_modules/.bin/lerna run test --scope=@signpdf/signpdf -- --watch --coverage` runs tests in a specified package tracking coverage and watching.
- `$ yarn workspace @signpdf/signpdf add node-forge -D` adds a `node-forge` as a dev dependency 
of `@signpdf/signpdf`
- `$ yarn workspace @signpdf/signpdf add @signpdf/some-new-subpackage@* -D` adds a `@signpdf/some-new-subpackage` as a dev dependency of `@signpdf/signpdf`. Note the `@*` version specifier.
- `$ npm publish --access public` is needed the first time a package get published as our packages are scoped and that is private by default. See: https://bit.ly/47ScKPF

## Contributors

* [vbuch](https://github.com/vbuch)
* [maldimirov](https://github.com/maldimirov)
* [alekssakovsky](https://github.com/alekssakovsky)
* [MohammedEssehemy](https://github.com/mohammedessehemy)
* [samaleksov](https://github.com/samaleksov)
* [vizicsaba89](https://github.com/vizicsaba89)
* [pankucsi](https://github.com/pankucsi)
* [andres-blanco](https://github.com/andres-blanco)
* [therpobinski](https://github.com/therpobinski)
* [Godoy](https://github.com/Godoy)
* [mgyugcha](https://github.com/mgyugcha)
* [ashirman](https://github.com/ashirman)
* [brunoserrano](https://github.com/brunoserrano)
* [waaronking](https://github.com/waaronking)
* [dhensby](https://github.com/dhensby)
* [pernikov](https://github.com/pernikov)
* [timotheeg](https://github.com/timotheeg)
* [ElTimuro](https://github.com/ElTimuro)
* [erikn69](https://github.com/erikn69)
* [dcbr](https://github.com/dcbr)
* [AviramBaranes](https://github.com/AviramBaranes)
