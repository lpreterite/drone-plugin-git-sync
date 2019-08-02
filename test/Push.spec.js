//测试两个状况，有仓库时更新文件并提交，没有仓库时更新文件并提交


import dotenv from "dotenv"
dotenv.config()

import path from "path"
import fs from "fs"
import fse from "fs-extra"
import { run, getRepoName } from "../src/main"

const cwd = path.resolve(__dirname, '..', process.env.TEST_REPO_CWD)
const remote = process.env.TEST_AUTH_REPOSITORY
const branch = "master"


describe('git-sync', function(){
    const repoName = getRepoName(remote)
    const local_path = path.resolve(cwd, repoName)
    this.timeout(100000)
    describe('git clone and push', function(){
        beforeEach(function(){
            if(fs.existsSync(local_path)) fse.removeSync(local_path)
            try{
                fs.writeFileSync(path.join(cwd,'copy/test.txt'), Date.now());
            }catch(e){
                console.error(e)
            }
        })

        it(`by account`, async function(){
            await run({
                cwd: cwd,
                account: {
                    username: process.env.TEST_AUTH_USERNAME,
                    password: process.env.TEST_AUTH_PASSWORD
                },
                repository: {
                    url: process.env.TEST_AUTH_REPOSITORY,
                    branch,
                    commit_label: "update by drone-plugin-git-sync"
                },
                config: {
                    name: "packy-tang",
                    email: "lpreterite@126.com"
                },
                copy: [
                    [path.join(cwd,'copy/test.txt'),'test.txt']
                ]
            })
            assert(fs.existsSync(local_path), `fail: git clone ${remote}`)
        })
    
        it(`by ssh`, async function(){
            await run({
                cwd: cwd,
                ssh: path.resolve(path.join('tmp/',process.env.TEST_SSH_KEY)),
                repository: {
                    url: process.env.TEST_SSH_REPOSITORY,
                    branch,
                    commit_label: "update by drone-plugin-git-sync"
                },
                config: {
                    name: "packy-tang",
                    email: "lpreterite@126.com"
                },
                copy: [
                    [path.join(cwd,'copy/test.txt'),'test.txt']
                ],
                local_ssh_key_path: path.resolve(path.join('tmp/','.ssh_copy/'))
            })
            
            assert(fs.existsSync(local_path), `fail: git clone ${remote}`)
        })
    })
    describe('git pull and push', function(){
        beforeEach(function(){
            try{
                fs.writeFileSync(path.join(cwd,'copy/test.txt'), Date.now());
            }catch(e){
                console.error(e)
            }
        })

        it(`by account`, async function(){
            await run({
                cwd: cwd,
                account: {
                    username: process.env.TEST_AUTH_USERNAME,
                    password: process.env.TEST_AUTH_PASSWORD
                },
                repository: {
                    url: process.env.TEST_AUTH_REPOSITORY,
                    branch,
                    commit_label: "update by drone-plugin-git-sync"
                },
                config: {
                    name: "packy-tang",
                    email: "lpreterite@126.com"
                },
                copy: [
                    [path.join(cwd,'copy/test.txt'),'test.txt']
                ]
            })
            assert(fs.existsSync(local_path), `fail: git clone ${remote}`)
        })
    
        it(`by ssh`, async function(){
            await run({
                cwd: cwd,
                ssh: path.resolve(path.join('tmp/',process.env.TEST_SSH_KEY)),
                repository: {
                    url: process.env.TEST_SSH_REPOSITORY,
                    branch,
                    commit_label: "update by drone-plugin-git-sync"
                },
                config: {
                    name: "packy-tang",
                    email: "lpreterite@126.com"
                },
                copy: [
                    [path.join(cwd,'copy/test.txt'),'test.txt']
                ],
                local_ssh_key_path: path.resolve(path.join('tmp/','.ssh_copy/'))
            })
            
            assert(fs.existsSync(local_path), `fail: git clone ${remote}`)
        })
    })
})