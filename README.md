# SOURCE NODE BACKEND ASSIGNMENT
## ROLE BASED API FOR SCHOOL MANAGEMENT SOFTWARE

### HOW TO RUN THE API
> I. Use the given published API link on the internet

> II. Download the code and run on local machine

#### I. Published API Link = [Source Node API](https://source-node-api.herokuapp.com)

##### 1. This link consists of the API documentation published on Postman and can be used to test the API via Postman

#### II. Run on Local Machine *(Requires Node.js and MongoDB installed)*

##### 1. Download the code as a zip file from this repository
##### 2. Extract the zip file in a folder on your local machine
##### 3. Open the folder on any code editor of your choice
##### 4. Create a new file named `.env` in the main folder and configure the environment variables
##### 5. Sample contents of `.env` are as shown below
```
NODE_ENV=production
PORT=8080

DB=mongodb://127.0.0.1:27017/SourceNode

JWT_SECRET=my-super-secret-password-for-my-website
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
```
##### 6. Start the terminal and run the following two commands in the order given below
```
npm install
npm start
```
##### 7. Test the API by hitting various routes via Postman

### ADMIN LOGIN DETAILS
```
email: "admin@gmail.com",
password: "admin@123"
```
