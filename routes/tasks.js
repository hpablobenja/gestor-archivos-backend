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
            status: "pendiente", // Nueva tarea inicia como "pendiente"
            user: req.user.id,
        });
        await task.save();
        res.status(201).json({ message: "Tarea creada exitosamente", task });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todas las tareas del usuario
router.get("/", authMiddleware, async (req, res) => {
    const { status, search, startDate, endDate } = req.query;

    try {
        let query = { user: req.user.id }; // Filtro por usuario autenticado

        // Filtrar por estado (pendiente, en progreso, completada)
        if (status) {
            query.status = status;
        }

        // Buscar por palabra clave en el título o descripción
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        // Filtrar por rango de fechas (fecha límite)
        if (startDate && endDate) {
            query.dueDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const tasks = await Task.find(query);
        res.status(200).json({ tasks });
    } catch (err) {
        res.status(400).json({ error: "Error al obtener las tareas. Intenta nuevamente." });
    }
});

// Obtener una tarea específica
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
        if (!task) throw new Error("Tarea no encontrada");
        res.status(200).json({ task });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

// Actualizar tarea
router.put("/:id", authMiddleware, async (req, res) => {
    const { status } = req.body;
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
        if (!task) throw new Error("Tarea no encontrada");

        // Reglas de negocio para actualización de estado
        if (status) {
            if (task.status === "completada") {
                throw new Error("No se puede modificar una tarea completada");
            }
            if (task.status === "pendiente" && status !== "en progreso") {
                throw new Error("Solo se puede pasar de 'pendiente' a 'en progreso'");
            }
            if (task.status === "en progreso" && status !== "completada" && status !== "en progreso") {
                throw new Error("Solo se puede pasar de 'en progreso' a 'completada'");
            }
        }

        // Actualizar tarea con los datos enviados
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true } // Devuelve la tarea actualizada
        );
        res.status(200).json({ message: "Tarea actualizada exitosamente", task: updatedTask });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Eliminar tarea
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!task) throw new Error("Tarea no encontrada");
        res.status(200).json({ message: "Tarea eliminada exitosamente" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;


