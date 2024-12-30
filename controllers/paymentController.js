const Stripe = require('stripe');
require('dotenv').config();
const User = require("../models/User");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// Create a new checkout session
const stripePayments1 = async (req, res) => {
    const userId = req.userId;

    try {
        const userPaid = await User.findById({userId});
        const targetMonth = new Date();
        const incomeEntry = userPaid.monthlyIncome.find(entry => entry.month === targetMonth);
        userPaid.paidDate = targetMonth;
        userPaid.paid = incomeEntry;
        await userPaid.save();
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'jpy',
                        product_data: {
                            name: 'Subscription Plan',
                        },
                        unit_amount: incomeEntry, // Price in yen (8,000 yen)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/account`,
            cancel_url: `${process.env.CLIENT_URL}/account`,
        });

        // Find the User from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user role and expiration dates
        user.role = "有料会員";
        const now = Date.now();
        const expired = user.expired || {};

        // Set the start time to either the previous expiration end or the current time
        user.expired = {
            start: expired.end || now,
            end: (expired.end || now) + (365 * 24 * 60 * 60 * 1000) // 1 year from start
        };

        await user.save();
        res.json({ id: session.id, role: user.role });
    } catch (err) {
        console.error(err); // Provides error logging
        res.status(500).json({ error: err.message });
    }
};

// Create a new checkout session
const stripePayments = async (req, res) => {
    const userId = req.userId;

    try {
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'jpy',
                        product_data: {
                            name: 'Subscription Plan',
                        },
                        unit_amount: 8000, // Price in yen (8,000 yen)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/account`,
            cancel_url: `${process.env.CLIENT_URL}/account`,
        });

        // Find the User from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user role and expiration dates
        user.role = "有料会員";
        const now = Date.now();
        const expired = user.expired || {};

        // Set the start time to either the previous expiration end or the current time
        user.expired = {
            start: expired.end || now,
            end: (expired.end || now) + (365 * 24 * 60 * 60 * 1000) // 1 year from start
        };

        await user.save();
        res.json({ id: session.id, role: user.role });
    } catch (err) {
        console.error(err); // Provides error logging
        res.status(500).json({ error: err.message });
    }
};

const stripeDownPayments = async (req, res) => {
    const userId = req.userId;

    try {
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'jpy',
                        product_data: {
                            name: 'Subscription Plan',
                        },
                        unit_amount: 0, // Price in yen (8,000 yen)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/account`,
            cancel_url: `${process.env.CLIENT_URL}/account`,
        });

        // Find the User from the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user role and expiration dates
        user.role = "無料会員";
        // const now = Date.now();
        // const expired = user.expired || {};

        // // Set the start time to either the previous expiration end or the current time
        // user.expired = {
        //     start: expired.end || now,
        //     end: (expired.end || now) + (365 * 24 * 60 * 60 * 1000) // 1 year from start
        // };

        await user.save();
        res.json({ id: session.id });
    } catch (err) {
        console.error(err); // Provides error logging
        res.status(500).json({ error: err.message });
    }
};

const stripeAskPayments = async (req, res) => {
    // const userId = req.userId;

    try {
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'jpy',
                        product_data: {
                            name: 'Subscription Plan',
                        },
                        unit_amount: 500000, // Price in yen (8,000 yen)
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/ask`,
            cancel_url: `${process.env.CLIENT_URL}/ask`,
        });

        // Find the User from the database
        // const user = await User.findById(userId);
        // if (!user) {
        //     return res.status(404).json({ error: 'User not found' });
        // }

        // // Update user role and expiration dates
        // user.role = "有料会員";
        // const now = Date.now();
        // const expired = user.expired || {};

        // // Set the start time to either the previous expiration end or the current time
        // user.expired = {
        //     start: expired.end || now,
        //     end: (expired.end || now) + (365 * 24 * 60 * 60 * 1000) // 1 year from start
        // };

        // await user.save();
        res.json({ id: session.id });
    } catch (err) {
        console.error(err); // Provides error logging
        res.status(500).json({ error: err.message });
    }
};

const createAccount = async (req, res) => {
    const userId = req.userId;

    try {
        const account = await stripe.accounts.create({
            type: 'express',
        });

        // Create the account link for the user to complete onboarding
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.CLIENT_URL}/account`, // URL to redirect if the user cancels the process
            return_url: `${process.env.CLIENT_URL}/account`, // URL to redirect after successful completion
            type: 'account_onboarding',
        });

        res.json({ accountId: account.id, accountLinkUrl: accountLink.url });
    } catch (error) {
        console.error("Error creating account:", error);
        res.status(400).json({ error: error.message });
    }
}

const addBank = async (req, res) => {
    const userId = req.userId;

    const { accountId, bankToken } = req.body;

    try {
        const account = await stripe.accounts.update(accountId, {
            external_account: bankToken,
        });
        res.json({ success: true, account });
    } catch (error) {
        res.status(400).json({ error: error.message });
    };
}
const payUser = async (req, res) => {
    const userId = req.userId;
    const { userAccountId, amount, currency } = req.body;

    try {
        const user = await User.findById(userId);
        if(user.role === 'admin'){
            return res.status(400).json({message:"You are not Admin1"})
        }
        // Step 1: Check admin's balance
        const balance = await stripe.balance.retrieve();
        if (balance.available[0].amount < amount) {
            return res.status(400).json({ error: 'Insufficient balance in admin account.' });
        }

        // Step 2: Transfer funds to the user (userAccountId is the connected account ID)
        const transfer = await stripe.transfers.create({
            amount, // Amount in the smallest currency unit (e.g., cents for USD)
            currency,
            destination: userAccountId, // The user's Stripe connected account ID
        });

        res.json({ success: true, transfer });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
module.exports = {
    stripePayments,
    stripeAskPayments,
    stripeDownPayments,
    addBank,
    createAccount,
    payUser,
    stripePayments1
 };