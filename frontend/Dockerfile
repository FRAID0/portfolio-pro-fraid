FROM node:20-alpine

# Installation des dépendances système pour Linux (essentiel pour Next.js)
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# On lance en mode dev avec webpack forcé
CMD ["npm", "run", "dev", "--", "--webpack"]