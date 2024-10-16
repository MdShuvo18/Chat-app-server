const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

// imported file
const User = require('./Models/Users');
const Conversation = require('./Models/Conversation');

console.log('User Model:', User);

// database connection 
require('./Connectdb/connectdb')

// routes

// post api for register
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if all fields are provided
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const isAlreadyExist = await User.findOne({ email: email });
        if (isAlreadyExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        const newUser = new User({ fullName, email });

        // Hash the password and save the user
        bcryptjs.hash(password, 10, async (err, hashPassword) => {
            if (err) {
                return res.status(500).json({ message: "Error hashing password" });
            }

            newUser.set('password', hashPassword);
            await newUser.save();

            // Send success response
            res.status(201).json({ message: "User registered successfully" });
        });
    } catch (error) {
        // Error handling
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// post api for login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'email or password does not match' });
        } else {
            const user = await User.findOne({ email: email });
            if (!user) {
                return res.status(400).json({ message: 'email or password does not match' });
            } else {
                bcryptjs.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        return res.status(500).json({ message: "Error comparing passwords" });
                    }
                    if (!isMatch) {
                        return res.status(400).json({ message: 'email or password does not match' });
                    }
                    const JWT_SECRET_KEY = "your-secret-key"
                    // Generate token
                    const token = jwt.sign({ id: user._id }, JWT_SECRET_KEY, { expiresIn: '1h' });
                    res.json({ user: { email: user.email, name: user.fullName }, token });

                });

            }
        }

    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
})

// post api for conversation
app.post('/api/conversation', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body
        const newConversation = new Conversation({ members: [senderId, receiverId] })
        await newConversation.save()
        res.status(201).json({ message: "New Conversation created successfuly" })
    }
    catch {
        res.status(500).json({ message: 'Server error' })
    }
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})