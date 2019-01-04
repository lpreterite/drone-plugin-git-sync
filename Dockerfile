FROM node:8.11.4

COPY . /home/drone-plugin-git-sync
RUN cd /home/drone-plugin-git-sync&&npm install
ENTRYPOINT ["/home/drone-plugin-git-sync/bin/git-sync"]