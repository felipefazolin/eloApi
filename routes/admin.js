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


            const error = {
                message: "Este livro não existe",
                status: 401,
                type: "Internal error"
            }
    
            throw error

        }


    } catch (error) {
        showError(error, res)
    }

})






router.get('/singleBook', async function (req, res) {

    try {

       
        const book = await Book.findById({
            "_id": req.query.singleBook
        },{pin:0});

        if (book != "") {

            //Finish
            var finish = {
                message: "Exibindo conteúdo do livro",
                book: book,
                status: 201
            };

            res.status(finish.status).json(finish)

            return finish

        } else {

            const error = {
                message: "Livro não encontrado",
                status: 401,
                type: "Internal error"
            }
            throw error
        }

    } catch (error) {

        showError(error, res)

    }

})








router.get('/allBooks', async function (req, res) {

    try {

        const books = await Book.find({}, { cover: 1, title: 1 });

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

            const error = {
                message: "Nenhum livro encontrado",
                status: 401,
                type: "Internal error"
            }
            throw error
        }

    } catch (error) {

        showError(error, res)

    }

})









router.post('/register', async function (req, res) {

    try {
        const book = await Book.findOne({
            $or: [{
                'title': req.body.title,
            }, {
                'prefix': req.body.prefix
            }, {
                'cover': req.body.cover
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

            const finish = {
                message: "O livro foi cadastrado",
                status: 201,
                type: "Success",
                title: book.title,
                prefix: book.prefix,
                cover: book.cover        
        };

        res.status(finish.status).json(finish)
        return finish

    }


        if (req.body.title == book.title) {

        const error = {
            message: "Este título já existe",
            status: 401,
            type: "Internal error"
        }

        throw error

    }








    if (req.body.prefix == book.prefix) {

        const error = {
            message: "Este prefixo já existe",
            status: 401,
            type: "Internal error"
        }

        throw error
    }



    if (req.body.cover == book.cover) {

        const error = {
            message: "Esta capa já existe",
            status: 401,
            type: "Internal error"
        }

        throw error
    }


} catch (error) {
    showError(error, res)
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


function showError(error, res) {
    if (error.type === 'Internal error') {
        //Known errors
        res.status(error.status).json({
            status: error.status,
            message: error.message,
            type: error.type
        })

        return error;

    } else {
        //Unknown errors
        res.status(401).json({
            status: 401,
            message: "Erro",
            type: "Unknown error"
        })
        console.log(error)

        return error;

    }
}










module.exports = router; // export router
