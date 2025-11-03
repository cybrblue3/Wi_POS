// This file exports all models from one place
// Makes it easier to import multiple models: const { Sale, Product } = require("../models");

const Product = require("./Product");
const Sale = require("./Sale");
const SaleItem = require("./SaleItem");

module.exports = {
    Product,
    Sale,
    SaleItem,
};
