const mongoose = require('mongoose');

const dbConnect = async () => {
    try {
        const conn = mongoose.connect(process.env.ATLAS_URI);
        console.log("database is connected successfully");
    } catch (error) {
        console.log(err.message);

    }
};

module.exports = dbConnect;