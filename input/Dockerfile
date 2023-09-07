FROM node:lts-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache git

USER node

RUN mkdir -p /home/node/bin

ENV PATH=/home/node/bin:$PATH
ENV NODE_ENV=production

COPY --chown=node:node . /home/node/dist

RUN ln -s /home/node/dist/bin.mjs /home/node/bin/entrypoint && chmod u+x /home/node/dist/bin.mjs

ENTRYPOINT ["entrypoint"]
