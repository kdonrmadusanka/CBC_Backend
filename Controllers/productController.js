import Product from "../Models/product.js";
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';

const csvFilePath = './products.csv';

// Setup CSV writer with headers — run only once (you can also move this outside the controller)
const csvWriter = createObjectCsvWriter({
  path: csvFilePath,
  header: [
    { id: 'productId', title: 'Product ID' },
    { id: 'productName', title: 'Product Name' },
    { id: 'altnames', title: 'Alt Names' },
    { id: 'images', title: 'Images' },
    { id: 'price', title: 'Price' },
    { id: 'lastPrice', title: 'Last Price' },
    { id: 'description', title: 'Description' },
    { id: 'quantity', title: 'Quantity' },
  ],
  append: true  // Important: Append data instead of overwriting
});

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

        // Prepare data for CSV row
        const record = {
            productId: newProduct.productId,
            productName: newProduct.productName,
            altnames: newProduct.altnames.join('|'),  // joining array as string with pipe delimiter
            images: newProduct.images.join('|'),
            price: newProduct.price,
            lastPrice: newProduct.lastPrice,
            description: newProduct.description,
            quantity: newProduct.quantity
        };

        // Append new product to the csv file
        await csvWriter.writeRecords([record]);

        return res.status(201).json({ message: "New Product Created", newProduct});
    } catch (error) {
        console.log(`The error message is ${error}.`);
        return res.status(500).json({ message: "Failed to create product" });
    }
};




