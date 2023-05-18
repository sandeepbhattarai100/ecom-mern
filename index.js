const express = require('express');
const dbConnect = require('./config/dbConnect');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');

const dotenv = require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const { notFound, errorHandler } = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');

const PORT = process.env.port || 5000;
dbConnect();
//middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);

//error
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`the server is runing in port ${PORT}`);
})