// server.js

const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Connexion à la base de données MongoDB
const MONGODB_URI = 'mongodb+srv://kana:lepain@cluster0.9kpoehb.mongodb.net/?retryWrites=true&w=majority'; // Remplacez YOUR_MONGODB_URI par l'URL de connexion à votre base de données MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => console.error('Failed to connect to MongoDB:', err));

// Définition du schéma pour les livres
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pageCount: { type: Number, required: true },
  publishedDate: Date,
  language: String,
  authors: [String],
  publisher: String,
  isbn: { type: String, required: true, unique: true }
});

// Création du modèle pour les livres
const Book = mongoose.model('Book', bookSchema);

// Définition des routes API
// Par exemple, une route pour créer un nouveau livre
app.post('/api/books', async (req, res) => {
  try {
    const bookData = req.body;
    const book = await Book.create(bookData);
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save book data' });
  }
});

// Autres routes API pour la lecture, la mise à jour et la suppression des livres

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
