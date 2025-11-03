 const { DataTypes } = require("sequelize");
 const sequelize = require("../config/db");

 const Product = sequelize.define("Product", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10,2),
        allowNull:false,
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'Other',
    },
 });

 module.exports = Product;