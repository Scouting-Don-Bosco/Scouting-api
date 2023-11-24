FROM node:18-alpine as development

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/
COPY .env* ./
COPY tsconfig.json ./

RUN npm install

RUN npm run db:migrate

COPY . .

RUN npm run build

FROM node:18-alpine as production

COPY package*.json ./
COPY .env* ./
COPY prisma ./prisma/

RUN npm install 
RUN npm run db:migrate

COPY . .

COPY --from=development /usr/src/app/dist ./dist
# Add the package.json for usage of scripts

CMD ["npm", "run", "start:prod"]
