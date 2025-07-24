"use client";
import { useState } from "react";
import { Info, X } from "lucide-react";

export default function IngredientsButton({ ingredients }: { ingredients: string }) {
  const [open, setOpen] = useState(false);

  // Parse ingredients into array for better display
  const ingredientsList = ingredients
    .split(/[,\n]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200/50 hover:border-green-300/50 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-green-200/25"
        aria-label="View ingredients"
      >
        <Info className="w-5 h-5 text-green-700 group-hover:text-green-800 transition-colors duration-200" />
        <div className="absolute inset-0 rounded-full bg-green-400/20 scale-0 group-hover:scale-100 transition-transform duration-300 ease-out" />
      </button>

      {/* Custom Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Ingredients
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
                aria-label="Close ingredients"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto p-6">
              {ingredientsList.length > 1 ? (
                <ul className="space-y-3">
                  {ingredientsList.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-700 mt-2 flex-shrink-0" />
                      <span className="text-gray-800 leading-relaxed">
                        {ingredient}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {ingredients}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Always check labels for the most up-to-date ingredient information
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}