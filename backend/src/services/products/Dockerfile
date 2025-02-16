FROM node:21-alpine3.18 

USER node
RUN mkdir /home/node/app
WORKDIR /home/node/app

EXPOSE 3000
ARG ENV=production
COPY --chown=node:node package* ./
RUN  npm update @karma-packages/conceptocar-common
RUN npm install 
COPY --chown=node:node . .
ENV NODE_ENV $ENV
RUN npm run build
CMD npm run $NODE_ENV

