const fs = require("fs-extra")
const path = require("path")
const url = require('url')

module.exports = function(options){
    options = Object.assign({
        cwd: "tmp",
        overwrite: true,
        source: "dist",
        output: "dist",
        auth: null,
        repository: null,
        config: null
    }, options)
    const repository = Object.assign({ url: "", branch: "master", commitLabel: "update by drone-plugin-git-sync" }, options.repository)
    const auth = options.auth
    const config = options.config
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

    console.log(`1 set`)
    Git
        .silent(true)
        .clone(remote, repository_name)
        .then(()=>console.log(`- clone repositopy: ${repository.url}`))
        // .then(()=>fs.writeFileSync("./dist/ddfile/testfile.txt", `${Date.now()}`)) //test
        .then(()=>Git.checkout(repository.branch))
        .then(()=>Git.branchLocal())
        .then(branchInfo=>console.log(`- checkout branch:${branchInfo.current}`))
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
            const msg = `- copy '${options.source}' to '${repository_name}/${options.output}'`
            return fs.copy(options.source, path.join(repository_path, options.output), {overwrite: true})
                     .then(()=>console.log(msg))
                     .catch(e=>console.error('- failed: '+msg, e))
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