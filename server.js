const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://mikailg7:UaqLhkX3PjZ464on@cluster0.8mvgyya.mongodb.net/mydatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function () {
    console.log('Connected successfully to MongoDB server.');
});

// Define User and Group schemas
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    birthday: Date,
    ssn: String,
    address: String,
    email: String,
    phoneNumber: String,
    workUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    username: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

const groupSchema = new mongoose.Schema({
    name: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Group = mongoose.model('Group', groupSchema);

// Route to create a new user
app.post('/create-user', (req, res) => {
    bcrypt.hash(req.body.password, 10)
        .then((hashedPass) => {
            let user = new User({
                ...req.body,
                password: hashedPass,
            });
            return user.save(); // Return the save operation promise
        })
        .then((savedUser) => {
            return Group.updateOne({ _id: savedUser.workUnit }, { $push: { users: savedUser._id } });
        })
        .then(() => {
            res.status(200).json({ status: 'success' });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error saving user');
        });
});

// Route to create a new group
app.post('/create-group', (req, res) => {
    const group = new Group(req.body);
    group.save((err, savedGroup) => {
        if (err) {
            res.status(500).send('Error saving group');
        } else {
            res.status(200).json({ status: 'success' });
        }
    });
});

// Route to authenticate a user
app.post('/login', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({ username: username })
        .then((user) => {
            if (user) {
                bcrypt.compare(password, user.password, function (err, result) {
                    if (err) {
                        res.json({
                            error: err,
                        });
                    }
                    if (result) {
                        let token = jwt.sign({ name: user.name }, 'verySecretValue', {
                            expiresIn: '1h',
                        });
                        res.json({
                            message: 'Login Successful!',
                            token,
                        });
                    } else {
                        res.json({
                            message: 'Password does not match!',
                        });
                    }
                });
            } else {
                res.json({
                    message: 'No user found!',
                });
            }
        });
});

app.listen(3000, function () {
    console.log('Server is running on port 3000');
});
