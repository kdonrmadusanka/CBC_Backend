import Product from "../Models/product.js";

export const createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();

        return res.status(201).json({ message: "New Product Created" });
    } catch (error) {
        console.log(`The error message is ${error}.`);
        
        res.status(500).json({ message: "Failed to create product"});
    }
}