const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    if (userswithsamename.length <= 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ 
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Extract ISBN
    const review = req.query.review; // Extract review from query
    const username = req.session.authorization?.username; // Extract username from session

    // Validate inputs
    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add or update the review for this user
    const book = books[isbn];
    if (!book.reviews) {
        book.reviews = {};
    }
    book.reviews[username] = review;

    return res.status(200).json({
        message: `Review for book with ISBN ${isbn} successfully added/updated.`,
        reviews: book.reviews
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const book = books[isbn];

    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "No review found for this book" });
    }

    delete book.reviews[username];

    return res.status(200).json({
        message: `Review for book with ISBN ${isbn} successfully deleted.`,
        reviews: book.reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser
