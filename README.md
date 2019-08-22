# Siteminder challenge

Some newer features have been used in this project are as below
- Native ES6 modules in Node by using `--experimental-modules`, this is not fit for production and is not supported in some libs like Jest (yet).
- Express
- TypeScript
- Docker
- RabbitMQ

####Create .env file for below variables

````
PORT=3009
NODE_ENV=dev
AMQP_URL
MAILGUN_KEY
SENDGRID_KEY
````


### Installing dependcies

Install dependenies by running and running app

```
npm install
npm run rabbitmq
npm run build-ts
npm start
```

## Running the API

```
curl -X POST \
  http://localhost:3009/email \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -H 'postman-token: 698f916d-6faf-e5e0-34ad-0aa14596596e' \
  -d '{
	"to": "sandippagi@gmail.com",
	"cc": "",
	"bcc": "",
	"subject": "vjvjhvvljvl",
	"body": "hvhvljbjlb"
}'
```

![Alt text](circuitBreaker.png?raw=true "Title")

## Acknowledgments
Thank you reviewing the solution I look forward to hearing back from the technical team.
