FROM node:20.10.0

WORKDIR /usr/src/btx_editor

COPY package*.json ./

RUN mkdir result

RUN mkdir uploads

RUN npm install

COPY . .

RUN apt-get update -y

EXPOSE 443

CMD ["npm", "start"]
