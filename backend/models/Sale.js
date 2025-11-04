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
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for backwards compatibility with existing sales
        references: {
            model: 'Users',
            key: 'id'
        }
    }
});

module.exports = Sale;