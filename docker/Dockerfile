FROM node:lts-alpine

ARG entry

USER node

RUN mkdir -p /home/node/bin

ENV PATH=/home/node/bin:$PATH
ENV NODE_ENV=production

COPY --chown=node:node . /home/node/dist

RUN ln -s /home/node/dist/bin.mjs /home/node/bin/${entry} && chmod u+x /home/node/dist/bin.mjs

ENTRYPOINT [${entry}]