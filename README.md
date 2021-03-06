# REST-JS Starter

A REST [Node.js](http://nodejs.org) starter project written in typescript and built on top of [Nest](https://github.com/nestjs/nest).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/emilhornlund/restjs-starter/actions/workflows/main.yml/badge.svg)](https://github.com/emilhornlund/restjs-starter/actions/workflows/main.yml)
[![Coverage Status](https://coveralls.io/repos/github/emilhornlund/restjs-starter/badge.svg?branch=master)](https://coveralls.io/github/emilhornlund/restjs-starter?branch=master)

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit and e2e tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Migrations

Generate migration
```bash
$ npm run typeorm -- migration:create -n PostRefactoring
```

## License

REST-JS Starter is [MIT licensed](LICENSE).
