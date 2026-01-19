import React, { useState, useMemo, useEffect } from "react";
import ProductEditModal from "./ProductEditModal"; // Ajusta la ruta si es distinta

// 👉 Normaliza texto (quita acentos y pasa a minúsculas)
const normalizeText = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const SearchModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // 👉 Traer productos desde tu backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/products");
        const data = await res.json();
        console.log("📦 data:", data);
        setProducts(data.response || []);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProducts();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setSearchTerm(""); // limpia búsqueda al cerrar
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  

  // 👉 Filtrado de productos
  // 👉 Filtrado de productos
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return []; // 👈 ya no devuelve todos al inicio
    const normalizedSearch = normalizeText(searchTerm);
    return products.filter((p) =>
      normalizeText(p.name).includes(normalizedSearch)
    );
  }, [products, searchTerm]);

  return (
    <div className="flex justify-center items-center">
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-30 transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 top-12 z-30 w-96 max-w-full bg-white shadow-xl transform transition-transform duration-500 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col py-6">
          {/* Header */}
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-semibold text-black">
              Buscar productos
            </h2>
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
          </div>

          {/* Input */}
          <div className="mt-4 px-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Nombre del producto"
              className="w-full p-2 border border-gray-300 rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300"
            />
          </div>

          {/* Results */}
          <div className="mt-4 px-4">
            {searchTerm.trim() && (
              <p className="ml-2 text-gray-400">
                {filteredProducts.length} resultados
              </p>
            )}
          </div>

          <div className="mt-2 px-2 h-full overflow-auto">
            {searchTerm.trim() ? (
              filteredProducts.length > 0 ? (
                <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => handleProductClick(product)}
                        className={`flex items-center p-4 hover:bg-gray-50 transition-colors duration-150 ${
                          product.availability === "No disponible"
                            ? "opacity-50"
                            : ""
                        }`}
                      >
                        {/* Imagen del producto */}
                        <div className="w-12 h-12 mr-3 flex-shrink-0">
                          {product.image ? (
                            <img
                            src={
                              product.image
                                ? product.image.startsWith("http")
                                  ? product.image
                                  : `https://${product.image}` // agrega https si no existe
                                : undefined
                            }
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                              {/* 🍔 SVG de comida como placeholder */}
                              <svg
                                class="w-6 h-6 text-gray-800 dark:text-gray-300"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="m4 12 2.66667-1 2.66666 1L12 11l2.6667 1 2.6666-1L20 12m-1 5H5v1c0 1.1046.89543 2 2 2h10c1.1046 0 2-.8954 2-2v-1ZM5 9.00003h14v-1c0-2.20914-1.7909-4-4-4H9c-2.20914 0-4 1.79086-4 4v1ZM18.5 14h-13c-.82843 0-1.5.6716-1.5 1.5 0 .8285.67157 1.5 1.5 1.5h13c.8284 0 1.5-.6715 1.5-1.5 0-.8284-.6716-1.5-1.5-1.5Z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3
                              className={`text-sm font-semibold truncate ${
                                product.availability === "No disponible"
                                  ? "text-gray-500"
                                  : "text-gray-800"
                              }`}
                            >
                              {product.name}
                            </h3>
                            {product.badge && (
                              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Precio */}
                        <div className="flex-shrink-0 ml-4">
                          <span
                            className={`text-sm font-semibold ${
                              product.availability === "No disponible"
                                ? "text-gray-400"
                                : "text-gray-900"
                            }`}
                          >
                            MXN ${product.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center mt-6">
                  No se encontraron resultados
                </div>
              )
            ) : (
              <div className="text-gray-400 text-center mt-6">
                Escribe para buscar un producto...
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Botón Abrir */}
      <button
        type="button"
        className="p-2.5 text-sm font-medium text-black bg-white rounded-lg border border-blue-200 hover:bg-gray-200"
        onClick={toggleSidebar}
      >
        🔍
      </button>

      {isEditModalOpen && selectedProduct && (
  <ProductEditModal
    product={selectedProduct}
    isOpen={isEditModalOpen}
    onClose={() => setIsEditModalOpen(false)}
    onSave={(updatedProduct) => {
      // Actualiza la lista de productos si quieres que refleje cambios
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
      setIsEditModalOpen(false);
    }}
  />
)}

    </div>

    
  );
};

export default SearchModal;
