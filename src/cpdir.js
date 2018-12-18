const path = require('path')
const fs = require('fs')
const glob = require('glob')
module.exports = function(target, output, options){
    options = Object.assign({
        overwrite: true //默认true，存在文件会复写文件；false 会删除output目录文件在搬运
    }, options)

    return new Promise((resovle,reject)=>{
        glob(`**`, {cwd:target}, function(err, files){
            if(err) return reject(err)
            if(!fs.existsSync(output)) fs.mkdirSync(output)
            if(!options.overwrite) fs.rmdirSync(output)
            files
                .forEach(file=>{
                    const _path = path.join(target,file)
                    const _outpath = path.join(output,file)
                    const stat = fs.statSync(_path)
                    if(stat.isDirectory() && !fs.existsSync(_outpath)) fs.mkdirSync(_outpath)
                    if(stat.isFile()) fs.copyFileSync(_path, _outpath, fs.constants.COPYFILE_FICLONE)
                })
            resovle(files)
        })
    })
}