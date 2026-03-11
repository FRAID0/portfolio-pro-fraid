FROM node:20-alpine

# Installation des dépendances système pour Linux (essentiel pour Next.js)
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the Next.js app
RUN npm run build

EXPOSE 3000

# Start in production mode
CMD ["npm", "start"]