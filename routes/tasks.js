const express = require("express");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Crear tarea
router.post("/", authMiddleware, async (req, res) => {
    const { title, description, dueDate } = req.body;
    try {
        const task = new Task({ 
            title, 
            description, 
            dueDate, 
            user: req.user.id 
        });
        await task.save();
        res.status(201).json({ message: "Tarea creada exitosamente", task });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todas las tareas
router.get("/", authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Actualizar una tarea
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!task) throw new Error("Tarea no encontrada");
        res.status(200).json({ message: "Tarea actualizada exitosamente", task });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Eliminar una tarea
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ 
            _id: req.params.id, 
            user: req.user.id 
        });
        if (!task) throw new Error("Tarea no encontrada");
        res.status(200).json({ message: "Tarea eliminada exitosamente" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;