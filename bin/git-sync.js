#!/usr/bin/env node

const fromEntries = require('object.fromentries')
const toObject = str => fromEntries(str.split(',').map(sub=>sub.split('=')))
const toArray = str => str.split(',')
const toBoolean = str => str === 'true'
const gitSync = require('../src/main.js')

const directories = process.env.PLUGIN_COPY ? toArray(process.env.PLUGIN_COPY).map(pathset=>pathset.split(':')) : []

gitSync({
    cwd: process.env.PLUGIN_CWD || 'tmp',
    overwrite: toBoolean(process.env.PLUGIN_OVERWRITE),
    source: directories[0][0],
    output: directories[0][1],
    auth: toObject(process.env.PLUGIN_AUTH),
    repository: toObject(process.env.PLUGIN_REPOSITORY)
})