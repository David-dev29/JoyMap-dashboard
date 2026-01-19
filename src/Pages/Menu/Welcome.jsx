import React from 'react';
import logo from '../../assets/kumitas.png';

const WelcomePage = () => {
  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Página de bienvenida</h1>
        <button className="text-gray-600 flex items-center gap-2 hover:text-gray-800 transition">
          <span>Apariencia</span>
        </button>
      </div>

      {/* Contenedor principal */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-gray-700 mb-4 font-medium">Sección principal</h2>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 flex-shrink-0">
            <img
              src={logo}
              alt="Air York Logo"
              className="rounded-lg h-16 w-16 object-contain bg-orange-500"
            />
          </div>

          <div className="flex-grow space-y-4">
            {/* Fila de acciones */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Switch destacado */}
              <button className="bg-gray-100 p-1 rounded-lg border border-gray-200 hover:bg-gray-200 transition">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">⭐</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="peer h-4 w-11 rounded-full border bg-slate-400 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-400 after:bg-white after:transition-all peer-checked:bg-green-500 peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </button>

              {/* Info */}
              <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 text-sm">
                i
              </div>

              {/* Estado */}
              <button className="bg-gray-100 p-1 rounded-lg border border-gray-200 hover:bg-gray-200 transition">
                <div className="flex items-center gap-1 text-blue-500">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                  <span>Abierto</span>
                  <span>✎</span>
                </div>
              </button>

              {/* Link edición */}
              <a href="#" className="text-blue-500 underline hover:text-blue-600 transition">
                Edición de redes sociales
              </a>
            </div>

            {/* Input título */}
            <div className="border rounded p-2 relative hover:border-blue-500 transition">
              <span className="absolute -top-2 left-4 bg-white px-1 text-xs text-gray-500">
                Título
              </span>
              <input
                type="text"
                defaultValue="¡Si lo pides, lo tienes!"
                className="w-full border-none focus:outline-none text-gray-800"
              />
              <div className="text-right text-sm text-gray-400">30/60</div>
            </div>

            {/* Input descripción */}
            <div className="border rounded p-2 relative hover:border-blue-500 transition">
              <span className="absolute -top-2 left-8 bg-white px-1 text-xs text-gray-500">
                Descripción adicional
              </span>
              <input
                type="text"
                placeholder="Escribe aquí..."
                className="w-full border-none focus:outline-none text-gray-800"
              />
              <div className="text-right text-sm text-gray-400">50/160</div>
            </div>
          </div>
        </div>

        {/* Botones configurables */}
        <div className="space-y-4">
          <h3 className="text-gray-700 font-medium">Botones (2)</h3>

          {/* Ejemplo de tarjeta de botón */}
          <div className="border rounded p-3 bg-gray-50 hover:border-blue-400 transition">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <button className="p-2 rounded hover:bg-gray-200">
                {/* Icono menú */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="16"
                  height="16"
                  strokeWidth="1"
                  className="text-gray-600"
                >
                  <path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" />
                </svg>
              </button>

              <div className="flex-grow">
                <div className="border rounded p-2 relative hover:border-blue-500 flex items-center h-12">
                  <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
                    Nombre del botón
                  </span>
                  <input
                    type="text"
                    defaultValue="Productos"
                    className="w-full border-none focus:outline-none"
                  />
                  <div className="text-right text-xs text-gray-400">30/60</div>
                </div>
              </div>

              <div className="flex-grow">
                <div className="border rounded p-2 relative hover:border-blue-500 flex items-center h-12">
                  <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
                    Enlace a donde lleva
                  </span>
                  <input
                    type="text"
                    defaultValue="https://kuma.encorto/products"
                    className="w-full border-none focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones para añadir más */}
        <div className="flex flex-wrap gap-2 mt-6">
          {['Whatsapp', 'Enlace externo', 'PDF', 'WiFi'].map((label) => (
            <button
              key={label}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600 transition"
            >
              <span>+</span> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Pie de página */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-gray-700 text-lg font-medium flex items-center gap-2 mb-4">
          Pie de página
          <span className="text-gray-400 rounded-full border border-gray-300 w-5 h-5 flex items-center justify-center text-xs">
            i
          </span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Botón "Descargar Aplicación"</span>
              <span className="text-gray-400 rounded-full border border-gray-300 w-5 h-5 flex items-center justify-center text-xs">i</span>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" />
              <div className="peer h-4 w-11 rounded-full border bg-slate-400 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-400 after:bg-white after:transition-all peer-checked:bg-blue-500 peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700">Mención Encorto</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" />
              <div className="peer h-4 w-11 rounded-full border bg-slate-400 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-400 after:bg-white after:transition-all peer-checked:bg-blue-500 peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
