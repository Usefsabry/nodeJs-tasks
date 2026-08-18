const fs = require("fs").promises;
const path = require("path");

class Product {
  constructor(name, price, category) {
    this.name = name;
    this.price = price;
    this.category = category;
  }

  static async getProducts() {
    const dataBuffer = await fs.readFile(
      path.resolve(__dirname, "..", "data", "data.json")
    );

    const data = JSON.parse(dataBuffer);

    return data.products;
  }

  static async getProductById(id) {
    const products = await this.getProducts();

    return products.find((product) => product.id === Number(id));
  }

  static async createProduct(product) {
    const dataBuffer = await fs.readFile(
      path.resolve(__dirname, "..", "data", "data.json")
    );

    const data = JSON.parse(dataBuffer);

    const newId =
      data.products.length > 0
        ? data.products[data.products.length - 1].id + 1
        : 1;

    product.id = newId;

    data.products.push(product);

    await fs.writeFile(
      path.resolve(__dirname, "..", "data", "data.json"),
      JSON.stringify(data, null, 2)
    );

    return product;
  }

  static async updateProduct(id, updatedData) {
    const dataBuffer = await fs.readFile(
      path.resolve(__dirname, "..", "data", "data.json")
    );

    const data = JSON.parse(dataBuffer);

    const index = data.products.findIndex(
      (product) => product.id === Number(id)
    );

    if (index === -1) {
      return null;
    }

    data.products[index] = {
      ...data.products[index],
      ...updatedData,
      id: Number(id)
    };

    await fs.writeFile(
      path.resolve(__dirname, "..", "data", "data.json"),
      JSON.stringify(data, null, 2)
    );

    return data.products[index];
  }

  static async deleteProduct(id) {
    const dataBuffer = await fs.readFile(
      path.resolve(__dirname, "..", "data", "data.json")
    );

    const data = JSON.parse(dataBuffer);

    const index = data.products.findIndex(
      (product) => product.id === Number(id)
    );

    if (index === -1) {
      return false;
    }

    data.products.splice(index, 1);

    await fs.writeFile(
      path.resolve(__dirname, "..", "data", "data.json"),
      JSON.stringify(data, null, 2)
    );

    return true;
  }
}

module.exports = Product;