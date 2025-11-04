const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./Product");

const SaleItem = sequelize.define("SaleItem", {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), // price at time of sale
        allowNull: false,
    }
});

// Relationships handled in app.js (or a separate index.js in models for clarity)
module.exports = SaleItem;