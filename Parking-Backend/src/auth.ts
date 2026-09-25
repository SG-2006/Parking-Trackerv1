import { Router } from 'express'; // router is a way to group together all related requests in one place
import bcrypt from 'bcrypt';
import db from './db';
import jwt from 'jsonwebtoken';
import {SECRET_KEY} from './config';

const router = Router();
router.post('/signup', async (req, res) => {
// router.post = someone wants to send their information to the signup section i.e email and password
// req (request) = a box containing whatever the person sent 
// res (response) = your tool for sending something back, like "yes, account created" or "error"

const { email, password } = req.body;
// const = variable, req.body contrains data that was recieved by the backend
// req.body unpacks the two specific fields needed from the data

const hashedPassword = await bcrypt.hash(password, 10);
// bcrypt.hash(password, 10) - this command takes the password and scrambles it, the 10 is the salt rounds which is bascially how many times it scrambles the data
// higher salt rounds = more secure however also makes the program slower

db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)"). run(email, hashedPassword)
// db.prepare - takes an SQL statement as text and prepares it to run, ? characters are placeholders - blanks to be filled in later instead of typing into the string
// INSERT INTO users (email, password_hash) - add a new specific column, and I will give values for these 2
//  - creates a new row in the users table, stores data so that the account and password can be used to access 
// VALUES (?,?) 2 blanks, matching the columns listed above, in the same order
// .run(email, hashedPassword) - actually executes the prepared statement, filling the first ? with the email and the second with the hashed password
// the reason we use ? as placeholders is so that a malicious user can't exploit it by writing something as their email which breaks out of the string allowing them to run their own SQL comman
// using placeholders '?' also means that sqlite3 handles the data purely as data and not a code to execute

res.status(201).send('User created');
// res.status sets the HTPP status code, 201 specifically means created (201 is the standard for something new was successfully made)


});
router.post('/login', async (req, res) => {

const { email, password } = req.body;
// req.body unpacks the two fields required from the data aka the email and password

const userInfo = db.prepare("SELECT * FROM users WHERE email =?").get(email) 
// variable userInfo = db prepare - keeps an SQL ready to run, think load this instruction, but don't execute it
// and you put ? as a placeholder that you would fill out later, and the get email is the execution part which will check the data for an email that matches

if (!userInfo) { return res.status(401).send('Account does not exist')}
// command for if the user hasn't made an account and attempts to login, they will be given a 401 error with the message account does not exist 

const isValid = await bcrypt.compare(password, userInfo.password_hash)
if (!isValid) { return res.status(401).send('invalid email or password')}
// const isValid - pause the function until comparison is complete, compare typed password to password_hash to see if matches
// if !isvalid - send a 401 status with the message invalid password if password is false
// return - basically an if statement, it stops the program from running both res 401 and 200

const token = jwt.sign({ id: userInfo.id, role: userInfo.role }, SECRET_KEY);
// jwt.sign - jsonwebtokens method for creating a token
// id pulled from UserInfo and role pulled from UserInfo

res.status(200).send({ token: token})

});



export default router;


