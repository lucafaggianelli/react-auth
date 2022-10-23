#!/usr/bin/env node
const version = require('./package.json').version
console.log(`::set-env name=VERSION::${version}`)