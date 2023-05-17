const jwt = require('jsonwebtoken');

const generateRefreshToken = (id) => {
    jwt.sign({ id: id }, process.env.SECRET_KEY, { expiresIn: "3d" });
};

module.exports = generateRefreshToken;