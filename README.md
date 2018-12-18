# drone-plugin-git-sync

搬运代码至某仓库的的drone插件

## How to Use

```yml
kind: pipeline
name: default

setps:
- name: git-sync
  image: lpreterite/drone-plugin-git-sync
  settings:
    overwrite: "true"
    directory:
        - "dist:public"
    auth:
        username: xxx
        password: xxxxxxxxx
    repository:
        url: https://github.com/lpreterite/vue-tinymce
        branch: master
```