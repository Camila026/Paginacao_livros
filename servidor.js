const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const conn_uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'livros';

app.use(
    cors({
        origin: "http://localhost:8000",
    })
);
app.use(express.json());

async function connectToDatabase(collectionName, callback) {
    const client = new MongoClient(conn_uri);
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        return await callback(collection);
    } finally {
        await client.close();
    }
}

// Rotas
app.get("/livros/:page", async (req, res) => {
    const page = parseInt(req.params.page, 10);
    
    if (isNaN(page) || page <= 0) {
        return res.status(400).json({ message: "Página inválida" });
    }

    const skip = (page - 1) * 10;

    try {
        const books = await connectToDatabase('livro', collection => 
            collection.find({}).skip(skip).limit(10).toArray()
        );
        res.json(books);
    } catch (error) {
        console.error("Ocorreu um erro ao buscar as informações dos livros: ", error);
        res.status(500).json({ message: `Erro ao buscar os livros:  ${error}` });
    }
});

app.get("/count", async (req, res) => {
    try {
        const total = await connectToDatabase('livro', collection => collection.countDocuments());
        res.json({ total });
    } catch (error) {
        console.error("Erro ao contar os livros: ", error);
        res.status(500).json({ message: `Erro ao contar os livros: ${error}` });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
