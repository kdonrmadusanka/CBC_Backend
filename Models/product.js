import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productId : {
        type: String,
        required: true,
        unique: true
    },
    productName : {
        type: String,
        required: true
    },
    altnames: [{
        type: String
    }],
    images: [{
        type: String
    }],
    price: {
        type: Number,
        required: true
    },
    lastPrice: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true,
        default: 0
    }
})

const Product = mongoose.model("Product", productSchema);

export default Product;