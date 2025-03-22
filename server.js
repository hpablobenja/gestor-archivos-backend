const express = require("express");
const cors = require("cors");
const connectDB = require("./db"); // Archivo de configuración para la base de datos
require("dotenv").config();

const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", require("./routes/auth")); // Rutas para autenticación
app.use("/api/tasks", require("./routes/tasks")); // Rutas para gestión de tareas

// Puerto y arranque del servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));