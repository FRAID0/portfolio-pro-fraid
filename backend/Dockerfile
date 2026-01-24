FROM node:20-alpine

WORKDIR /app

# 1️⃣ Dépendances
COPY package*.json ./
RUN npm install

# 2️⃣ Code source
COPY . .

# 3️⃣ 🔴 OBLIGATOIRE POUR PRISMA + DOCKER
RUN npx prisma generate

# 4️⃣ Port API
EXPOSE 5000

# 5️⃣ Lancement
CMD ["node", "server.js"]
