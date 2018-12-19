FROM node:8.11.4

COPY . /drone-plugin-git-sync
CMD cd /drone-plugin-git-sync&&npm install
ENTRYPOINT ["/drone-plugin-git-sync/bin/git-sync"]