import React from 'react';
import OrderCard from './OrderCard';

const KitchenGrid = ({ items, onItemPrepared, onOrderComplete }) => {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-400 font-medium">No hay productos para esta cocina</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
      {items.map(order => (
        <OrderCard
          key={order._id}
          order={order}
          kitchenColor={order.kitchenColor}
          onItemPrepared={onItemPrepared}
          onOrderComplete={onOrderComplete}
        />
      ))}
    </div>
  );
};

export default KitchenGrid;