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
        url: https://github.com/lpreterite/vue-tinymce.git
        branch: master
    git_config:
        name: 'Packy-tang'
        email: 'lpreterite@126.com'
    git_auth_username:
        from_secret: username
    git_auth_password:
        from_secret: password
```

Use ssh:

```yml

kind: pipeline
name: default

setps:
- name: git-sync
  image: lpreterite/drone-plugin-git-sync
  volumes:
  - name: sshkeys
    path: /ssh/keys/
  settings:
    overwrite: "true"
    copy:
        - "dist:public"
    repository:
        url: ssh://github.com/lpreterite/vue-tinymce.git
        branch: master
    git_config:
        name: 'Packy-tang'
        email: 'lpreterite@126.com'
    ssh_key: id_rsa
    ssh_key_path: /ssh/keys/

volumes:
- name: sshkeys
  host:
    path: /ssh/keys/
```

> Use volumes set must set `Trusted` with true in [Repository]->[SETTINGS] on drone

## Options

| env                      | in yml            |                                                                        |
|--------------------------|-------------------|------------------------------------------------------------------------|
| PLUGIN_CWD               | cwd               | `string`, 仓库下载处理目录，默认为`./tmp/`                              |
| PLUGIN_OVERWRITE         | overwrite         | `string`, 拷贝文件时是否复写文件，默认为"true"                          |
| PLUGIN_REPOSITORY        | repository        | `json`, 仓库信息，默认为`{"url":"[Repository Url]", "branch":"master"}` |
| PLUGIN_COPY              | copy              | `array`, 拷贝文件的设置，设置方式为："[source path]:[target path]"       |
| PLUGIN_GIT_CONFIG        | git_config        | `json`, git设置，目前只支持设置`name`和`email`                          |
| PLUGIN_GIT_AUTH_USERNAME | git_auth_username | `string`, 仓库授权的账户名，用于http方式push仓库时使用                  |
| PLUGIN_GIT_AUTH_PASSWORD | git_auth_password | `string`, 仓库授权的密码，用于http方式push仓库时使用                    |
| PLUGIN_SSH_KEY           | ssh_key           | `string`, 仓库授权私钥名称，用于ssh方式push仓库时使用                   |
| PLUGIN_SSH_KEY_PATH      | ssh_key_path      | `string`, 仓库授权私钥地址，用于ssh方式push仓库时使用                   |

## Build

```sh
docker build -t lpreterite/drone-plugin-git-sync .
```

> `from_secret`作用的参数需要在drone版面下找到`SETTINGS->Secrets`进行添加