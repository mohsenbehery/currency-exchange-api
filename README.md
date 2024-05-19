## Currency Exchange API

This repository contains the source code for the Currency Exchange API, which allows users to convert currency amounts, manage user accounts, and view transaction history.

### Prerequisites

Before running the application, ensure you have the following prerequisites installed on your system:

- Node.js
- MongoDB

# Installation

##Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/currency-exchange-api.git
```
##Navigate to the project directory:

```bash
cd currency-exchange-api
```
##Install dependencies:

```bash
npm install
```

Configuration.
Set up environment variables:<br>
Create a .env file in the root directory.<br>
Add the following environment variables:

```bash
PORT=3000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret_key>
```
##Running the Application
To start the server, run the following command:

```bash
npm start
```

The server will start listening on port 3000 by default.<br> You can access the API at http://localhost:3000.

##Testing

To run unit tests, use the following command:

```bash
npm test
```

###Currency Exchange API Documentation<br>
Authentication:
The API uses JWT-based authentication for securing user-related endpoints.<br> Users need to register and obtain an authentication token to access protected endpoints.

##Endpoints:<br>
###Convert Currency<br>
--Endpoint: POST /convert<br>
Description: Converts currency amounts between different currencies.<br>
-Request Format:
```bash
{
  "amount": 100,
  "sourceCurrency": "USD",
  "targetCurrency": "EUR"
}
```
-Response Format:
```bash

{
  "convertedAmount": 87.32,
  "sourceCurrency": "USD",
  "targetCurrency": "EUR"
}
```
###User Registration<br>
--Endpoint: POST /user/register<br>
Description: Allows users to register by providing a username and password.<br>
-Request Format:
```bash
{
  "email": "example_email@mm.com",
  "username": "example_user",
  "password": "example_password"
}
```
###User Login
--Endpoint: POST /user/login<br>
Description: Allows users to authenticate themselves using their username and password.<br>
Request Format:
```bash
{
  "email": "example_email@mm.com",
  "password": "example_password"
}
```
Response Format:
```bash
{
  "token": "<JWT_token>"
}
```
User Transaction History<br>
Endpoint: GET /user/history<br>
Description: Displays the transaction history for the authenticated user.<br>
Request Format:Headers:Authorization: Bearer <JWT_token>
Response Format:
```bash
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
