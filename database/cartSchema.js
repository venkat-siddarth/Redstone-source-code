const mongoose=require("mongoose");

const CartSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    product_id:{
        type:[String]
    },
    qty:{
        type:Map,
        of:Number
    }
    },{timestamps:true}
);

var Cart = mongoose.model("cart",CartSchema);

module.exports = Cart;