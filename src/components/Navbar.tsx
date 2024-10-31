import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/koala-logo.png" 
              alt="Wordy Logo" 
              className="h-10 w-10"
            />
            <span className="text-2xl font-bold text-yellow-400">Wordy</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative flex-1">
              <input
                type="text"
                placeholder="Search movies..."
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-2.5">
                <Search className="h-5 w-5 text-gray-400 hover:text-yellow-400" />
              </button>
            </form>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Search className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-2.5">
                  <Search className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;