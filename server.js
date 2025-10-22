const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const auth = require("./routes/auth");
const turnos = require("./routes/turnoRoutes");
const pacientes = require("./routes/pacientesRoutes");

const errorHandler = require("./middleware/error");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/turnos", turnos);
app.use("/api/v1/auth", auth);
app.use("/api/v1/pacientes", pacientes);

app.get("/", (req, res) => {
  res.send("API de RollingVet está corriendo...");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
