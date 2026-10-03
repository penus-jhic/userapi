FROM alpine:latest

RUN apk add --no-cache postgresql-dev
    
RUN apk add nodejs && \
    apk add npm

COPY . .

RUN npm install

CMD [ "npm", "run", "start" ]
