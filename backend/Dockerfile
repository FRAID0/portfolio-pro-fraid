FROM node:20-alpine

WORKDIR /app

# On copie d'abord les fichiers de dépendances
COPY package*.json ./
RUN npm install

# On copie le reste du code
COPY . .

# On expose le port de l'API
EXPOSE 5000

CMD ["node", "server.js"]