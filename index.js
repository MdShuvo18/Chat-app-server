const express = require('express');

const app = express();
const port = 5000

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

// imported routes
const Users = ('./Models/Users.js')


// database connection 
require('./Connectdb/connectdb')

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})