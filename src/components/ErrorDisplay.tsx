/**
 * ErrorDisplay Component
 * 
 * Reusable error display component:
 * - Consistent error messaging
 * - Optional retry functionality
 * - Visual error indicator
 * - Accessible error presentation
 * - Themeable styling
 * 
 * Props:
 * - title?: string
 * - message?: string
 * - onRetry?: () => void
 * 
 * Dependencies:
 * - lucide-react for icons
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  title = 'An error occurred', 
  message = 'Please try again later', 
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-red-500 mb-2">{title}</h2>
      <p className="text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;