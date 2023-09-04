FROM ubuntu:20.04

RUN apt-get update && apt-get install -y \
    nfs-kernel-server \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /srv/exports

COPY etc-exports /etc/exports
COPY start.sh /bin/start

RUN chmod u+x /bin/start

# expose NFSv4 port
EXPOSE 2049/tcp

CMD ["/bin/start"]
