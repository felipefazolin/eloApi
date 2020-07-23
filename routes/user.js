const express = require('express'); // import express
const router = express.Router(); // create router to export

const mongoose = require('mongoose'); // import mongoose

const CryptoJS = require("crypto-js"); // import Crypto token

const User = require('../models/User'); // import Mongoose schema
const Book = require('../models/Book'); // import Mongoose schema

var toObject = require('to-object'); // parse to JSON object

var stringify = require('json-stable-stringify');

const createError = require('http-errors')

//////////ROUTES//////////

router.post('/login', async function (req, res) {

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

            const error = {
                message: "E-mail ou senha inválida",
                status: 401,
                type: "Internal error"
            }

            throw error

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

            const error = {
                message: "Erro ao gerar token",
                status: 401,
                type: "Internal error"
            }

            throw error

        } else {

            const finish = {
                message: "Logado",
                status: 201,
                type: "Success",
                token: updateToken.token,
                name: loggedUser.name
            };

            res.status(finish.status).json(finish)
            return finish
        }

    } catch (error) {
        showError(error, res)
    }

})



router.get('/verify', async function (req, res) {

    console.log(req.query.email)

    const user = await User.findOne({
        'email': req.query.email
    });


    try {


        if (!user) {

            console.log(req.query.email)

            const finish = {
                message: "Este e-mail está disponível",
                status: 200,
                type: "Success"
            };

            res.status(finish.status).json(finish)
            return finish

        } else {

            const error = {
                message: "Este e-mail já está cadastrado",
                status: 401,
                type: "Internal error"
            }

            throw error
        }


    } catch (error) {

        showError(error, res)

    }

})





// console.log(error.type)
// console.log('Status: ', error.status)
// console.log('Message: ', error.message)
// console.log('Stack: ', error.stack)

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

            const finish = {
                message: "Você foi registrado com sucesso",
                status: 201,
                type: "Success"
            };

            res.status(finish.status).json(finish)
            return finish

        } else {

            const error = {
                message: "Este e-mail já existe",
                status: 401,
                type: "Internal error"
            }

            throw error
        }


    } catch (error) {

        showError(error, res)

    }

})


router.get('/myBooks', async function (req, res) {

    const token = req.query.token
    const id = CryptoJS.AES.decrypt(token, process.env.SECRET).toString(CryptoJS.enc.Utf8)

    try {

        if (token) {

            // Throw "mongoose token" error to the catch
            if (mongoose.Types.ObjectId.isValid(id)) {

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


                    if (!pins == []) {

                        //MAP LOOP
                        const userBooksIds = await pins.map((booksMap) => {
                            //console.log(nomeAtual);
                            return booksMap.bookId
                        })

                        //Find multiple ids book
                        IDs = userBooksIds
                        const books = await Book.find({
                            _id: IDs
                        })

                        const finish = {
                            message: "Listando seus livros",
                            status: 201,
                            type: "Success",
                            books: books
                        };

                        res.status(finish.status).json(finish)
                        return finish

                    } else {

                        const finish = {
                            message: "Nenhum livro cadastrado",
                            status: 201,
                            type: "Success",
                            books: []
                        };
                        res.status(finish.status).json(finish)
                        return finish
                    }

                } else {

                    const error = {
                        message: "Usuário não encontrado",
                        status: 401,
                        type: "Internal error"
                    }

                    throw error
                }

            } else {

                const error = {
                    message: "Token inválido",
                    status: 401,
                    type: "Internal error"
                }

                throw error
            }

        } else {
            const error = {
                message: "Você não pode acessar essa página sem estar logado",
                status: 401,
                type: "Internal error"
            }
            throw error

        }

    } catch (error) {

        showError(error, res)

    }


})


router.post('/addPin', async function (req, res) {

    const token = req.body.token
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

            console.log(req.body.pin)

            //Verify if PIN exists in other user
            const verifyDuplicatedPin = await User.findOne({
                'pinBook.bookPin': req.body.pin
            });

            if (verifyDuplicatedPin) {              

                const error = {
                    message: "Este PIN já está sendo usado",
                    status: 401,
                    type: "Internal error"
                }
                throw error                

                // if (verifyDuplicatedPin._id == user._id) {
                //     console.log("Este PIN é seu")
                // }else{
                //     console.log("Este PIN é de outra pessoa")
                // }

            } else {

                //console.log("Ninguem cadastrou esse PIN")

                //Verify pin book
                const book = await Book.findOne({
                    'pin': req.body.pin
                });

                if (book) {
                    console.log("Este PIN é do livro " + book.title);

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

                        const finish = {
                            message: "PIN adicionado com sucesso",
                            status: 201,
                            type: "Success",
                            pin: pin.pinBook

                        };

                        res.status(finish.status).json(finish)
                        return finish

                    } else {
                        const error = {
                            message: "Você já tem um PIN desse livro",
                            status: 401,
                            type: "Internal error"
                        }
                        throw error
                    }

                } else {

                    console.log(req.body.pin)

                    var str = req.body.pin;

                    var newStr = str.replace(/ /g, "");
                    var n = newStr.length;
                    console.log(n)

                    const error = {
                        message: "Este pin não é de nenhum livro",
                        status: 401,
                        type: "Internal error"
                    }
                    throw error

                }

            }


        } else {
            const error = {
                message: "Usuário não encontrado",
                status: 401,
                type: "Internal error"
            }
            throw error
        }

    } catch (error) {
        showError(error, res)
    }
})

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

        return error;

    }
}

//Generate custom known errors and throw to the catch  
// function customError(code, message, name) {
//     const customError = {
//         code: code,
//         message: message,
//         name: name
//     }
//     throw customError
// }



// expourt router
module.exports = router;