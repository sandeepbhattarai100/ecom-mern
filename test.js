// try {
//     const queryObj = { ...req.query };
//     const excludeAll = ["page", "sort", "fields", "limit"];
//     excludeAll.forEach((el) => delete queryObj[el]);
// //filtering
//     let queryStr = JSON.stringify(queryObj);
//     queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
//     let query = Product.find(JSON.parse(queryStr));
//     if (req.query.sort) {
//         const sortBy = req.query.sort.split(",").join(" ");
//         query = query.sort(sortBy);
//     } else {
// query=query.sort('-createdAt')
//     }
//     //query using the field value and limiting it
//     if (req.query.fields) {
//         const fields = req.query.fields.split(",").join(" ");
//         query = query.select(fields);
//     }
//     else {
// query=query.select('-__v')
//     }
//     const product = await query;
// } catch (error) {

// }