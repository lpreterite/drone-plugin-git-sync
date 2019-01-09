const fs = require("fs-extra")
const path = require("path")
const url = require('url')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

module.exports = function(options){
    options = Object.assign({
        cwd: "tmp",
        overwrite: true,
        source: "dist",
        output: "dist",
        auth: null,
        repository: null,
        config: null,
        directories: null,
        silent: false,
        ssh_key_path: "",
        ssh_key: ""
    }, options)
    const repository = Object.assign({ url: "", branch: "master", commitLabel: "update by drone-plugin-git-sync" }, options.repository)
    const auth = options.auth
    const config = options.config
    const directories = options.directories
    // console.log(options)

    if(!fs.existsSync(options.cwd)) fs.mkdirSync(options.cwd)
    const Git = require("simple-git/promise")(options.cwd)
    const _url = url.parse(repository.url)

    const repository_name = _url.pathname.split('/').pop()
    const repository_path = path.join(options.cwd, repository_name)
    const remote = !auth
                    ? repository.url
                    : `${_url.protocol}//${auth.username}:${auth.password}@${_url.host}${_url.path}`

    if(fs.existsSync(repository_path)) fs.removeSync(repository_path)

    const local_ssh_key_path = path.join('/sshkeys/','.ssh')
    const isSSH = _url.protocol.substr(0,_url.protocol.length-1) === 'ssh'

    const GitSSHCommand = ()=>{
        const GIT_SSH_COMMAND = `ssh -vvv -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i ${path.resolve(path.join(local_ssh_key_path, options.ssh_key))}`
        return Git
            .env("GIT_SSH_COMMAND", isSSH ? GIT_SSH_COMMAND : 'ssh')
    }
    const GitClone = ()=>{
        console.log(`1 set`)
        return (isSSH ? GitSSHCommand() : Git)
            .silent(options.silent)
            .clone(remote, repository_name, ["-b", repository.branch])
            .then(()=>console.log(`- clone repositopy: ${repository.url}`))
            .then(()=>console.log(`- checkout branch: ${repository.branch}`))
            .then(()=>{
                const msg = `- '${path.join(repository_name, options.output)}' directory removed`
                return !options.overwrite
                ? fs.remove(path.join(repository_path, options.output))
                    .then(()=>console.log(msg))
                    .catch(e=>console.error('- failed: '+msg, e))
                : ""
            })
            .then(()=>console.log('- finished!'))
            .then(()=>console.log('2 set'))
            .then(()=>{
                return Promise.all(directories.map(([source, output])=>{
                    const msg = `- copy '${source}' to '${repository_name}/${output}'`
                    return fs.copy(source, path.join(repository_path, output), {overwrite: true})
                    .then(()=>console.log(msg))
                    .catch(e=>console.error('- failed: '+msg, e))
                }))
            })
            .then(()=>console.log('- finished!'))
            .then(()=>console.log('3 set'))
            .then(()=>{
                return Git.cwd(repository_path)
                            .then(()=>Git.addConfig('user.name', config.name))
                            .then(()=>Git.addConfig('user.email', config.email))
                            .then(()=>Git.add(`./*`))
                            .then(()=>Git.commit(repository.commitLabel))
                            .then(()=>Git.push('origin', repository.branch))
                            .catch(e => console.error('- failed: ', e))
            })
            .then(()=>console.log(`- commit changed and push 'origin/${repository.branch}' in ${repository_name} repositopy`))
            .then(()=>console.log('- finished!'))
    }

    console.log(`0 set`)
    console.log(`- get repository with : ${_url.protocol.substr(0,_url.protocol.length-1)}`)
    if(isSSH){
        fs
            .copy(path.resolve(options.ssh_key_path), local_ssh_key_path)
            .then(
                ()=>{
                    console.log(`- copy ssh key to ${local_ssh_key_path}`)
                    console.log(`- check ssh key: ${path.resolve(path.join(local_ssh_key_path, options.ssh_key))} ${fs.existsSync(path.resolve(path.join(local_ssh_key_path, options.ssh_key)))?'has file':'none'}.`)
                    Promise.all([
                        exec(`chmod 600 ${path.resolve(path.join(local_ssh_key_path, options.ssh_key))}`).then(({stdout, stderr}) => { console.log(stdout, stderr) }),
                        // exec(`ls -l ${path.resolve(local_ssh_key_path)}`).then(({stdout, stderr}) => { console.log(stdout, stderr) })
                    ])
                },
                e=>console.error(`- copy ssh key to ${local_ssh_key_path} failed: `, e)
            )
            .then(()=>GitClone())
            .catch(err => console.error)
    }else{
        GitClone()
            .catch(err => console.error)
    }
}