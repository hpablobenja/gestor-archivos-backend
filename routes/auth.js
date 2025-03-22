const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Registro de usuario
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Inicio de sesión
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) throw new Error("Usuario no encontrado");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Contraseña incorrecta");

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.status(200).json({ message: "Inicio de sesión exitoso", token });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

module.exports = router;