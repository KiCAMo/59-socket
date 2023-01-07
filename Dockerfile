FROM node:16 AS builder

WORKDIR /app

COPY . .

RUN yarn
RUN yarn run build

FROM 055734316929.dkr.ecr.ap-northeast-1.amazonaws.com/node:latest
WORKDIR /usr/src/app COPY --from=builder /app ./

EXPOSE 80
CMD [ "yarn", "start:prod" ]
