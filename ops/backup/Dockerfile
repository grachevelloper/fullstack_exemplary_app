FROM postgres:16.11-alpine

RUN apk add --no-cache aws-cli

COPY backup.sh /usr/local/bin/backup

ENTRYPOINT ["/usr/local/bin/backup"]
