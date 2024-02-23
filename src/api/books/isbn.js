const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (assuming you have MongoDB running locally)
mongoose.connect('mongodb+srv://kana:lepain@cluster0.9kpoehb.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Create a schema for books
const bookSchema = new mongoose.Schema({
    title: String,
    pageCount: Number,
    language: String,
    author: String,
    publisher: String,
    isbn: String
});

const Book = mongoose.model('Book', bookSchema);

app.use(bodyParser.json());

// Route to fetch book details by ISBN
app.get('/api/books/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        const bookData = response.data.items[0].volumeInfo;

        const book = new Book({
            title: bookData.title,
            pageCount: bookData.pageCount,
            language: bookData.language,
            author: bookData.authors.join(', '),
            publisher: bookData.publisher,
            isbn: isbn
        });

        await book.save();

        res.json(book);
    } catch (error) {
        console.error("Une erreur s'est produite lors de la recherche de livres :", error);
        res.status(500).send("Une erreur s'est produite lors de la recherche de livres");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
