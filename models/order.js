const { reject } = require('bcrypt/promises');
const Product = require('./product');
const mongoose = require('mongoose');
require('dotenv').config();

let schemaOrder = mongoose.Schema({
    id: String,
    user_id: String,
});

let schemaOrderDetails = mongoose.Schema({
    id: String,
    order_id: String,
    product_id: String,
    quantity: String,
});

var Order = mongoose.model('Order', schemaOrder);
var OrderDetails = mongoose.model('OrderDetails', schemaOrderDetails, "orders_details");
var url = process.env.URL;

// GET ALL ORDERS
exports.getAllOrders = ()=>{
    return new Promise((resolve, reject)=>{
        mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{  
            return OrderDetails.aggregate([
                {
                    $lookup: { 
                        from: "orders",
                        localField: "order_id",
                        foreignField: "id",
                        as: "or"
                    }
                },
                {
                    $lookup: { 
                        from: "products",
                        localField: "product_id",
                        foreignField: "id",
                        as: "p"
                    }
                },
                {
                    $lookup: { 
                        from: "users",
                        localField: "or.user_id",
                        foreignField: "id",
                        as: "us"
                    }
                },
                { $unwind: "$or" },
                { $unwind: "$p" },
                { $unwind: "$us" },
                {
                    $project: {
                        order_id: "$or.id",
                        title: "$p.title",
                        description: "$p.description",
                        price: "$p.price",
                        username: "$us.username",
                    }
                }
            ]);

        }).then(orders => {
            console.log(orders)
            if (orders.length > 0) {
                resolve(orders);
            } else {
                resolve({message: "No orders found"});
            }
        }).catch((err)=>{mongoose.disconnect();console.log('from err',err); reject(err)})
    })
}

// Get Single Order
exports.getOrderById = (orderId)=>{
    return new Promise((resolve, reject)=>{
        mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{      
            return OrderDetails.aggregate([
                { $match: {order_id: orderId}},
                {
                    $lookup: { 
                        from: "orders",
                        localField: "order_id",
                        foreignField: "id",
                        as: "or"
                    }
                },
                {
                    $lookup: { 
                        from: "products",
                        localField: "product_id",
                        foreignField: "id",
                        as: "p"
                    }
                },
                {
                    $lookup: { 
                        from: "users",
                        localField: "or.user_id",
                        foreignField: "id",
                        as: "us"
                    }
                },
                { $unwind: "$or" },
                { $unwind: "$p" },
                { $unwind: "$us" },
                {
                    $project: {
                        order_id: "$or.id",
                        // id_poduct: "$p.id",
                        title: "$p.title",
                        description: "$p.description",
                        price: "$p.price",
                        username: "$us.username",
                        image: "$p.image",
                        quantityOrdered: "$quantity",
                    }
                }
            ]);

        }).then(order => {
            if (order) {
                resolve(order);
            } else {
                resolve({message: `NO ORDER FOUND WITH ID : ${orderId}`});
            }
        }).catch((err)=>{mongoose.disconnect(); reject(err)})
    })
}

// Place New Order
exports.addNewOrder =  async (userId, products) => {
    return new Promise((resolve, reject)=>{
        mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{      
            let order = new Order({
                // id : ,
                user_id : userId
            }) 
            return order.save();
        }).then((newOrder) => {
            if (newOrder.id > 0) {
                products.forEach(async (p) => {
                    // let data = await database.table('products').filter({id: p.id}).withFields(['quantity']).get();
                    let data = await Product.findOne({id: p.id})
                    let inCart = parseInt(p.incart);

                    // Deduct the number of pieces ordered from the quantity in database
                    if (data.quantity > 0) {
                        data.quantity = data.quantity - inCart;
                        if (data.quantity < 0) {
                            data.quantity = 0;
                        }
                    } else {
                        data.quantity = 0;
                    }

                    // Insert order details w.r.t the newly created order Id
                    let orderDetails = new OrderDetails({
                        // id: String,
                        order_id: newOrder.id,
                        product_id: p.id,
                        quantity: inCart,
                    })
                    
                    orderDetails.save().then(newOD => {
                        Product.updateOne({id:  p.id}, {quantity: data.quantity}).then(doc => {
                            resolve(newOrder.id);
                        }).catch(err => reject(err));
                    }).catch(err => reject(err));
                    
                });
            } else {
                reject({message: 'New order failed while adding order details', success: false});
            }
            
        }).catch((err)=>{mongoose.disconnect(); reject(err)})
    })
};

