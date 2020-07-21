const express = require('express'); // import express
const router = express.Router(); // create router to export

const Book = require('../models/Book');

const Chance = require('chance');
const chance = new Chance();

var toObject = require('to-object'); // parse to JSON object





router.get('/findBookTitle', async function (req, res) {


    var title = {
        "title": req.body.title
    }

    if (req.body.title) {
        var filter = title
    } else {
        var filter = {

        }
    }


    try {

        const bookTitle = await Book.find(filter);

        if (bookTitle != "") {
            console.log(toObject(bookTitle))
            res.json(toObject(bookTitle))
        } else {
            customError("500", "Este livro não existe", "Erro interno")
        }


    } catch (error) {
        //Catched errors from the throw
        //DISPLAY ERRORS IN THE BACK   
        console.log(
            `Error message--> ${error.message}` + '\n' +
            `Error reason--> ${error.reason}` + '\n' +
            `Error code--> ${error.code}` + '\n' +
            `Error title--> ${error.title}` + '\n' +
            `Error detail--> ${error.stack}`
        );
        //DISPLAY ERRORS IN THE FRONT 
        //Known errors       
        if (error.title === 'Erro interno') {
            res.json(error.message)
        } else {
            //Unknown errors
            res.json("Erro geral")
        }
        return error;
    }

})









router.get('/allBooks', async function (req, res) {

    try {

        const books = await Book.find({},{cover:1, title:1});

        if (books != "") {

            //Finish
            var finish = {
                message: "Listando livros",
                books: books,
                status: 201
            };

            res.status(finish.status).json(finish)

            return finish

        } else {
            customError("500", "Nenhum livro encontrado", "Erro interno")
        }

    } catch (error) {
        //Catched errors from the throw
        //DISPLAY ERRORS IN THE BACK   
        console.log(
            `Error message--> ${error.message}` + '\n' +
            `Error reason--> ${error.reason}` + '\n' +
            `Error code--> ${error.code}` + '\n' +
            `Error title--> ${error.title}` + '\n' +
            `Error detail--> ${error.stack}`
        );
        //DISPLAY ERRORS IN THE FRONT 
        //Known errors       
        if (error.title === 'Erro interno') {
            res.json(error.message)
        } else {
            //Unknown errors
            res.json("Erro geral")
        }
        return error;
    }

})









router.post('/register', async function (req, res) {

    try {
        const book = await Book.findOne({
            $or: [{
                    'title': req.body.title,
                }, {
                    'prefix': req.body.prefix
                }

            ]
        });

        if (!book) {

            const book = new Book({
                'title': req.body.title,
                'prefix': req.body.prefix,
                'version': req.body.version,
                'pin': await geraPin(req.body.qtdPin, req.body.prefix, req.body.version),
                'qtd': req.body.qtdPin,
                'cover': req.body.cover
            });

            await book.save()

            res.json("O livro foi registrado")
            console.log(book.title + " " + book.prefix)

        } else {
            customError("500", "Este livro já existe", "Erro interno")
        }


    } catch (error) {
        //Catched errors from the throw
        //DISPLAY ERRORS IN THE BACK   
        console.log(
            `Error message--> ${error.message}` + '\n' +
            `Error reason--> ${error.reason}` + '\n' +
            `Error code--> ${error.code}` + '\n' +
            `Error title--> ${error.title}` + '\n' +
            `Error detail--> ${error.stack}`
        );
        //DISPLAY ERRORS IN THE FRONT 
        //Known errors       
        if (error.title === 'Erro interno') {
            res.json(error.message)
        } else {
            //Unknown errors
            res.json("Erro geral")
        }
        return error;
    }

})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function geraPin(qtdPin, prefix, version) {

    const rdnNumber = chance.unique(chance.string, qtdPin, {
        length: 12,
        pool: 'BCDEFGHIJKLMNOPQRSTVWXYZbcdefghijklmnopqrstwxyz1234567890'
    })

    // MAP LOOP

    const slicePrefix = chance.pad(prefix, 4, 'X')
    const sliceVersion = chance.pad(version, 4, '0')

    var mapPins = rdnNumber.map(function (item, index) {
        var sliceCount = chance.pad(index, 4, '0')
        var slice1 = item.slice(0, 4);
        var slice2 = item.slice(4, 8);
        var slice3 = item.slice(8, 12);
        return slicePrefix + '-' + sliceVersion + '-' + sliceCount + '-' + slice1 + '-' + slice2 + '-' + slice3 //retorna o item original elevado ao quadrado
    });

    console.log("Pins gerados.")
    //console.log(mapPins)

    return mapPins


    //FOR LOOP
    var pin = []

    // for (var i = 0; i < qtdPin; i++) {

    //     slicePrefix = chance.pad(prefix, 4, 'X')
    //     sliceVersion = chance.pad(version, 4, '0')
    //     sliceCount = chance.pad(i, 4, '0')

    //     slice1 = rdnNumber[i].slice(0, 4);
    //     slice2 = rdnNumber[i].slice(4, 8);
    //     slice3 = rdnNumber[i].slice(8, 12);

    //     pin[i] = slicePrefix + '-' + sliceVersion + '-' + sliceCount + '-' + slice1 + '-' + slice2 + '-' + slice3

    // }

    // console.log("Pins gerados.")
    // console.log(pin)

    // return pin

}



//Generate custom known errors and throw to the catch  
function customError(code, message, title) {
    const customError = {
        code: code,
        message: message,
        title: title
    }
    throw customError
}


module.exports = router; // export router
