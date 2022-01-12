const router = require('express').Router();
const orderModel = require('../models/order');
// const crypto = require('crypto');

// GET ALL ORDERS
router.get('/', (req, res) => {
    orderModel.getAllOrders().then((orders)=>{
        res.status(200).json(orders);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

// Get Single Order
router.get('/:id', async (req, res) => {
    let orderId = req.params.id;
    orderModel.getOrderById(orderId).then((order)=>{
        res.status(200).json(order);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

// Place New Order
router.post('/new', async (req, res) => {
    let {userId, products} = req.body;
    if (userId !== null && userId > 0) {
        orderModel.addNewOrder(userId, products).then((newOrderId)=>{
            res.json({
                message: `Order successfully placed with order id ${newOrderId}`,
                success: true,
                order_id: newOrderId,
                products: products
            })
        }).catch((err)=>{
            res.status(400).json(err);
        });
    } else {
        res.status(400).json({message: 'New order failed', success: false});
    }
});

module.exports = router;