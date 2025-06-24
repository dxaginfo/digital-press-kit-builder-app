const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const pressKitController = require('../controllers/pressKitController');
const { protect } = require('../middleware/authMiddleware');
const { checkPressKitOwnership } = require('../middleware/pressKitMiddleware');

/**
 * @swagger
 * tags:
 *   name: Press Kits
 *   description: Press kit management endpoints
 */

/**
 * @swagger
 * /press-kits:
 *   get:
 *     summary: Get all press kits for the authenticated user
 *     tags: [Press Kits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of press kits
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get('/', protect, pressKitController.getUserPressKits);

/**
 * @swagger
 * /press-kits/{id}:
 *   get:
 *     summary: Get a press kit by ID
 *     tags: [Press Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Press kit ID
 *     responses:
 *       200:
 *         description: Press kit data
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Press kit not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, checkPressKitOwnership, pressKitController.getPressKitById);

/**
 * @swagger
 * /press-kits/public/{slug}:
 *   get:
 *     summary: Get a published press kit by slug (public access)
 *     tags: [Press Kits]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Press kit slug
 *     responses:
 *       200:
 *         description: Press kit data
 *       404:
 *         description: Press kit not found
 *       500:
 *         description: Server error
 */
router.get('/public/:slug', pressKitController.getPublicPressKitBySlug);

/**
 * @swagger
 * /press-kits:
 *   post:
 *     summary: Create a new press kit
 *     tags: [Press Kits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - template
 *             properties:
 *               title:
 *                 type: string
 *               template:
 *                 type: string
 *               customization:
 *                 type: object
 *               isPublished:
 *                 type: boolean
 *               isPasswordProtected:
 *                 type: boolean
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Press kit created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('template', 'Template is required').not().isEmpty()
  ],
  protect,
  pressKitController.createPressKit
);

/**
 * @swagger
 * /press-kits/{id}:
 *   put:
 *     summary: Update a press kit
 *     tags: [Press Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Press kit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               template:
 *                 type: string
 *               customization:
 *                 type: object
 *               isPublished:
 *                 type: boolean
 *               isPasswordProtected:
 *                 type: boolean
 *               password:
 *                 type: string
 *               sections:
 *                 type: array
 *     responses:
 *       200:
 *         description: Press kit updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Press kit not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, checkPressKitOwnership, pressKitController.updatePressKit);

/**
 * @swagger
 * /press-kits/{id}:
 *   delete:
 *     summary: Delete a press kit
 *     tags: [Press Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Press kit ID
 *     responses:
 *       200:
 *         description: Press kit deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Press kit not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, checkPressKitOwnership, pressKitController.deletePressKit);

/**
 * @swagger
 * /press-kits/{id}/media:
 *   post:
 *     summary: Upload media to a press kit
 *     tags: [Press Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Press kit ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - file
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [audio, video, image, document]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Press kit not found
 *       500:
 *         description: Server error
 */
router.post('/:id/media', protect, checkPressKitOwnership, pressKitController.uploadMedia);

/**
 * @swagger
 * /press-kits/{id}/media/{mediaId}:
 *   delete:
 *     summary: Delete media from a press kit
 *     tags: [Press Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Press kit ID
 *       - in: path
 *         name: mediaId
 *         schema:
 *           type: string
 *         required: true
 *         description: Media ID
 *     responses:
 *       200:
 *         description: Media deleted successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Press kit or media not found
 *       500:
 *         description: Server error
 */
router.delete('/:id/media/:mediaId', protect, checkPressKitOwnership, pressKitController.deleteMedia);

/**
 * @swagger
 * /press-kits/{id}/analytics:
 *   get:
 *     summary: Get analytics for a press kit
 *     tags: [Press Kits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Press kit ID
 *     responses:
 *       200:
 *         description: Analytics data
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Press kit not found
 *       500:
 *         description: Server error
 */
router.get('/:id/analytics', protect, checkPressKitOwnership, pressKitController.getPressKitAnalytics);

module.exports = router;