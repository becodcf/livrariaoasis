import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';

// Carrega as variáveis do arquivo .env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve os arquivos estáticos da pasta "public" (o seu HTML)
app.use(express.static(path.join(__dirname, '../public')));

// Configuração da conexão com o banco de dados
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Rota para buscar os livros (Consulta)
app.get('/livros', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM livros ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar livros:', error);
        res.status(500).json({ erro: 'Falha ao buscar dados' });
    }
});

// Rota para cadastrar um livro (Gravação)
app.post('/livros', async (req, res) => {
    const { titulo, autor } = req.body;
    
    if (!titulo || !autor) {
        return res.status(400).json({ erro: 'Título e autor são obrigatórios' });
    }

    try {
        await pool.query('INSERT INTO livros (titulo, autor) VALUES (?, ?)', [titulo, autor]);
        res.status(201).json({ mensagem: 'Livro cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar livro:', error);
        res.status(500).json({ erro: 'Falha ao gravar no banco' });
    }
});

// Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});