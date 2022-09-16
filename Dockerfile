FROM node:8.16.0-alpine

RUN apk update && apk add git openssh-client
RUN git --version
COPY . /home/drone-plugin-git-sync
RUN cd /home/drone-plugin-git-sync \
    && npm ci
ENTRYPOINT ["/home/drone-plugin-git-sync/bin/git-sync"]