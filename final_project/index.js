const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
let authenticatedUser = require("./router/auth_users.js").authenticatedUser;

const app = express();

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true, 
    saveUninitialized: true
}))

// Middleware to verify authentication for protected routes
app.use("/customer/auth/*", (req, res, next) => {
    // Check if authorization exists in session
    if (req.session.authorization) {
        const token = req.session.authorization.accessToken;
        const username = req.session.authorization.username;

        try {
            // Verify the token
            const decoded = jwt.verify(token, 'access');
            
            // Optional: You could add additional checks here
            if (username) {
                next();
            } else {
                return res.status(401).json({ message: "Invalid session" });
            }
        } catch (err) {
            return res.status(401).json({ message: "Token expired or invalid" });
        }
    } else {
        return res.status(401).json({ message: "User not authenticated" });
    }
});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));