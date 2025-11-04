const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Backend server is running!" });
});

module.exports = router;