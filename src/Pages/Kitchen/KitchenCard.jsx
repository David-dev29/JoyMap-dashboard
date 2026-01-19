// KitchenCard.jsx
import React from 'react';
import OrderCard from './OrderCard';

const KitchenCard = ({ isEmpty, order, onCheck }) => {
  return (
    <div
      className={`rounded-lg overflow-hidden aspect-[4/3] ${
        isEmpty
          ? 'bg-white border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors'
          : 'w-full h-full'
      }`}
    >
      {isEmpty ? (
        <div className="text-center text-gray-400">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        </div>
      ) : (
        <div className="w-full h-full">
          <OrderCard order={order} checked={!!order?.checked} onCheck={onCheck} />
        </div>
      )}
    </div>
  );
};

export default KitchenCard;
