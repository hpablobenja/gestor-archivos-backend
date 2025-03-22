const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth"); // Middleware para autenticación

const router = express.Router();

// Registro de usuario
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Verificar si el correo ya está registrado
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "El correo ya está registrado." });
        }

        // Crear nuevo usuario con contraseña encriptada
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (err) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Inicio de sesión
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Verificar si el usuario existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // Generar el token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(200).json({ message: "Inicio de sesión exitoso", token });
    } catch (err) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Obtener datos del usuario autenticado
router.get("/me", authMiddleware, async (req, res) => {
    try {
        // Buscar los datos del usuario autenticado
        const user = await User.findById(req.user.id).select("-password"); // Excluir la contraseña
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;