const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Security configuration
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin" , "*");
    res.setHeader("Access-Control-Allow-Headers" , "Origin, Accept, Content-Type, X-Requested-with, Authorization, role");
    res.setHeader("Access-Control-Allow-Methods" , "GET, POST, DELETE, OPTIONS, PATCH, PUT");
    next();
});

  // Import Routes
const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const orderRouter = require('./routes/order');

app.use('/', productsRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/orders', orderRouter);


app.listen(3000, console.log('Server run in port 3000'));