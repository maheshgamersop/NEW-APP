import express from 'express';
import user from '../models/user.js';
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

    try {
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await user.create({
            name,
            email,
            password,
            profile: req.file?.path, // Handle file path if available
            phone_num
        });

        const data = {
            name: newUser.name,
            email: newUser.email,
            _id: newUser._id,
            phone_num: newUser.phone_num,
        };

        return res.status(201).json({
            message: 'User created successfully',
            data,
            token: generateToken(newUser._id)
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'INTERNAL SERVER ERROR' });
    }
});

// LOGIN ROUTE
routes.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please fill all the fields' });
    }

    try {
        const users = await user.findOne({ email });
        if (!users) {
            return res.status(400).json({ message: 'Email does not exist' });
        }

        const isPasswordMatch = await bcrypt.compare(password, users.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: 'Password does not match' });
        }

        const data = {
            name: users.name,
            email: users.email,
            _id: users._id,
            phone_num: users.phone_num,
        };

        return res.status(200).json({
            message: 'Login successful',
            data,
            token: generateToken(users._id)
            
        });
        console.log("hit")
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'INTERNAL SERVER ERROR' });
    }
});

export default routes;
