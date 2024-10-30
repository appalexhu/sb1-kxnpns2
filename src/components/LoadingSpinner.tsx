/**
 * LoadingSpinner Component
 * 
 * A reusable loading indicator component:
 * - Animated spinner using Tailwind CSS
 * - Consistent styling with app theme
 * - Centered layout
 * - Accessible animation
 * - Used across the app for loading states
 */

import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
    </div>
  );
};

export default LoadingSpinner;