# Pulse media

Media service for Pulse Messenger

## How to run

- install the dependencies with node lts/hydrogen

```bash
npm i
```
  
- create a .env file

```env
JWT_SECRET=Your JWT secret - must be the same as the API one
DATABASE_ACCESS=Your mongo connection string

APP_PORT=Your port

S3_ENDPOINT=Your S3 endpoint
S3_ACCESS_KEY=Your S3 access key
S3_SECRET=Your S3 secret
S3_BUCKET=Your S3 bucket name

CLIENT_PATH=Your client url
```

- run the service with

```bash
npm run build

npm start
```

- test the service with

```bash
npm run watch
```

## Docker

```bash
# build with
docker build -t media .

# run with
docker run 
  -p 6060:6060
  --env-file .env
  media
```
