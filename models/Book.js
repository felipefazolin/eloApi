const mongoose = require('mongoose');

// Product Schema
const BookSchema = new mongoose.Schema({

        title: {
            type: String
        },

        cover: {
            type: String,
            default: "https://www.metmuseum.org/content/img/placeholders/NoImageAvailableIcon.png"
        },

        version: {
            type: Number
        },

        prefix: {
            type: String,
            uppercase: true,
            required: true,
            maxlength: 4
        },

        pin: {
            type: Array,

        },

        karaoke: {
            type: String        
        },

        music: {
            type: String        
        },

        video: {
            type: String        
        },


        date: {
            type: Date,
            default: Date.now
        }

    }

);


// Export User Schema
module.exports = mongoose.model('book', BookSchema);