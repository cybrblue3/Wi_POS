const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Sale = sequelize.define("Sale", {
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    payment_method: {
        type: DataTypes.STRING,
        defaultValue: 'Cash',
    }
    // I can add cashier_id, customer info, etc... if needed later!
});

module.exports = Sale;