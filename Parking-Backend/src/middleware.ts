import jwt from 'jsonwebtoken'
import { SECRET_KEY } from './config';

const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization
    const token = authHeader.split(' ')[1]; 
 // the middleware here essentially take the token embedded in the bearer from the auth login and verifies it against the secret key, if genuine the server will know who is making this request without having to check the database again

try {
    const decoded = jwt.verify(token, SECRET_KEY)
    req.user = decoded;
    next() // req.user is grabbing the info that is revieved and storing it so that your code can read from it
}   catch (error) {
    return res.status(401).send('Invalid token'); 
} // cannot use a if (!) since jwt doesn't return true/false, it either sucessfully decodes the data or returns an error and thats why we need to use catch

}

export default checkAuth;