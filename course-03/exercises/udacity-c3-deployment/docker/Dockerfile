FROM nginx:alpine

RUN apk --no-cache add --virtual builds-deps build-base python

COPY nginx.conf /etc/nginx/nginx.conf