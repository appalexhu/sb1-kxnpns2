import React from 'react';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="space-y-4 max-w-md text-center">
            <div className="flex items-center justify-center space-x-2">
              <BookOpen className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">Wordy</span>
            </div>
            <p className="text-sm">
              Turn your screen time into study time! Learn languages through movies and TV shows.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Wordy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;