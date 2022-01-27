const {Product} = require('./product');
const mongoose = require('mongoose');

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

// GET ALL ORDERS
exports.getAllOrders = ()=>{
    return new Promise((resolve, reject)=>{
        Order.aggregate([
            {
                $lookup: { 
                    from: "users",
                    localField: "user_id",
                    foreignField: "id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    _id:0,
                    order_id: "$id",
                    username: "$user.username",
                }
            },
            {
                $lookup: { 
                    from: "orders_details",
                    "let": { "orderId": "$order_id" },
                    "pipeline": [
                        { "$match": { "$expr": { "$eq": ["$order_id", "$$orderId"] }}},
                        {"$lookup": {
                            from: "products",
                            "let": { "prodId": "$product_id" },
                            "pipeline": [
                                { "$match": { "$expr": { "$eq": ["$id", "$$prodId"] }}}
                            ],
                            "as": "product"
                        }},
                        { $unwind: "$product" },
                        {
                            $project: {
                                _id: 0,
                                // order_id: 1,
                                product_id: 1,
                                title: "$product.title",
                                description: "$product.short_desc",
                                image: "$product.image",
                                qty_ordered: "$quantity",
                                price: "$product.price"
                            }
                        }
                    ],
                    as: "details"
                }
            },
        ]).then(orders => {
            if (orders.length > 0) {
                resolve(orders);
            } else {
                reject({message: "No orders found"});
            }
        }).catch((err)=>{reject(err)});
    })
}

// Get Single Order
exports.getOrderById = (orderId)=>{
    return new Promise((resolve, reject)=>{
        OrderDetails.aggregate([
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
                    id: "$or.id",
                    title: "$p.title",
                    description: "$p.description",
                    price: "$p.price",
                    image: "$p.image",
                    quantityOrdered: "$quantity",
                }
            }
        ]).then(order => {
            if (order.length > 0) {
                resolve(order);
            } else {
                resolve({message: `NO ORDER FOUND WITH ID : ${orderId}`});
            }
        }).catch((err)=>{reject({err : err, message: `Error from BE catch`})});
    })
}

// Place New Order
exports.addNewOrder =  (userId, products) => {
    return new Promise(async(resolve, reject)=>{
        let maxId = await Order.findOne({}, { _id: 0, id: 1 })
            .sort({ id: -1 })
            .collation({ locale: "en_US", numericOrdering: true });
    
        let order = new Order({
            id : parseInt(maxId.id) + 1,
            user_id : userId
        })
        
        order.save().then(async (newOrder) => {
            let maxIdOD = await OrderDetails.findOne({}, { _id: 0, id: 1 })
                .sort({ id: -1 })
                .collation({ locale: "en_US", numericOrdering: true });
            let currentId = parseInt(maxIdOD.id);

            products.forEach(async (p) => {
                let data = await Product.findOne({id: p.id}, {quantity: 1})
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
                ++currentId;
                let orderDetails = new OrderDetails({
                    id: currentId,
                    order_id: newOrder.id,
                    product_id: p.id,
                    quantity: inCart,
                })
                
                orderDetails.save().then(newOD => {
                    Product.updateOne({id:  p.id}, {quantity: data.quantity}).then(doc => {
                        resolve(newOrder.id);
                    }).catch(err => reject(err));
                }).catch(err => reject(err));
                
            })   
        }).catch((err)=>{
            reject({message: 'New order failed while adding order details', success: false})
        })
    })
};

//DELETE ORDER
exports.deleteOrderById = (orderId)=>{
    return new Promise((resolve, reject)=>{
        Order.deleteOne({id: orderId}).then((res)=>{
            if (res.deletedCount == 1) {
                OrderDetails.deleteMany({order_id: orderId}).then((res)=>{ 
                    resolve({
                        message: `Record deleted with Order id ${orderId}`,
                        status: 'success'
                    });
                });
            } else {
                reject({status: 'failure', message: 'Cannot delete the Order'});
            }
        }).catch((err)=>{
            reject(err);
        });
    });
};

// GET ALL ORDERS
// exports.getAllOrders = ()=>{
//     return new Promise((resolve, reject)=>{
//         OrderDetails.aggregate([
//             {
//                 $lookup: { 
//                     from: "orders",
//                     localField: "order_id",
//                     foreignField: "id",
//                     as: "or"
//                 }
//             },
//             {
//                 $lookup: { 
//                     from: "products",
//                     localField: "product_id",
//                     foreignField: "id",
//                     as: "p"
//                 }
//             },
//             {
//                 $lookup: { 
//                     from: "users",
//                     localField: "or.user_id",
//                     foreignField: "id",
//                     as: "us"
//                 }
//             },
//             { $unwind: "$or" },
//             { $unwind: "$p" },
//             { $unwind: "$us" },
//             {
//                 $project: {
//                     order_id: "$or.id",
//                     product_id: "$p.id",
//                     title: "$p.title",
//                     description: "$p.description",
//                     price: "$p.price",
//                     username: "$us.username",
//                     qty_ordered: "$quantity",
//                 }
//             }
//         ]).then(orders => {
//             if (orders.length > 0) {
//                 resolve(orders);
//             } else {
//                 reject({message: "No orders found"});
//             }
//         }).catch((err)=>{reject(err)});
//     })
// }