const mongoose=require("mongoose");

const OrderSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    product:{
        type:[String]
    },
    productName:{
        type:[String]
    },
    ordered_date:{
        type: String, 
        default: Date
    },
    price: {
        type: Map,
        required: true
    },
    qty:{
        type:Map,
        required:true
    },
    shipping_address:{
        type:String,
        required:true
    }
});

const Orders = mongoose.model("order",OrderSchema);

module.exports = Orders;