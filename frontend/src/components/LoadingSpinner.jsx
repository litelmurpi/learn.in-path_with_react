import React from "react";

const LoadingSpinner = ({ size = "medium", fullScreen = true }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16",
  };

  const spinner = (
    <div className={`${sizeClasses[size]} relative`}>
      <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          {spinner}
          <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{spinner}</div>;
};

export default LoadingSpinner;
