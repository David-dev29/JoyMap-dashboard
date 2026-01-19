import React from "react";

const OrdersHeader = () => {
  const headers = ["Fecha", "Estado", "Total", "Cliente"];

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-5 py-2">
      <div className="flex text-xs font-bold text-gray-400 uppercase tracking-wider">
        {headers.map((title, idx) => (
          <div
            key={idx}
            className={`group relative flex items-center ${
              idx === headers.length - 1 ? "flex-1" : "w-[160px]"
            } ${title === "Fecha" ? "w-[140px]" : ""}${title === "Total" ? "w-[180px]" : ""}`}
          >
            <span className="group-hover:text-black transition-colors">
              {title}
            </span>
            <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
              ↑
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersHeader;
