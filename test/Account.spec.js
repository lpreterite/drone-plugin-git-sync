// 测试用账号密码登录方式克隆仓库至本地

import dotenv from "dotenv"
dotenv.config()

import path from "path"
import fs from "fs"
import fse from "fs-extra"
import Git from "simple-git/promise"
import { getRepoName, cloneByAccount } from "../src/main"

const cwd = path.resolve(__dirname, '..', process.env.TEST_REPO_CWD)
const git = Git(cwd)
const remote = process.env.TEST_AUTH_REPOSITORY
const branch = "master"

git.silent(false)

describe('Git clone by account', function(){
    this.timeout(30000)
    it(`git clone ${remote}`,  async function(){
        const repoName = getRepoName(remote)
        const local_path = path.resolve(cwd, repoName+'_account')

        if(fs.existsSync(local_path)) fse.removeSync(local_path)

        await cloneByAccount({
            remote,
            local_path,
            branch,
            account: {
                username: process.env.TEST_AUTH_USERNAME,
                password: process.env.TEST_AUTH_PASSWORD
            }
        })(git)

        assert(fs.existsSync(local_path), `fail: git clone ${remote}`)
    })
})