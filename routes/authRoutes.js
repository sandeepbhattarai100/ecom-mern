const express = require('express');
const router = express.Router();
const { createUser, login, getAllUser, getSingleUser, deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logout, updatePassword, forgotPasswordToken, resetPassword } = require('../controller/userController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

router.post('/createuser', createUser);
router.post('/login', login);
router.get('/getalluser', getAllUser);
router.get("/refresh", handleRefreshToken);
router.put("/update-password", authMiddleware, updatePassword);
router.get("/logout", logout);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);

router.get('/:id', authMiddleware, isAdmin, getSingleUser);
router.delete('/:id', authMiddleware, deleteUser);
router.put('/:id', authMiddleware, updateUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);





module.exports = router;
