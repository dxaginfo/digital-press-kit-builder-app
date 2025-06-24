const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints (admin only)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not admin
 *       500:
 *         description: Server error
 */
router.get('/', protect, admin, userController.getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not admin
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, admin, userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not admin
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, admin, userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not admin
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, admin, userController.deleteUser);

module.exports = router;