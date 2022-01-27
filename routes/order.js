const router = require('express').Router();
const orderModel = require('../models/order');
const {verifyTokenAdmin} = require('../helpers/helpers');
const {verifyTokenCustomerAdmin} = require('../helpers/helpers');

// GET ALL ORDERS
router.get('/orders', verifyTokenAdmin, (req, res) => {
    orderModel.getAllOrders().then((orders)=>{
        res.status(200).json(orders);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

// Get Single Order
router.get('/orders/:id', verifyTokenCustomerAdmin, async (req, res) => {
    let orderId = req.params.id;
    orderModel.getOrderById(orderId).then((order)=>{
        res.status(200).json(order);
    }).catch((err)=>{
        res.status(400).json(err);
    });
});

// Place New Order
router.post('/orders/new', verifyTokenCustomerAdmin, (req, res) => {
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

/* DELETE ORDER */
router.delete('/order/:orderId', verifyTokenAdmin, (req, res)=>{
    let orderId = req.params.orderId;

    if (!isNaN(orderId)) {
        orderModel.deleteOrderById(orderId).then((msg)=>{
            res.status(200).json(msg);
        }).catch((err)=>{
            res.status(500).json(err);
        });
    } else {
        res.status(500).json({ message: "ID is not a valid number", status: "failure" });
    }

});

// Payment Gateway
router.post('/orders/payment', verifyTokenCustomerAdmin, (req, res) => {
    setTimeout(() => {
        res.status(200).json({success: true});
    }, 3000)
});

module.exports = router;