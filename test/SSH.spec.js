// 测试用SSH方式克隆仓库至本地

import dotenv from "dotenv"
dotenv.config()

import path from "path"
import fs from "fs"
import fse from "fs-extra"
import Git from "simple-git/promise"
import { getRepoName, cloneBySSH } from "../src/main"

const cwd = path.resolve(__dirname, '..', process.env.TEST_REPO_CWD)
const git = Git(cwd)
const remote = process.env.TEST_SSH_REPOSITORY
const branch = "master"
const ssh_key = path.resolve(cwd, process.env.TEST_SSH_KEY)
git.silent(false)

describe('Git clone by SSH', function(){
    this.timeout(30000)
    it(`git clone ${remote}`, async function(){
        const repoName = getRepoName(remote)
        const local_path = path.resolve(cwd, repoName+'_ssh')

        if(fs.existsSync(local_path)) fse.removeSync(local_path)

        await cloneBySSH({
            remote,
            local_path,
            branch,
            ssh_key
        })(git)
        
        assert(fs.existsSync(local_path), `fail: git clone ${remote}`)
    })
})