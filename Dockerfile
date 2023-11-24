FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY .env* ./
COPY tsconfig.json ./

RUN npm install

RUN npm run db:migrate

COPY . .

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

# run the built nestjs application
EXPOSE 8080

COPY --from=builder /app/dist ./dist

CMD ["npm", "run", "start:prod"]
