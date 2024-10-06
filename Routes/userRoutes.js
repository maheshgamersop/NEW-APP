import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../jwt/genrateToken.js';
import upload from '../models/upload.js';

const routes = express.Router();
// SIGN UP ROUTE
routes.post('/signup', upload.single('profile'), async (req, res) => {
    const { name, email, password, phone_num } = req.body;
    
    if (!name || !email || !password || !phone_num) {
        return res.status(400).json({ message: 'Please fill all the fields' });
    }
    const existedUser = await User.findOne({ email})
    if(existedUser) return res.status(400).json({ message: 'User already exist'});
    try {
        const newUser = await User.create({
            name,
            email,
            password, // Store hashed password
            profile: req.file?.path, // Handle file path if available
            phone_num
        });
        console.log(newUser)
        const data = {
            name: newUser.name,
            email: newUser.email,
            _id: newUser._id,
            phone_num: newUser.phone_num,
            profile: newUser.profile
        };

        return res.status(201).json({
            message: 'User created successfully',
            data,
            token: generateToken(newUser._id)
        });
    } catch (error) {
        if(error.code === 11000) return res.status(400).json({ message: 'User already exist'})
        return res.status(500).json({ message: 'Something went wrong! please try again later.'})
    }
        
    });

// LOGIN ROUTE
routes.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please fill all the fields' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email does not exist' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Password does not match' });
        }

        const data = {
            name: user.name,
            email: user.email,
            _id: user._id,
            phone_num: user.phone_num,
        };

        return res.status(200).json({
            message: 'Login successful',
            data,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'INTERNAL SERVER ERROR' });
    }
});

export default routes;
