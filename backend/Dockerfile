FROM node:20-alpine

WORKDIR /app

# Copy only package.json & package-lock.json for install
COPY package*.json ./

RUN npm install

# Copy the rest of the app
COPY . .

EXPOSE 5000

# Use node directly to avoid npm wrapping issues
CMD ["node", "server.js"]
