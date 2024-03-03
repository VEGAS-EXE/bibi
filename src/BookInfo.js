
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import exceljs from 'exceljs';
import './main.css'; // Importez le fichier CSS
import './modal.js';// Importez les fonctions du composant modal si nécessaire

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

      worksheet.addRow(['Titre', 'Nb_Pages', 'Date_publication', 'Langue', 'Auteur(s)', 'Edition', 'ISBN', 'Nb_d\'exemplaires']);

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
  const clearTable = () => {
    const confirmRemove = window.confirm('Êtes-vous sûr de vouloir vider la table ?');
    if (confirmRemove) {
      setSavedBooks([]);
    }
    
  };
  const handleInputChange = event => {
    setIsbn(event.target.value);
  };

  const removeBook = (index) => {
    const confirmRemove = window.confirm('Êtes-vous sûr de vouloir supprimer ce livre ?');
    if (confirmRemove) {
      const updatedBooks = [...savedBooks];
      updatedBooks.splice(index, 1);
      setSavedBooks(updatedBooks);
    }
  };

  return (
    <main className="container" >
      <h1><b>BOOK FINDER</b></h1>
      <div className="flexi">
        <input type="text" placeholder="Enter book ID" value={isbn} onChange={handleInputChange} />
        <button onClick={fetchBookInfo}>Search</button>
      </div>
      <h1>Preview</h1>
      <div className="contain">
        {bookData && (
          <table>
            <tbody>
            <tr>
                <th>Title</th>
                <th>Pages</th>
                <th>Published</th>
                <th>Language</th>
                <th>Author(s)</th>
                <th>Editor</th>
                <th>ISBN</th>
              </tr>
              <tr>
                <td>{bookData.title}</td>
                <td>{bookData.pageCount}</td>
                <td>{bookData.publishedDate}</td>
                <td>{bookData.language}</td>
                <td>{bookData.authors.join(', ')}</td>
                <td>{bookData.publisher}</td>
                <td>{bookData.isbn}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div className="button">
        <button onClick={saveBookInfo}>Save</button>
      </div>

      <div className="book">
        <h2>Books saved</h2>
        <div>
          <button onClick={exportToExcel}>Export</button>
          <button className="peine" onClick={clearTable}>Clear</button>
        </div>
      </div>

      <div className="contain">
        <table>
          <tbody>
            <tr>
              <th>Title</th>
              <th>Pages</th>
              <th>Published</th>
              <th>Language</th>
              <th>Author</th>
              <th>Editor</th>
              <th>ISBN</th>
              <th>In stock</th>
              <th>Actions</th>
            </tr>
            {savedBooks.map((book, index) => (
              <tr key={index}>
                <td>{book.title}</td>
                <td>{book.pageCount}</td>
                <td>{book.publishedDate}</td>
                <td>{book.language}</td>
                <td>{book.authors.join(', ')}</td>
                <td>{book.publisher}</td>
                <td>{book.isbn}</td>
                <td>{book.nbre_exemplaire}</td>
                <td>
                  <button className='pain' onClick={() => removeBook(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default BookInfo;

