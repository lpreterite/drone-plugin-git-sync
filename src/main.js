const fs = require("fs")
const path = require("path")
const cpy = require("cpy")
const cpdir = require("./cpdir")
const Git = require("simple-git/promise")("./tmp")

const USERNAME = 'tangwb'
const PASSPORT = 'abc9696396**'
const REPO = 'gogs.infzm.com/INF_FE/drone-test.git'

const name = 'tmp'
const remote = `http://${USERNAME}:${PASSPORT}@${REPO}`

Git
    .silent(true)
    .clone(remote, name)
    .then(()=>fs.writeFileSync("./dist/ddfile/testfile.txt", `${Date.now()}`))
    .then(()=>cpdir('./dist',`tmp/${name}/dist`))
    .then(()=>console.log('finished'))
    .catch((err) => console.error('failed: ', err));