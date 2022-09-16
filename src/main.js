const fs = require("fs")
const fse = require("fs-extra")
const path = require("path")
const url = require('url')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const Git = require("simple-git/promise")

export function isSSH(remote){
    let _url = url.parse(remote)
    if(!_url.protocol){
        _url = url.parse("ssh://"+"git@gitee.com:packy-tang/drone-test.git")
    }
    return _url.protocol.substr(0,_url.protocol.length-1) === 'ssh'
}

// use: setSSH(ssh_key_path)(Git)
export function setSSH(ssh_key){
    const GIT_SSH_COMMAND = `ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i ${ssh_key}`
    return Git=>{
        return Git.env("GIT_SSH_COMMAND", GIT_SSH_COMMAND)
    }
}
// use: setConf(config)(Git)
export function setConf({name, email}){
    return git=>{
        return Promise.all([
            git.addConfig('user.name', name),
            git.addConfig('user.email', email)
        ])
    }
}

export function getRepoName(remote){
    const _url = url.parse(remote)
    return _url.pathname.split('/').pop().replace('.git','')
}

export function cloneByAccount(options){
    let { account, remote, local_path, branch, depth } = Object.assign({branch:"master"}, options)
    const _url = url.parse(remote)
    const _remote = `${_url.protocol}//${account.username}:${account.password}@${_url.host}${_url.path}`
    return git=>{
        console.log(`clone repositopy:\n- clone repositopy: ${remote}\n- checkout branch:${branch}`)
        return git.clone(_remote, local_path, ["-b", branch, "--depth", depth]).then(()=>console.log(`- finished!\n`))
    }
}

export function cloneBySSH(options){
    let { remote, local_path, branch, depth } = Object.assign({branch:"master"}, options)
    return git=>{
        console.log(`clone repositopy:\n- clone repositopy: ${remote}\n- checkout branch: ${branch}`)
        return git.clone(remote, local_path, ["-b", branch, "--depth", depth]).then(()=>console.log(`- finished!\n`))
    }
}

export function copy(target, copy, options={overwrite:true}){
    console.log('copy files:')
    return Promise.all(copy.map(([source, output])=>{
        const msg = `- copy '${source}' to '${target}/${output}'`
        return fse.copy(source, path.join(target, output), {overwrite: options.overwrite})
        .then(()=>console.log(msg))
        .catch(e=>console.error('- failed: '+msg, e))
    }))
    .then(()=>console.log('- finished!\n'))
}

export function commit(label=""){
    return git=>{
        return git.add(`./*`)
        .then(()=>git.commit(label))
    }
}

export function push(branch){
    return git=>{
        return git.push('origin', branch)
    }
}

export function checkout(branch, origin){
    return git=>{
        return git.branchLocal()
        .then(result=>{
            if(result.all.indexOf(branch)>-1){
                //have branch
                return git.checkout(branch).then(()=>git.reset('hard', `${origin}/${branch}`))
            }else{
                //not have branch
                return git.checkoutBranch(branch, `${origin}/${branch}`)
            }
        })
    }
}

export function copyAndAuthorizeSSH(ssh_key, ssh_key_path, local_ssh_key_path){
    if(!!ssh_key){
        console.log(`authorize ssh:`)
        try{
            fse.ensureFileSync(local_ssh_key_path)
            fse.writeFileSync(local_ssh_key_path, ssh_key)
            console.log(`- write ssh_key in ${local_ssh_key_path}`)
        }catch(e){
            console.error(e)
        }
    }else{
        console.log(`copy and authorize ssh:`)
        if(!fse.existsSync(ssh_key_path)) throw new Error('SSH repository must be use SSH key file!')
        fse.copySync(ssh_key_path, local_ssh_key_path)
        console.log(`- copy ${ssh_key_path} to ${local_ssh_key_path}`)
    }
    return exec(`chmod 600 ${local_ssh_key_path}`)
        .then(()=>{
            console.log(`- authorize ${local_ssh_key_path} can read!\n`)
        })
}

export function run(options){
    options = Object.assign({
        cwd: "tmp",
        overwrite: true,
        copy: null,
        silent: false,
        ssh: null, // "[path]" 
        account: null, // { username:"[username]", password: "[****]" }
        repository: null,
        config: null,
        local_ssh_key_path: 'ssh/',
    }, options)

    const repository = Object.assign({ url: "", branch: "master", commit_label: "update by drone-plugin-git-sync" }, options.repository)
    const remote = repository.url
    const account = options.account
    const config = options.config
    const repository_name = getRepoName(repository.url)
    const repository_path = path.join(options.cwd, repository_name)
    const branch = repository.branch
    const depth = options.depth || 1
    const is_ssh = isSSH(remote)
    const ssh_key_name = is_ssh ? (options.ssh ? path.basename(options.ssh) : "ssh_key") : ""
    const local_ssh_key_path = is_ssh ? path.join(path.resolve(__dirname, '..'), options.cwd, options.local_ssh_key_path, ssh_key_name) : ""

    if(!fse.existsSync(options.cwd)) fse.mkdirSync(options.cwd)
    const git = Git(options.cwd).silent(options.silent).env('GIT_SSH_COMMAND','ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no')

    console.log(`repository:\n- url: ${remote}\n- branch: ${branch}\n- cwd: ${path.resolve(options.cwd)}\n`)

    if(!fs.existsSync(repository_path)){
        return (
            !!is_ssh
            ? copyAndAuthorizeSSH(options.ssh_key, options.ssh, local_ssh_key_path)
                .then(()=>setSSH(local_ssh_key_path)(git))
                .then(()=>cloneBySSH({
                    remote,
                    local_path: repository_name,
                    branch,
                    depth
                })(git))
            : cloneByAccount({
                account,
                remote,
                local_path: repository_name,
                branch
            })(git)
        )
        .then(()=>copy(repository_path, options.copy, {overwrite:options.overwrite}))
        .then(()=>console.log('commit and push:'))
        .then(()=>git.cwd(repository_path))
        .then(()=>setConf(config)(git))
        .then(()=>commit(repository.commit_label)(git))
        .then(()=>push(branch)(git))
        .then(()=>console.log('- finished!\n'))
    }else{
        return (
            !!is_ssh
            ? copyAndAuthorizeSSH(options.ssh_key, options.ssh, local_ssh_key_path).then(()=>setSSH(local_ssh_key_path)(git))
            : Promise.resolve()
        )
        .then(()=>git.cwd(repository_path))
        .then(()=>console.log(`fetch: `))
        .then(()=>git.fetch({'--all': null}))
        .then(()=>console.log(`- finished!\ncheckout:`))
        .then(()=>checkout(branch, 'origin')(git))
        .then(()=>console.log(`- finished!\npull:`))
        // .then(()=>git.reset('hard', `origin/${branch}`))
        .then(()=>git.pull())
        .then(()=>console.log(`- finished!\n`))
        .then(()=>copy(repository_path, options.copy, {overwrite:options.overwrite}))
        .then(()=>console.log('commit and push:'))
        .then(()=>setConf(config)(git))
        .then(()=>commit(repository.commit_label)(git))
        .then(()=>push(branch)(git))
        .then(()=>console.log('- finished!\n'))
    }
}

module.exports = run