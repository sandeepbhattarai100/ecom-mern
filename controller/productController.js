const { json } = require('body-parser');
const Product = require('../models/productModels');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const createProduct = await Product.create(req.body);
        res.json({
            message: "new product created successfully",
            createProduct
        })
    } catch (error) {
        throw new Error(error);
    }
});
//get all products
const getAllProducts = asyncHandler(async (req, res) => {
    try {
        //filtering products with price
        const queryObj = { ...req.query };
        const excludeAll = ["page", "limit", "sort", "fields"];
        excludeAll.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        let query = Product.find(JSON.parse(queryStr));
        //sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt')
        }
        //limiting the fields
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");


            query = query.select(fields);

        }
        else {
            query = query.select('-__v');
        }
        //pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await Product.count();
            if (skip > productCount) throw new Error('this page doesnot exists');
}
        //
        const product = await query;
        res.json(
            product
        );
    } catch (error) {
        throw new Error(error.message);
    }
});
//get single prouct
const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const getaProduct = await Product.findByIdAndUpdate(id);
    res.json(
        getaProduct
    );
});
//update product
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        res.json({
            updatedProduct
        })
    } catch (error) {
        throw new Error(error.message);
    }
});
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Product.findByIdAndDelete(id);
        res.json("product deleted  successfully");
    } catch (error) {
        throw new Error(error.message);
    }
});
module.exports = { createProduct, getAllProducts, getProduct, updateProduct, deleteProduct };