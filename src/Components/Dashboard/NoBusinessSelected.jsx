import React from 'react';
import { Store, AlertCircle } from 'lucide-react';

const NoBusinessSelected = ({
  title = "Selecciona un negocio",
  message = "Selecciona un negocio desde el menú superior para ver los datos.",
  icon: Icon = Store
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="bg-slate-100 rounded-full p-6 mb-6">
        <Icon size={48} className="text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-700 mb-2">
        {title}
      </h3>
      <p className="text-slate-500 text-center max-w-md">
        {message}
      </p>
      <div className="mt-6 flex items-center gap-2 text-orange-500 text-sm">
        <AlertCircle size={16} />
        <span>Usa el selector de negocios en la barra superior</span>
      </div>
    </div>
  );
};

export default NoBusinessSelected;
