import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Translator from './components/Translator';
import FlashcardList from './components/FlashcardList';
import Practice from './components/Practice';
import QuoteDisplay from './components/QuoteDisplay';
import AnimeQuoteDisplay from './components/AnimeQuoteDisplay';
import AnimeQuoteAdmin from './components/AnimeQuoteAdmin';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <QuoteDisplay />
                  <AnimeQuoteDisplay />
                </div>
                <Translator />
              </>
            } />
            <Route path="/flashcards" element={<FlashcardList />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/anime-quotes/admin" element={<AnimeQuoteAdmin />} />
          </Routes>
        </main>
        <footer className="bg-gray-100 border-t border-gray-200 py-4">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>© 2023 LinguaLearn - Language Learning Application</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
