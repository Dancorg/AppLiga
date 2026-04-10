import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';

async function register(req, res) {
    try {
        const { email, username, password, role } = req.body;

        // Validate valid email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate password strength (at least 8 characters, including letters and numbers)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long and include both letters and numbers' });
        } else if (password.length > 100) {
            return res.status(400).json({ message: 'Password must be less than 100 characters long' });
        }   

        // Validate username and role existence
        if (!username || !role) {
            return res.status(400).json({ message: 'Username and role are required' });
        }

        // Check if user already exists
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await hash(password, 10);

        // Create the user
        const userId = await userModel.createUser(email, username, hashedPassword, role);

        const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        console.log('Creating token for user:', user.user_id, 'with role:', user.role);

        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Decdoded token payload:', jwt.decode(token));

        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
}

async function deleteUser(req, res) {
    try {
        const { email } = req.body;

        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await userModel.deleteUserByEmail(email);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
}


export default {
    register,
    login,
    deleteUser
};