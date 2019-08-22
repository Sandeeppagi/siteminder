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
npm test
```

## Running the tests

```
npm test
```

![Alt text](circuitBreaker.png?raw=true "Title")

## Acknowledgments
Thank you reviewing the solution I look forward to hearing back from the technical team.
