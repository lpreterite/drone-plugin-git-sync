# drone-plugin-git-sync

[![Docker Automated build](https://img.shields.io/docker/automated/lpreterite/drone-plugin-git-sync)](https://hub.docker.com/r/lpreterite/drone-plugin-git-sync)

同步代码至另一个项目的`drone`插件，主要操作：拉取指定仓库后拷贝代码至相应目录并提交推送。

## Usage

Execute from the working directory:

```sh
MSYS_NO_PATHCONV=1 docker run --rm \
    -e PLUGIN_ACCOUNT='{"username": "packy-tang", "password": "******"}' \
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
              name: "Packy-tang"
              email: "lpreterite@126.com"
          git_account:
              username:
                  from_secret: username
              password:
                  from_secret: password
```

Use ssh and set ssh_key:

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
              url: ssh://github.com/lpreterite/vue-tinymce.git
              branch: master
          git_config:
              name: "Packy-tang"
              email: "lpreterite@126.com"
          git_ssh_key: 
              from_secret: ssh_key
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
              name: "Packy-tang"
              email: "lpreterite@126.com"
          git_ssh: /ssh/keys/id_rsa

volumes:
    - name: sshkeys
      host:
          path: /ssh/keys/
```

## Options

| env                | yml               |                                                                                                                              |
| ------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| PLUGIN_CWD         | cwd               | `string`, 仓库下载处理目录，默认为`./tmp/`                                                                                   |
| PLUGIN_OVERWRITE   | overwrite         | `string`, 拷贝文件时是否复写文件，默认为"true"                                                                               |
| PLUGIN_REPOSITORY  | repository        | `json`, 仓库信息，默认为`{"url":"[Repository Url]", "branch":"master", "commit_label": "update by drone"}`                   |
| PLUGIN_COPY        | copy              | `array`, 拷贝文件的设置，设置方式为："[source path]:[target path]"                                                           |
| PLUGIN_GIT_CONFIG  | git_config        | `json`, git 设置，目前只支持设置`name`和`email`，接受格式：`{ name: '[yourname]', email:'[yourname@mail.com]' }`             |
| PLUGIN_GIT_ACCOUNT | git_auth_username | `string`, 仓库授权的账户与密码，用于 http 方式 push 仓库时使用，接受格式： `{ username: '[username]', password: '[******]'}` |
| PLUGIN_GIT_SSH     | git_ssh           | `string`, 仓库授权私钥地址，用于 ssh 方式 push 仓库时使用                                                                    |
| PLUGIN_GIT_SSH_KEY     | git_ssh_key           | `string`, 仓库授权私址，用于 ssh 方式 push 仓库时使用。                                                                    |
| PLUGIN_GIT_CLONE_DEPTH     | git_clone_depth           | `number`,默认值为`1`, 拉取仓库时保留历史数目，默认设置1，用于加快仓库拉取。                                                                   |

## Build

```sh
docker build -t lpreterite/drone-plugin-git-sync .
```

> `from_secret`作用的参数需要在 drone 版面下找到`SETTINGS->Secrets`进行添加
