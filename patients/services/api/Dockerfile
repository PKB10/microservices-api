FROM node:14

WORKDIR /srv
ADD . .
RUN npm install

EXPOSE 8081
CMD ["node", "services.js"]
