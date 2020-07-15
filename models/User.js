const mongoose = require('mongoose');


// Product Schema
const UserSchema = new mongoose.Schema({

        name: {
            type: String

        },

        email: {
            type: String

        },


        password: {
            type: String
        },

        token: {
            type: String,
            default: ""
        },



        pinBook: [{

            bookTitle: {
                type: String
            },
            bookPin: {
                type: String
            },
            bookId: {
                type: String
            },
            pinDate: {
                type: Date,
                default: Date.now
            }

        }],

        date: {
            type: Date,
            default: Date.now
        }

    }

);


// Export User Schema
module.exports = mongoose.model('users', UserSchema);