const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Create
router.post("/", async (req, res) => {
    try {
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read all
router.get("/", async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update
router.put("/:id", async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        await product.update(req.body);
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete
router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });
        await product.destroy();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;