const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

const port = 5000

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cors())

// imported file
const User = require('./Models/Users');
const Conversation = require('./Models/Conversation');
const Messages = require('./Models/Messages');
const { default: mongoose } = require('mongoose');
const Users = require('./Models/Users');

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
                    res.json({ user: { id: user._id, email: user.email, name: user.fullName }, token });

                });

            }
        }

    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});

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
});

// get api for conversation id
app.get('/api/conversation/:userId', async (req, res) => {
    try {
        const userId = req.params.userId
        const conversations = await Conversation.find({ members: { $in: [userId] } })
        const conversationUsersData = Promise.all(conversations.map(async (conversation) => {
            const otherUserId = conversation.members.find(member => member !== userId)
            const otherUser = await User.findById(otherUserId)
            return {
                conversationId: conversation._id,
                userId: otherUserId,
                userName: otherUser.fullName,
                email: otherUser.email

            }

        }))
        res.status(200).json(await conversationUsersData)
    }
    catch { }
});

// post api for messages
app.post('/api/messages', async (req, res) => {
    try {
        const { conversationId, senderId, message } = req.body
        const newMessage = new Messages({ conversationId, senderId, message })
        await newMessage.save()
        res.status(201).json({ message: "New Message created successfuly" })
    }
    catch {
        res.status(500).json({ message: 'Server error' })
    }
});

// get api for messages
app.get('/api/messages/:conversationId', async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        if (conversationId == 'new') {
            return res.status(200).json([])
        }
        const messages = await Messages.find({ conversationId: conversationId });
        const messageUserData = Promise.all(messages.map(async (message) => {
            const user = await Users.findById(message.senderId);
            return { user: {id:user?._id, email: user?.email, fullName: user?.fullName }, message: message.message }
        }))
        res.status(200).json(await messageUserData)
        // console.log("Received conversationId:", conversationId);

        // // Fetch messages based on the ObjectId or String
        // const messages = await Messages.find({
        //     conversationId: new mongoose.Types.ObjectId(conversationId)
        // }).sort({ createdAt: 'asc' });
        // console.log(messages)

        // // Return the messages if found
        // res.status(200).json([{messages: messages}]);
    } catch (error) {
        // Log the full error to the console for debugging
        console.error("Detailed error stack:", error.stack);  // This gives the full error message and stack trace

        // Return a more informative error message
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});



// get api for all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.status(200).json(users);
    }
    catch {
        res.status(500).json({ message: 'Server error' })
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});