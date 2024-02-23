import React, { useState, useEffect } from 'react';
import axios from 'axios';
import exceljs from 'exceljs';
import Book from './models/Book';
import 'tailwindcss/tailwind.css';

const BookInfo = () => {
  const [isbn, setIsbn] = useState('');
  const [bookData, setBookData] = useState(null);
  const [savedBooks, setSavedBooks] = useState(JSON.parse(localStorage.getItem('savedBooks')) || []);

  useEffect(() => {
    localStorage.setItem('savedBooks', JSON.stringify(savedBooks));
  }, [savedBooks]);

  const fetchBookInfo = async () => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      );
      if (response.data.items && response.data.items.length > 0) {
        const volumeInfo = response.data.items[0].volumeInfo;
        const data = {
          title: volumeInfo.title,
          pageCount: volumeInfo.pageCount,
          publishedDate: volumeInfo.publishedDate,
          language: volumeInfo.language,
          authors: volumeInfo.authors,
          publisher: volumeInfo.publisher,
          isbn: volumeInfo.industryIdentifiers.find(
            identifier => identifier.type === 'ISBN_13'
          ).identifier,
          nbre_exemplaire: 1
        };

        setBookData(data);
      } else {
        setBookData(null);
        alert('Aucun livre trouvé pour cet ISBN.');
      }
    } catch (error) {
      console.error('Error fetching book info:', error);
      alert('Une erreur s\'est produite lors de la récupération des informations du livre.');
    }
  };

  const saveBookInfo = async () => {
    try {
      if (bookData) {
        const existingBookIndex = savedBooks.findIndex(book => book.isbn === bookData.isbn);
        if (existingBookIndex !== -1) {
          const confirmIncrement = window.confirm('Le livre que vous voulez sauvegarder existe déjà. Voulez-vous le compter comme un exemplaire supplémentaire ?');
          if (confirmIncrement) {
            const updatedBooks = [...savedBooks];
            updatedBooks[existingBookIndex].nbre_exemplaire += 1;
            setSavedBooks(updatedBooks);
          }
        } else {
          setSavedBooks([...savedBooks, bookData]);
        }
      } else {
        alert('Aucune donnée de livre à sauvegarder.');
      }
    } catch (error) {
      console.error('Error saving book info:', error);
      alert('Une erreur s\'est produite lors de la sauvegarde des informations du livre.');
    }
  };

  const exportToExcel = async () => {
    try {
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Saved Books');

      worksheet.addRow(['Title', 'Page Count', 'Published Date', 'Language', 'Authors', 'Publisher', 'ISBN', 'Nombre d\'exemplaires']);

      savedBooks.forEach(book => {
        worksheet.addRow([
          book.title,
          book.pageCount,
          book.publishedDate,
          book.language,
          book.authors.join(', '),
          book.publisher,
          book.isbn,
          book.nbre_exemplaire
        ]);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'saved_books.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data to Excel:', error);
      alert('Une erreur s\'est produite lors de l\'exportation des données vers Excel.');
    }
  };

  const handleInputChange = event => {
    setIsbn(event.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recherche de livre par ISBN</h1>
      <div className="flex mb-4">
        <input type="text" placeholder="ISBN" value={isbn} onChange={handleInputChange} className="mr-2 px-4 py-2 border border-gray-300 rounded-lg" />
        <button onClick={fetchBookInfo} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Rechercher</button>
      </div>
      <button onClick={saveBookInfo} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Sauvegarder</button>
      <button onClick={exportToExcel} className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 ml-4">Exporter</button>
      {bookData && (
        <div className="my-4 p-4 border border-gray-300 rounded-lg">
          <p><span className="font-semibold">Titre:</span> {bookData.title}</p>
          <p><span className="font-semibold">Nombre de pages:</span> {bookData.pageCount}</p>
          <p><span className="font-semibold">Date de publication:</span> {bookData.publishedDate}</p>
          <p><span className="font-semibold">Langue:</span> {bookData.language}</p>
          <p><span className="font-semibold">Auteur(s):</span> {bookData.authors.join(', ')}</p>
          <p><span className="font-semibold">Éditeur:</span> {bookData.publisher}</p>
          <p><span className="font-semibold">ISBN:</span> {bookData.isbn}</p>
        </div>
      )}
      <h2 className="text-xl font-bold mb-2">Livres Sauvegardés</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Titre</th>
            <th className="px-4 py-2">Nombre de pages</th>
            <th className="px-4 py-2">Date de publication</th>
            <th className="px-4 py-2">Langue</th>
            <th className="px-4 py-2">Auteur(s)</th>
            <th className="px-4 py-2">Éditeur</th>
            <th className="px-4 py-2">ISBN</th>
            <th className="px-4 py-2">Nombre d'exemplaires</th>
          </tr>
        </thead>
        <tbody>
          {savedBooks.map((book, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{book.title}</td>
              <td className="border px-4 py-2">{book.pageCount}</td>
              <td className="border px-4 py-2">{book.publishedDate}</td>
              <td className="border px-4 py-2">{book.language}</td>
              <td className="border px-4 py-2">{book.authors.join(', ')}</td>
              <td className="border px-4 py-2">{book.publisher}</td>
              <td className="border px-4 py-2">{book.isbn}</td>
              <td className="border px-4 py-2">{book.nbre_exemplaire}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookInfo;

