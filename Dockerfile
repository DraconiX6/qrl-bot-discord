FROM node:14.4.5

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm i

COPY . .

CMD ["node", "index.js"]