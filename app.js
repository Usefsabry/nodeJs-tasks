const express = require("express");

const productRouter = require("./routers/productRouter");
const appController = require("./controllers/appcontroller");
const logger = require("./middlewares/logger");

const app = express();

app.use(express.json());

app.use(logger);

app.get("/", appController.getHome);

app.use("/api/v1/products", productRouter);

module.exports = app;