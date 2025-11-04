const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/db");

// Import all models
const Product = require("./models/Product");
const Sale = require("./models/Sale");
const SaleItem = require("./models/SaleItem");

// Define relationships between models
// A Sale has many SaleItems, each SaleItem belongs to one Sale
Sale.hasMany(SaleItem, { foreignKey: 'saleId', onDelete: 'CASCADE' });
SaleItem.belongsTo(Sale, { foreignKey: 'saleId' });

// A Product can appear in many SaleItems
Product.hasMany(SaleItem, { foreignKey: 'productId' });
SaleItem.belongsTo(Product, { foreignKey: 'productId' });

// Import routes
const testRoute = require("./routes/testRoute");
const productRoutes = require("./routes/productRoutes");
const salesRoutes = require("./routes/salesRoutes");

// Sync database (creates tables if they don't exist)
sequelize.sync();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/test", testRoute);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});