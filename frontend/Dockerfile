FROM node:14
WORKDIR /root/webapp

COPY package.json yarn.lock ./
RUN yarn

COPY webpack.config.js tsconfig.json ./
COPY src/ src/
ENV NODE_ENV production
RUN yarn build
