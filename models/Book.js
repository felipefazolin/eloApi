const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');



// Product Schema
const BookSchema = new mongoose.Schema({

        title: {
            type: String,
            unique: true
        },

        lote: {
            type: Number
        },

        prefix: {
            type: String,
            unique: true,
            uppercase: true,
            required: true,
            maxlength: 4
        },

        pin: {
            type: Array,

        },

        date: {
            type: Date,
            default: Date.now
        }

    }

);

BookSchema.plugin(uniqueValidator);

// Export User Schema
const Book = module.exports = mongoose.model('book', BookSchema);