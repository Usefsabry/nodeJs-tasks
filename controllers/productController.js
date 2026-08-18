const Product = require("../models/product");

exports.getProducts = async (req, res) => {
  const products = await Product.getProducts();
  res.json(products);
};

exports.getProductById = async (req, res) => {
  const product = await Product.getProductById(req.params.id);
  res.json(product);
};

exports.createProduct = async (req, res) => {
  const product = await Product.createProduct(req.body);
  res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
  const product = await Product.updateProduct(req.params.id, req.body);
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  await Product.deleteProduct(req.params.id);
  res.status(204).send();
};