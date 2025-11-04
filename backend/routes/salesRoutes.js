const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const SaleItem = require("../models/SaleItem");
const Product = require("../models/Product");
const User = require("../models/User");
const sequelize = require("../config/db");
const { authenticateToken } = require("./authRoutes");

// CREATE a new sale (All authenticated users can create sales)
router.post("/", authenticateToken, async (req, res) => {
    // req.body should look like:
    // {
    //   items: [
    //     { productId: 1, quantity: 2 },
    //     { productId: 3, quantity: 1 }
    //   ]
    // }

    const transaction = await sequelize.transaction();

    try {
        const { items, payment_method } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Sale must have at least one item" });
        }

        let totalAmount = 0;
        const saleItemsData = [];

        // Process each item: check stock, calculate price
        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction });

            if (!product) {
                await transaction.rollback();
                return res.status(404).json({ error: `Product with ID ${item.productId} not found` });
            }

            if (product.stock_quantity < item.quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`
                });
            }

            // Calculate this item's total
            const itemTotal = parseFloat(product.price) * item.quantity;
            totalAmount += itemTotal;

            // Prepare SaleItem data
            saleItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price, // Store current price
            });

            // Update product stock
            product.stock_quantity -= item.quantity;
            await product.save({ transaction });
        }

        // Create the Sale (with userId from authenticated user)
        const sale = await Sale.create(
            {
                total_amount: totalAmount,
                payment_method: payment_method || 'Cash',
                userId: req.user.id  // Track which user made this sale
            },
            { transaction }
        );

        // Create all SaleItems linked to this sale
        const saleItems = await Promise.all(
            saleItemsData.map(itemData =>
                SaleItem.create(
                    { ...itemData, saleId: sale.id },
                    { transaction }
                )
            )
        );

        // Commit the transaction (save everything)
        await transaction.commit();

        // Return the complete sale with items
        res.status(201).json({
            sale,
            items: saleItems,
        });

    } catch (err) {
        // If anything fails, rollback (undo everything)
        await transaction.rollback();
        res.status(500).json({ error: err.message });
    }
});

// GET all sales (filtered by role)
router.get("/", authenticateToken, async (req, res) => {
    try {
        // Admin can see all sales (including old ones without userId)
        // Cashiers only see their own sales
        const { Op } = require('sequelize');
        const whereClause = req.user.role === 'admin'
            ? {}
            : {
                [Op.or]: [
                    { userId: req.user.id },
                    { userId: null } // Show old sales without userId to all users
                ]
              };

        const sales = await Sale.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'role'], // Include user info
                    required: false // Allow sales without a user (old sales)
                }
            ],
            order: [['createdAt', 'DESC']], // Most recent first
        });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET one sale with all its items and product details
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const sale = await Sale.findByPk(req.params.id, {
            include: [
                {
                    model: SaleItem,
                    include: [Product], // Include product details for each item
                },
                {
                    model: User,
                    attributes: ['id', 'username', 'role']
                }
            ],
        });

        if (!sale) {
            return res.status(404).json({ error: "Sale not found" });
        }

        // Cashiers can only view their own sales, admins can view all
        if (req.user.role !== 'admin' && sale.userId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. You can only view your own sales.' });
        }

        res.json(sale);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
