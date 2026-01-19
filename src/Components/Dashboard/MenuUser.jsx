import { useState } from "react";
import logo from '../../assets/KUMA.png';

export default function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative flex justify-center">
      <div className="relative inline-block">
        {/* Dropdown toggle button */}
        <button
  onClick={toggleDropdown}
  className="relative z-10 flex items-center p-3 text-sm text-gray-600 bg-transparent border-0 rounded-md focus:outline-none focus:ring-0 dark:text-white dark:bg-transparent w-full"
>
  <a className="flex items-center space-x-3 hover:text-gray-200 flex-grow" href="#">
    <img
      className="flex-shrink-0 object-contain bg-orange-100 rounded-full w-9 h-9"
      src={logo}
      alt="jane avatar"
    />
    <span className="font-semibold">KUMA</span>
  </a>
  
  <svg
    className="w-6 h-6 mx-1 ml-auto"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 15.713L18.01 9.70299L16.597 8.28799L12 12.888L7.40399 8.28799L5.98999 9.70199L12 15.713Z"
      fill="currentColor"
    ></path>
  </svg>
</button>




        {/* Dropdown menu */}
        {isOpen && (
          <div
            className="absolute right-0 z-20 w-56 py-2 mt-2 overflow-hidden bg-white rounded-md shadow-xl dark:bg-white"
            style={{ top: "100%" }}
          >
            <a
              href="#"
              className="flex items-center p-3 -mt-2 text-sm text-gray-600 transition-colors duration-200 transform dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-white"
            >
              <img
                className="flex-shrink-0 object-contain bg-orange-100 mx-1 rounded-full w-9 h-9"
                src={logo}
                alt="jane avatar"
              />
              <div className="mx-1">
                <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-700">
                  KUMA USER
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  kuma@exampl.com
                </p>
              </div>
            </a>

            <hr className="border-gray-200 dark:border-gray-400 " />

            <a
  href="#"
  className="block px-4 py-3 text-sm text-gray-700 capitalize transition-colors duration-200 transform dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-700"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    className="w-6 h-6 inline mr-2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
  Mi cuenta
</a>


<a
  href="#"
  className="block px-4 py-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-700"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    className="w-6 h-6 inline mr-2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
    />
  </svg>
  Actualiza tu plan
</a>


<a
  href="#"
  className="block px-4 py-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-700"
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 inline mr-2 size-6 ">
    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
  </svg>
  Soporte
</a>


            <hr className="border-gray-200 dark:border-gray-400 " />

            <a
  href="#"
  className="block px-4 py-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-700"
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className=" w-6 h-6 size-6 inline mr-2 ">
    <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
  </svg>
  Dominios
</a>


<a
  href="#"
  className="block px-4 py-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-700"
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className=" w-6 h-6 mr-2 size-6 inline ">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
  Descarga App de escritorio
</a>


            <a
              href="#"
              className="block px-4 py-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class=" w-6 h-6 mr-2 size-6 inline">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
</svg>

              Planes activos
            </a>

            <hr className="border-gray-200 dark:border-gray-400 " />

            <a
              href="#"
              className="block px-4 py-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2 size-6 inline">
  <path stroke-linecap="round" stroke-linejoin="round" d="m9 14.25 6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
</svg>

              Facturas
            </a>
            <a
              href="#"
              className="block px-4 py-3 text-sm text-gray-600 capitalize transition-colors duration-200 transform dark:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
  <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"></path>
  <path d="M9 12h12l-3 -3"></path>
  <path d="M18 15l3 -3"></path>
</svg>
              Sign Out
            </a>
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0 bg-transparent"
          onClick={closeDropdown}
          aria-hidden="true"
        />
      )}
    </div>
  );
}


