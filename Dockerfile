FROM --platform=${BUILDPLATFORM} node:24@sha256:8530f76a96d88820d288761f022e318970dda93d01536919fbc16076b7983e63 AS build

WORKDIR /opt/node_app

COPY . .

# do not ignore optional dependencies:
# Error: Cannot find module @rollup/rollup-linux-x64-gnu
RUN --mount=type=cache,target=/root/.cache/yarn \
    npm_config_target_arch=${TARGETARCH} yarn --frozen-lockfile --network-timeout 600000

ARG NODE_ENV=production

RUN npm_config_target_arch=${TARGETARCH} yarn build:app:docker

FROM node:24-alpine@sha256:e67514e5d0f6c46656005e1b693b2ec9d52e80b641307de684d4a015ba7a4eaf AS noderuntime

FROM nginx:stable-alpine-slim@sha256:2c605dbeab79a6b2a63340474fe58119d0ef95bdc4b1f41df0aa689659b3d13b

# node runtime for the scenes API sidecar (startos/api/server.mjs); copied from
# the official musl build rather than apk-installed so the image needs no
# package fetches at build time
COPY --from=noderuntime /usr/local/bin/node /usr/local/bin/node
COPY --from=noderuntime /usr/lib/libstdc++.so.6 /usr/lib/libgcc_s.so.1 /usr/lib/

COPY --from=build /opt/node_app/excalidraw-app/build /usr/share/nginx/html
COPY startos/api/nginx-default.conf /etc/nginx/conf.d/default.conf
COPY startos/api/server.mjs /usr/lib/excalidraw-api/server.mjs

HEALTHCHECK CMD wget -q -O /dev/null http://localhost || exit 1
