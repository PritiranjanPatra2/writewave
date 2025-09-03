import express from 'express'
import { isAuth, login, register } from '../controllers/authController.js';
const authRoute=express.Router();
authRoute.post('/login', login);
authRoute.post('/register',register);
authRoute.get('/profile',isAuth)
export default authRoute;
