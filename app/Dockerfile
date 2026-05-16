FROM node:24-alpine
WORKDIR /workspace
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4200
ENTRYPOINT ["node", "scripts/write-runtime-config.mjs"]
CMD ["npm", "start"]
