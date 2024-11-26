const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (isValid(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
    const getAllBooks = new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                resolve(books);
            } catch (error) {
                reject(error);
            }
        }, 100);
    });

    getAllBooks
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((error) => {
            res.status(500).json({ message: "Error retrieving books", error: error });
        });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    const getBookByISBN = new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject({ message: "Book not found" });
            }
        }, 100);
    });

    getBookByISBN
        .then((book) => {
            res.status(200).json(book);
        })
        .catch((error) => {
            res.status(404).json(error);
        });
});

  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    const getBooksByAuthor = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const booksByAuthor = Object.values(books).filter(book => book.author === author);
                
                if (booksByAuthor.length > 0) {
                    resolve(booksByAuthor);
                } else {
                    reject({ message: "No books found by this author" });
                }
            }, 100);
        });
    };

    try {
        const authorBooks = await getBooksByAuthor();
        res.status(200).json(authorBooks);
    } catch (error) {
        res.status(404).json(error);
    }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;

    const getBooksByTitle = new Promise((resolve, reject) => {
        setTimeout(() => {
            const booksByTitle = Object.values(books).filter(book => book.title === title);
            
            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
                reject({ message: "No books found with this title" });
            }
        }, 100);
    });

    getBooksByTitle
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((error) => {
            res.status(404).json(error);
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn
    res.send(books[isbn].reviews);
});

module.exports.general = public_users;
