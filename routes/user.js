const express = require('express'); // import express
const router = express.Router(); // create router to export

const mongoose = require('mongoose'); // import mongoose

const CryptoJS = require("crypto-js"); // import Crypto token

const User = require('../models/User'); // import Mongoose schema
const Book = require('../models/Book'); // import Mongoose schema

var toObject = require('to-object'); // parse to JSON object

var stringify = require('json-stable-stringify');

//////////ROUTES//////////

router.get('/login', async function (req, res) {

    try {
        //Checks email and password
        const loggedUser = await User.findOne({
            $and: [{
                    email: req.body.email
                },
                {
                    password: req.body.password
                }
            ]
        })
        // If error
        if (!loggedUser) {
            customError("500", "E-mail ou senha inválida", "Erro interno")
        }
        // Generate token
        const token = CryptoJS.AES.encrypt(loggedUser._id.toString(), process.env.SECRET).toString();
        //Update token in DB
        const updateToken = await User.findOneAndUpdate({
            _id: loggedUser._id
        }, {
            token: token
        }, {
            new: true
        })
        //Error generate token
        if (!updateToken) {
            customError("500", "Erro ao gerar token", "Erro interno")
        }
        //Finish
        res.json(updateToken.token)
        console.log("Token gerado: " + updateToken.token)
        return updateToken.token

    } catch (error) {
        //Catched errors from the throw
        //DISPLAY ERRORS IN THE BACK   
        console.log(
            `Error message--> ${error.message}` + '\n' +
            `Error reason--> ${error.reason}` + '\n' +
            `Error code--> ${error.code}` + '\n' +
            `Error name--> ${error.name}` + '\n' +
            `Error detail--> ${error.stack}`
        );
        //DISPLAY ERRORS IN THE FRONT 
        //Known errors       
        if (error.name === 'Erro interno') {
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
        const user = await User.findOne({
            'email': req.body.email
        });

        if (!user) {
            const user = new User({
                'name': req.body.name,
                'email': req.body.email,
                'password': req.body.password,
            });

            await user.save()

            res.json("Você foi registrado")
            console.log("Você foi registrado")

        } else {
            customError("500", "Este e-mail já existe", "Erro interno")
        }


    } catch (error) {
        //Catched errors from the throw
        //DISPLAY ERRORS IN THE BACK   
        console.log(
            `Error message--> ${error.message}` + '\n' +
            `Error reason--> ${error.reason}` + '\n' +
            `Error code--> ${error.code}` + '\n' +
            `Error name--> ${error.name}` + '\n' +
            `Error detail--> ${error.stack}`
        );
        //DISPLAY ERRORS IN THE FRONT 
        //Known errors       
        if (error.name === 'Erro interno') {
            res.json(error.message)
        } else {
            //Unknown errors
            res.json("Erro geral")
        }
        return error;
    }

})


router.get('/myBooks', async function (req, res) {

    const token = req.body.token
    const id = CryptoJS.AES.decrypt(token, process.env.SECRET).toString(CryptoJS.enc.Utf8)

    try {
        // Throw "mongoose token" error to the catch
        if (!mongoose.Types.ObjectId.isValid(id)) {
            customError("500", "Token inválido")
        }
        // FIND USER       
        //// Try to find data in DB
        const user = await User.findOne({
            $and: [{
                    '_id': id
                },
                {
                    'token': token
                }
            ]
        })
        // Throw "data not find" error to the catch
        if (user) {
            const pins = user.pinBook

            //MAP LOOP
            const userBooksIds = await pins.map((booksMap) => {
                //console.log(nomeAtual);
                return booksMap.bookId
            })

            //Find multiple ids book
            IDs = userBooksIds
            const books = await Book.find({
                _id: IDs
            }, {
                title: 1,
                prefix: 1
            })

            //Convert to object
            res.json(toObject(books))
            return books;

        } else {
            customError("500", "Usuário não encontrado", "Erro interno")
        }


    } catch (error) {
        //Catched errors from the throw
        //DISPLAY ERRORS IN THE BACK   
        console.log(
            `Error message--> ${error.message}` + '\n' +
            `Error reason--> ${error.reason}` + '\n' +
            `Error code--> ${error.code}` + '\n' +
            `Error name--> ${error.name}` + '\n' +
            `Error detail--> ${error.stack}`
        );
        //DISPLAY ERRORS IN THE FRONT 
        //Known errors       
        if (error.name === 'Erro interno') {
            res.json(error.message)
        } else {
            //Unknown errors
            res.json("Erro geral")
        }
        return error;
    }
})


router.get('/addPin', async function (req, res) {

    const token = req.body.token;
    const id = CryptoJS.AES.decrypt(token, process.env.SECRET).toString(CryptoJS.enc.Utf8);

    try {
        // Throw "mongoose token" error to the catch
        if (!mongoose.Types.ObjectId.isValid(id)) {
            customError("500", "Token inválido")
        }
        // AUTENTICA USER      
        //// Try to find data in DB
        const user = await User.findOne({
            $and: [{
                    '_id': id
                },
                {
                    'token': token
                }
            ]
        });
        // Throw "data not find" error to the catch
        if (user) {
            console.log("Usuário autenticado " + user._id);

            //Verify pin book
            const book = await Book.findOne({
                'pin': req.body.pin
            });

            if (book) {
                console.log("Este PIN consta no livro " + book.title);

                const pin = await User.findOneAndUpdate({
                    $and: [{
                        '_id': user._id,
                        'pinBook.bookPin': {
                            $ne: req.body.pin, //Não salvar PINS iguais               
                        },
                        'pinBook.bookId': {
                            $ne: book._id, //Não salvar PIN do mesmo livro            
                        }
                    }]
                }, {
                    $addToSet: {

                        pinBook: [{
                            bookPin: req.body.pin,
                            bookTitle: book.title,
                            bookId: book._id,
                        }]
                    }
                }, {
                    new: true
                })

                if (pin) {
                    console.log('pin cadastrado')
                    console.log(pin.pinBook)

                    res.json(toObject(pin.pinBook))
                    return pin.pinBook

                } else {
                    customError("500", "Você já tem um PIN desse livro", "Erro interno")
                }

            } else {
                customError("500", "Este pin não é de nenhum livro", "Erro interno")
            }

        } else {
            customError("500", "Usuário não encontrado", "Erro interno")
        }

    } catch (error) {
        //Catched errors from the throw
        //DISPLAY ERRORS IN THE BACK   
        console.log(
            `Error message--> ${error.message}` + '\n' +
            `Error reason--> ${error.reason}` + '\n' +
            `Error code--> ${error.code}` + '\n' +
            `Error name--> ${error.name}` + '\n' +
            `Error detail--> ${error.stack}`
        );
        //DISPLAY ERRORS IN THE FRONT 
        //Known errors       
        if (error.name === 'Erro interno') {
            res.json(error.message)
        } else {
            //Unknown errors
            res.json("Erro geral")
        }
        return error
    }
})

//Generate custom known errors and throw to the catch  
function customError(code, message, name) {
    const customError = {
        code: code,
        message: message,
        name: name
    }
    throw customError
}

// expourt router
module.exports = router;