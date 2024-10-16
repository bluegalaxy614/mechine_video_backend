const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const stripePayments = async (req, res) => {
    console.log("payments intergration",process.env.STRIPE_SECRET_KEY)
    // const userId = req.userId;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'jpy',
                        product_data: {
                            name: 'Subscription Plan',
                        },
                        unit_amount: 800000,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/payment/success`, // Your frontend success URL
            cancel_url: `${process.env.CLIENT_URL}/payment/cancel`, // Your frontend cancel URL
        });

        res.json({ id: session.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};

module.exports = { stripePayments };