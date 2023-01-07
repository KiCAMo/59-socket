FROM node:16 AS builder

WORKDIR /app

COPY . .

RUN yarn
RUN yarn run build

WORKDIR /usr/src/app COPY --from=builder /app ./

EXPOSE 80
CMD [ "yarn", "start:prod" ]
