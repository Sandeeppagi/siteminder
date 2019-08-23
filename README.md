# Siteminder challenge

Some newer features have been used in this project are as below
- Express
- TypeScript
- Docker
- RabbitMQ

####Create .env file for below variables

````
PORT=3009
NODE_ENV=dev
APPROACH
AMQP_URL
AMQP_LOCAL
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
### Solution

Hosted on AWS 
- Endpoint http://18.217.47.106:3009/email
- RabbitMQ http://18.217.47.106:15672, user: guest, password: guest

I have solved the given problem with 2 approaches both uses RabbitMQ

- ApproachOne: Failure/Toggle over to available queue in case of failure
- ApproachTwo: Implement circuit breaker with DLX queues

###### ApproachOne

Below are logs when email is sent vai MailGun, the request fails for the domain property of mailgun.
We see 2 logs, failure log for mailgun and success for the sendgrid for the same email.

````
Running server on port 3009
POST /email [object Object]
Email sent MG
Email failed mailgun-2 Error: Domain not found: www.google.com
    at IncomingMessage.<anonymous> (/Users/sandy/Projects/siteminderTest/node_modules/mailgun-js/lib/request.js:327:17)
    at IncomingMessage.emit (events.js:214:15)
    at endReadableNT (_stream_readable.js:1178:12)
    at processTicksAndRejections (internal/process/task_queues.js:77:11) {
  statusCode: 404
}
Email sent SG
Email sent {
  from: 'sandippagi@gmail.com',
  subject: 'vjvjhvvljvl',
  text: 'hvhvljbjlb',
  to: 'sandippagi@gmail.com',
  isMultiple: false,
  substitutionWrappers: [ '{{', '}}' ]
}

```` 
###### Running the API

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

###### ApproachTwo

![Alt text](circuitBreaker.png?raw=true "Title")


#### Acknowledgments
Thank you reviewing the solution I look forward to hearing back from the technical team.
