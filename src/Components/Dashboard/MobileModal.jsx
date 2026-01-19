import React, { useState } from "react";

function Modal() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-w-screen flex flex-col items-center justify-center">
      {/* Botón para abrir el modal */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex justify-center w-full px-1 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="1.75">
  <path d="M12 21h-4a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8"></path>
  <path d="M11 4h2"></path>
  <path d="M16 22l5 -5"></path>
  <path d="M21 21.5v-4.5h-4.5"></path>
  <path d="M12 17v.01"></path>
</svg>
      </button>

      {/* Modal */}
      {open && (
        <>
          {/* Contenedor del modal */}
          <div className="fixed right-5 top-1/2 transform -translate-y-1/2 flex items-center justify-center z-40">
            <div
              className="relative bg-white shadow-xl rounded-3xl border-2 border-gray-300 transform transition-transform duration-500 ease-in-out sm:w-[375px] sm:h-[667px] w-[350px] h-[600px]"
            >
              {/* Botón de cierre "X" */}
              <button
                onClick={() => setOpen(false)}
                className="absolute -top-4 -right-4 z-50 text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="24"
                  height="24"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Contenido del modal */}
              <div className="relative h-full">
                {/* Simulación de la pantalla del iPhone */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gray-300 rounded-t-3xl flex justify-center items-center">
                  <div className="w-4 h-1 bg-gray-500 rounded-md"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-300 rounded-b-3xl"></div>

                {/* Contenido principal */}
                <div className="p-6 sm:p-8 text-center pt-12 pb-24">
                  <span className="mb-4 inline-flex justify-center items-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 shadow-sm">
                    <svg
                      className="w-8 h-8"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path>
                    </svg>
                  </span>
                  <h3 className="mb-4 text-xl font-bold text-gray-800">
                    Sign out
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Are you sure you would like to sign out of your account?
                  </p>

                  <div className="mt-6 flex flex-col gap-4">
                    <a
                      className="py-2 px-4 flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm"
                      href="#"
                    >
                      Sign out
                    </a>
                    <button
                      onClick={() => setOpen(false)}
                      className="py-2 px-4 flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Modal;
