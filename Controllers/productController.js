import Product from "../Models/product.js";

export const createProduct = async (req, res) => {
    try {
        const latestProduct = await Product.find().sort({ _id: -1 }).limit(1);

        let productId;
        if (!latestProduct || latestProduct.length === 0) {
            productId = 'P-0001';
        } else {
            const currentId = latestProduct[0].productId;
            let number = currentId.replace('P-', '');
            number = (parseInt(number, 10) + 1).toString().padStart(4, '0');
            productId = 'P-' + number;
        }

        const newProduct = new Product({
            ...req.body,
            productId: productId
        });

        await newProduct.save();

        return res.status(201).json({ message: "New Product Created", newProduct});
    } catch (error) {
        console.log(`The error message is ${error}.`);
        return res.status(500).json({ message: "Failed to create product" });
    }
};


