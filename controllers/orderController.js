import orderModel from "../models/orderModel.js";
import itemModel from "../models/itemModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET);

const initiateCheckout = async (req, res) => {
    try {
        const line_items = req.body.items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }));

        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Shipping'
                },
                unit_amount: 500
            },
            quantity: 1
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/verify?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/verify?success=false`,
            metadata: {
                userId: req.user.id,
                address: JSON.stringify(req.body.address),
                items: JSON.stringify(req.body.items),
                amount: req.body.amount
            }
        });

        res.json({success: true, session_url: session.url});
    } catch(error) {
        console.log(error);
        res.status(500).json({success: false, message: "Checkout session could not be created"});
    }
};

const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        const newOrder = new orderModel({
            userId: session.metadata.userId,
            items: JSON.parse(session.metadata.items),
            amount: session.metadata.amount,
            address: JSON.parse(session.metadata.address),
            payment: true,
            date: Date.now(),
        });
        await newOrder.save();

        for (let item of newOrder.items) {
            await itemModel.findByIdAndUpdate(item._id, {
                $inc: {
                    quantity: -item.quantity,
                    rank: 1 * item.quantity
                }
            });
        }
    }

    res.json({received: true});
};

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({userId: req.user.id});
        res.json({success: true, data: orders});
    } catch(error) {
        res.status(500).json({success: false, message: "Orders could not be fetched"});
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({success: true, data: orders});
    } catch(error) {
        res.status(500).json({success: false, message: "Orders could not be fetched"});
    }
};

const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, {status: req.body.status});
        res.json({success: true, message: "Status updated"});
    } catch(error) {
        res.status(500).json({success: false, message: "Status could not be updated"});
    }
};

const getAddress = async (req, res) => {
    try {
        const user = await orderModel.findOne({userId: req.user.id});
        res.json({success: true, data: user ? user.address : null});
    } catch(error) {
        res.status(500).json({success: false, message: "Address could not be fetched"});
    }
};

export {
    initiateCheckout,
    handleWebhook,
    userOrders,
    getOrders,
    updateStatus,
    getAddress
};



