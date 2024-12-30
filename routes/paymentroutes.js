const express = require('express');
const router = express.Router();
const {
    stripePayments,
    stripeAskPayments,
    stripeDownPayments,
    createAccount,
    addBank,
    payUser,
    stripePayments1
} = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/create-checkout-session',authMiddleware, stripePayments);
router.post('/create-checkout-session1',authMiddleware, stripePayments1);

router.post('/create-down-session',authMiddleware, stripeDownPayments);
router.post('/create-account',authMiddleware, createAccount);
router.post('/add-bank',authMiddleware, addBank);
router.post('/pay-user',authMiddleware, payUser);
router.post('/stripe', stripeAskPayments);

module.exports = router;