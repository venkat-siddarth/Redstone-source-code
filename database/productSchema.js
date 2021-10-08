const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    seller: {
        type: String,
        required: true
    },
    productType: {
        type: String,
        required: true
    },
    prodImg: {
        type: String,
        required:true
    }
},
{
    timestamps: true
});

const Product = mongoose.model('products',ProductSchema);

module.exports = Product;