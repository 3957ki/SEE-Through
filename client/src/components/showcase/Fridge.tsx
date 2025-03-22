import React from "react";

interface FridgeComponentProps {
  children?: React.ReactNode;
}

function Fridge({ children }: FridgeComponentProps) {
  return (
    <div className="relative w-full h-full">
      {/* Fridge exterior */}
      <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-gray-700 bg-gray-200 rounded-lg overflow-hidden shadow-xl">
        {/* Fridge door divider */}
        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-700"></div>

        {/* Fridge interior - left door */}
        <div className="absolute top-0 left-0 bottom-0 w-1/2 border-r border-gray-700 p-1">
          {/* Shelves */}
          <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-400"></div>
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-400"></div>
          <div className="absolute top-3/4 left-0 right-0 h-1 bg-gray-400"></div>
        </div>

        {/* Fridge interior - right door (contains the screen) */}
        <div className="absolute top-0 right-0 bottom-0 w-1/2 p-3 flex items-center justify-center">
          {children}
        </div>

        {/* Fridge handle for the right door */}
        <div className="absolute top-1/4 bottom-1/4 right-[48%] w-2 bg-gray-600 rounded-l-md"></div>

        {/* Fridge handle for the left door */}
        <div className="absolute top-1/4 bottom-1/4 left-[48%] w-2 bg-gray-600 rounded-r-md"></div>

        {/* Fridge bottom section */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-700"></div>

        {/* Fridge top section */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gray-600"></div>
      </div>
    </div>
  );
}

export default Fridge;
