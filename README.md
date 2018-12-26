# drone-plugin-git-sync

同步代码至另一个项目的`drone`插件，主要操作：拉取指定仓库后拷贝代码至相应目录并提交推送。

## Usage

Execute from the working directory:

```sh
docker run --rm \
    -e PLUGIN_GIT_AUTH_USERNAME=xxx \
    -e PLUGIN_GIT_AUTH_PASSWORD=xxxxxx \
    -e PLUGIN_GIT_CONFIG='{"name": "packy-tang", "email": "xxx@xxx.com"}' \
    -e PLUGIN_REPOSITORY='{"url":"https://github.com/lpreterite/drone-plugin-git-sync.git", "branch":"master"}' \
    -e PLUGIN_COPY=dist:public2,dist/index.html:resources/views/index.php \
    -v $(pwd):$(pwd) \
    -w $(pwd) \
  lpreterite/drone-plugin-git-sync
```

The setting in drone plugin:

```yml
kind: pipeline
name: default

setps:
- name: git-sync
  image: lpreterite/drone-plugin-git-sync
  settings:
    overwrite: "true"
    copy:
        - "dist:public"
    repository:
        url: https://github.com/lpreterite/vue-tinymce
        branch: master
    git_config:
        name: 'Packy-tang'
        email: 'lpreterite@126.com'
    git_auth_username:
        from_secret: username
    git_auth_password:
        from_secret: password
```

> `from_secret`作用的参数需要在drone版面下找到`SETTINGS->Secrets`进行添加