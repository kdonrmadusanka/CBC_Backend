import Product from "../Models/product.js";
import { promises as fs } from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';

const csvFilePath = './products.csv';

// CSV header configuration
const csvHeader = [
  { id: 'productId', title: 'Product ID' },
  { id: 'productName', title: 'Product Name' },
  { id: 'altnames', title: 'Alt Names' },
  { id: 'images', title: 'Images' },
  { id: 'price', title: 'Price' },
  { id: 'lastPrice', title: 'Last Price' },
  { id: 'description', title: 'Description' },
  { id: 'quantity', title: 'Quantity' },
];

// Helper to create CSV writer
const createCsvWriter = (append = false) => createObjectCsvWriter({
  path: csvFilePath,
  header: csvHeader,
  append
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
      productName: newProduct.productName || '',
      altnames: Array.isArray(newProduct.altnames) ? newProduct.altnames.join('|') : '',
      images: Array.isArray(newProduct.images) ? newProduct.images.join('|') : '',
      price: newProduct.price || 0,
      lastPrice: newProduct.lastPrice || 0,
      description: newProduct.description || '',
      quantity: newProduct.quantity || 0
    };

    // Check if CSV exists; if not, create with headers
    try {
      await fs.access(csvFilePath);
      // Ensure the file ends with a newline before appending
      let content = await fs.readFile(csvFilePath, 'utf8');
      if (content && !content.endsWith('\n')) {
        content += '\n';
        await fs.writeFile(csvFilePath, content);
      }
      // Append new product to the CSV file
      const csvWriter = createCsvWriter(true); // Append mode
      await csvWriter.writeRecords([record]);
      // Clean the file to remove any empty lines or concatenated records
      content = await fs.readFile(csvFilePath, 'utf8');
      content = content.split('\n').filter(line => line.trim() !== '' && line !== ',,,,,,,').join('\n');
      content = content.replace(/(\r?\n){2,}/g, '\n'); // Remove multiple newlines
      await fs.writeFile(csvFilePath, content);
    } catch {
      // CSV doesn't exist, create with headers and new record
      const csvWriter = createCsvWriter(false); // Overwrite mode
      await csvWriter.writeRecords([record]);
    }

    return res.status(201).json({ message: "New Product Created", newProduct });
  } catch (error) {
    console.error(`Error creating product: ${error}`);
    return res.status(500).json({ message: "Failed to create product" });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findOne({ productId: id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product: ${error}`);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper to completely rewrite CSV file
const rewriteCSV = async (records) => {
  try {
    const csvWriter = createCsvWriter(false); // Overwrite mode

    // Filter out invalid records (e.g., empty objects or records with no productId)
    const validRecords = records.filter(record => record.productId && record.productId.trim() !== '');

    if (validRecords.length === 0) {
      console.warn('No valid records to write to CSV, writing headers only');
      await csvWriter.writeRecords([]); // Write headers only
      return;
    }

    await csvWriter.writeRecords(validRecords);

    // Read the file back to check for empty lines or concatenated records
    let content = await fs.readFile(csvFilePath, 'utf8');
    // Remove empty lines and ensure proper line breaks
    content = content.split('\n').filter(line => line.trim() !== '' && line !== ',,,,,,,').join('\n');
    content = content.replace(/(\r?\n){2,}/g, '\n'); // Remove multiple newlines
    await fs.writeFile(csvFilePath, content);
  } catch (error) {
    console.error('Error rewriting CSV:', error);
    throw error;
  }
};

// Helper to update CSV content
const updateCSV = async () => {
  try {
    // Fetch all products from MongoDB to ensure no data loss
    const allProducts = await Product.find({}).lean();

    // Create records array from MongoDB data
    const records = allProducts.map(product => ({
      productId: product.productId,
      productName: product.productName || '',
      altnames: Array.isArray(product.altnames) ? product.altnames.join('|') : (product.altnames || ''),
      images: Array.isArray(product.images) ? product.images.join('|') : (product.images || ''),
      price: product.price || 0,
      lastPrice: product.lastPrice || 0,
      description: product.description || '',
      quantity: product.quantity || 0
    }));

    // Rewrite the entire CSV with all products
    await rewriteCSV(records);
  } catch (error) {
    console.error('Error updating CSV:', error);
    throw error;
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await Product.findOneAndUpdate(
      { productId: id },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update CSV file with all products
    await updateCSV();

    return res.status(200).json({ 
      message: "Product updated successfully", 
      product: updated 
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ 
      message: "Failed to update product",
      error: error.message 
    });
  }
};

// Initialize CSV file on startup
const initializeCSV = async () => {
  try {
    await fs.access(csvFilePath);
  } catch {
    // Create file with headers only if it doesn't exist
    await rewriteCSV([]);
  }
};

// Sync MongoDB with CSV on startup
const syncCSVWithMongoDB = async () => {
  try {
    const allProducts = await Product.find({}).lean();
    const records = allProducts.map(product => ({
      productId: product.productId,
      productName: product.productName || '',
      altnames: Array.isArray(product.altnames) ? product.altnames.join('|') : (product.altnames || ''),
      images: Array.isArray(product.images) ? product.images.join('|') : (product.images || ''),
      price: product.price || 0,
      lastPrice: product.lastPrice || 0,
      description: product.description || '',
      quantity: product.quantity || 0
    }));
    await rewriteCSV(records);
    console.log('CSV synchronized with MongoDB');
  } catch (error) {
    console.error('Error syncing CSV with MongoDB:', error);
  }
};

// Call this when your application starts
initializeCSV().then(syncCSVWithMongoDB).catch(console.error);