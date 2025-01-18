const express = require("express");
const cors = require("cors"); // npm install cors
const fs = require("fs");

const app = express();
const PORT = 3000;

// middleware para habilitar CORS
app.use(cors());

// servir archivos estáticos (para el index.html)
app.use(express.static("src"));

// middleware para manejar JSON en el body de las solicitudes
app.use(express.json());

// para obtener todas las canciones
app.get("/canciones", (req, res) => {
    try {
        const repertorio = JSON.parse(fs.readFileSync("./src/repertorio.json", "utf8"));
        res.json(repertorio);
    } catch (error) {
        res.status(500).send("Error al leer el archivo de repertorio");
    }
});

// agregar una nueva canción
app.post("/canciones", (req, res) => {
    const nuevaCancion = req.body;
    if (!nuevaCancion.titulo || !nuevaCancion.artista || !nuevaCancion.tono) {
        return res.status(400).send("Datos incompletos");
    }

    try {
        const repertorio = JSON.parse(fs.readFileSync("./src/repertorio.json", "utf8"));
        repertorio.push(nuevaCancion);
        fs.writeFileSync("./src/repertorio.json", JSON.stringify(repertorio, null, 2));
        res.status(201).send("Canción agregada exitosamente");
    } catch (error) {
        res.status(500).send("Error al guardar la nueva canción");
    }
});

// editar una canción existente
app.put("/canciones/:id", (req, res) => {
    const id = req.params.id;
    const cancionEditada = req.body;

    try {
        const repertorio = JSON.parse(fs.readFileSync("./src/repertorio.json", "utf8"));
        const index = repertorio.findIndex((cancion) => cancion.id == id);

        if (index === -1) {
            return res.status(404).send("Canción no encontrada");
        }

        repertorio[index] = { ...repertorio[index], ...cancionEditada };
        fs.writeFileSync("./src/repertorio.json", JSON.stringify(repertorio, null, 2));
        res.send("Canción actualizada exitosamente");
    } catch (error) {
        res.status(500).send("Error al actualizar la canción");
    }
});

// eliminar una canción
app.delete("/canciones/:id", (req, res) => {
    const id = req.params.id;

    try {
        const repertorio = JSON.parse(fs.readFileSync("./src/repertorio.json", "utf8"));
        const index = repertorio.findIndex((cancion) => cancion.id == id);

        if (index === -1) {
            return res.status(404).send("Canción no encontrada");
        }

        repertorio.splice(index, 1);
        fs.writeFileSync("./src/repertorio.json", JSON.stringify(repertorio, null, 2));
        res.send("Canción eliminada exitosamente");
    } catch (error) {
        res.status(500).send("Error al eliminar la canción");
    }
});

// para iniciar el servidor
app.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));

// agrego middleware CORS para evitar el bloqueo de solicitudes: CORS se encargará de enviar las cabeceras correctas
// en las respuestas HTTP para que los navegadores permitan hacer solicitudes entre diferentes orígenes.