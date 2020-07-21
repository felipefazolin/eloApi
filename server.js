const express = require('express') // import express
const app = express(); // import express
const mongoose = require('mongoose'); // import mongoose (db package)
require('dotenv').config(); // hide variables

const bodyParser = require('body-parser'); // import body-parser


const adminRoute = require('./routes/admin'); // import routs to products
const userRoute = require('./routes/user'); // import routs to products

const cors = require('cors')

app.use(cors())

//////////Parsing//////////

app.use(bodyParser.json()); // make parsing json in all routes
app.use(bodyParser.urlencoded({
    extended: true
})); // make urlencoding


//////////Set routes//////////
app.use('/admin', adminRoute); // set routs to products
app.use('/user', userRoute); // set routs to products


//////////Connect to db//////////

mongoose.connect(
    process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true, // uncoment on release
        useFindAndModify: false,
        useCreateIndex: true
    },
    () => {
        console.log('Connected to DB!');

    });

//////////Start server//////////

app.listen(process.env.PORT); // start server
//killall -9 node