const express = require('express'); // import express
const router = express.Router(); // create router to export

const Book = require('../models/Book');

router.post('/register', (req, res) => {

    var qtd = req.body.qtd
    var pin = [];
    var prefix = req.body.prefix;
    var lote = req.body.lote;

    Book.findOne({
        $or: [{
                'title': req.body.title,
            }, {
                'prefix': req.body.prefix
            }

        ]
    }, function (err, result) {
        if (err) {
            throw err;
        } //There was an error with the database.
        if (!result) {

            console.log("O título e o prefixo está disponível.");

            geraPin();

            var book = new Book({
                title: req.body.title,
                prefix: req.body.prefix,
                lote: req.body.lote,
                pin: pin
            });

            book.save()

                //validate
                .then(function (newBook) {
                    console.log('\n' + 'New book created!', newBook + '\n');
                    res.status(200).send(newBook);

                })
                .catch(function (err) {
                    if (err.name == 'ValidationError') {
                        console.error('\n' + 'Error Validating!', err + '\n');
                        res.status(422).json(err);
                    } else {
                        console.error(err);
                        res.status(500).json(err);
                    }


                });


        } //The query found no results.
        else {
            console.log("Erro");
            verify(result.prefix, req.body.prefix)
            verify(result.title, req.body.title)
            res.json("Erro");
        }
    })



    //Functions

    var Chance = require('chance');
    var chance = new Chance();

    function geraPin() {


        console.log('gera pin');

        var rdnNumber = chance.unique(chance.string, qtd, {
            length: 12,
            pool: 'BCDEFGHIJKLMNOPQRSTVWXYZbcdefghijklmnopqrstwxyz1234567890'
        })

        for (var i = 0; i < qtd; i++) {

            slicePrefix = chance.pad(prefix, 4, 'X')
            sliceLote = chance.pad(lote, 4, '0')
            sliceCount = chance.pad(i, 4, '0')

            slice1 = rdnNumber[i].slice(0, 4);
            slice2 = rdnNumber[i].slice(4, 8);
            slice3 = rdnNumber[i].slice(8, 12);

            pin[i] = slicePrefix + '-' + sliceLote + '-' + sliceCount + '-' + slice1 + '-' + slice2 + '-' + slice3

        }

        console.log("Pins gerados.")
        console.log(pin)

        return pin

    }


    function verify(s, c) {
        if (s == c) {
            console.log(s + " já existe.")
        }
    }

});


module.exports = router; // export router