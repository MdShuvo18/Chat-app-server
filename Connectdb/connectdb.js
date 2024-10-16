const mongoose = require('mongoose');
const url = `mongodb+srv://chat-app:admin24@cluster0.ameizfp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("connect to DB")).catch(() => console.log("error connecting to"))