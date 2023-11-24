FROM node:18-alpine AS builder

WORKDIR /app

EXPOSE 8080

COPY package*.json ./

RUN npm install

RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

# run the built nestjs application

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]
