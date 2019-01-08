FROM node:8.11.4

RUN apt-get install openssh-client
COPY . /home/drone-plugin-git-sync
RUN cd /home/drone-plugin-git-sync&&npm install
ENTRYPOINT ["/home/drone-plugin-git-sync/bin/git-sync"]