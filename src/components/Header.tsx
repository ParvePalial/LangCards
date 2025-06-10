import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [showAdmin, setShowAdmin] = useState(false);
  
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">LinguaLearn</Link>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <Link to="/" className="hover:text-blue-200 transition-colors">
                Translator
              </Link>
            </li>
            <li>
              <Link to="/flashcards" className="hover:text-blue-200 transition-colors">
                Flashcards
              </Link>
            </li>
            <li>
              <Link to="/practice" className="hover:text-blue-200 transition-colors">
                Practice
              </Link>
            </li>
            <li className="relative">
              <button 
                onClick={() => setShowAdmin(!showAdmin)}
                className="hover:text-blue-200 transition-colors flex items-center"
              >
                Admin
                <svg 
                  className={`ml-1 h-4 w-4 transition-transform ${showAdmin ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showAdmin && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link 
                    to="/anime-quotes/admin" 
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => setShowAdmin(false)}
                  >
                    Anime Quotes Admin
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 