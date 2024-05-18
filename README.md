<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->


Currency Exchange API
This repository contains the source code for the Currency Exchange API, which allows users to convert currency amounts, manage user accounts, and view transaction history.

Prerequisites
Before running the application, ensure you have the following prerequisites installed on your system:

Node.js
MongoDB
Installation
Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/currency-exchange-api.git
```
Navigate to the project directory:

```bash
cd currency-exchange-api
```

Install dependencies:

```bash
npm install
```

Configuration
Set up environment variables:
Create a .env file in the root directory.
Add the following environment variables:
```bash
PORT=3000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret_key>
```
Running the Application
To start the server, run the following command:

```bash
npm start
```
The server will start listening on port 3000 by default. You can access the API at http://localhost:3000.

Testing
To run unit tests, use the following command:
```bash
npm test
```


Currency Exchange API Documentation

Authentication:
The API uses JWT-based authentication for securing user-related endpoints. Users need to register and obtain an authentication token to access protected endpoints.

_ _ _ _ _ _ _ _ _ _ _ _ _ _ _  _ _ _ _  _ _ _

Endpoints:
```
```
Endpoints:
1. Convert Currency
Endpoint: POST /convert
Description: Converts currency amounts between different currencies.
Request Format:
Headers:
Authorization: Bearer <JWT_token>
Body:
json
Copy code
{
"amount": 100,
"sourceCurrency": "USD",
"targetCurrency": "EUR"
}
Copy code
Response Format:
json
Copy code
{
  "convertedAmount": 87.32,
  "sourceCurrency": "USD",
  "targetCurrency": "EUR"
}
```
-----
```
2. User Registration
Endpoint: POST /user/register
Description: Allows users to register by providing a username and password.
Request Format:
{
  "email": "example_email@mm.com"
  "username": "example_user",
  "password": "example_password"
}
```
-----
```
3. User Login
Endpoint: POST /user/login
Description: Allows users to authenticate themselves using their username and password.
Request Format:
{
  "email": "example_email@mm.com"
  "password": "example_password"
}
Response Format:
{
  "token": "<JWT_token>"
}
```
-----
```
4. User Transaction History
Endpoint: GET /user/history
Description: Displays the transaction history for the authenticated user.
Request Format: Headers: Authorization: Bearer <JWT_token>
Response Format:
{
  "transactions": [
    {
      "timestamp": "2024-05-20T08:00:00Z",
      "sourceCurrency": "USD",
      "sourceAmount": 100,
      "targetCurrency": "EUR",
      "convertedAmount": 87.32
    }
  ]
}
```
-----
```



