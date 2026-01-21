import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, GripVertical, ToggleLeft, ToggleRight } from "lucide-react";
import { io } from "socket.io-client";
import ProductEditModal from "./ProductEditModal";
import CategoryImageModal from "./CategoryImageModal";
import { ENDPOINTS, SOCKET_URL, authFetch } from "../../config/api";

const ExpandableCard = ({
  category,
  updateCategoryName,
  onDeleteCategory,
  onDuplicateCategory,
  businessId,
  searchTerm = "",
  availabilityFilter = "all",
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); // 🔹 Estado para el modal de categoría
  const [isExpanded, setIsExpanded] = useState(false);
  const [products, setProducts] = useState(category.products || []);
  const [categoryName, setCategoryName] = useState(category.name || "");
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [dropdownView, setDropdownView] = useState({});
  const [dropdownCoords, setDropdownCoords] = useState({});
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("productUpdated", (updatedProduct) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const maxChars = 30;
  const charCount = categoryName.length;

  // Filtrar productos segun busqueda y disponibilidad
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filtro por nombre
      const matchesSearch = !searchTerm ||
        product.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por disponibilidad
      const isAvailable = product.availability === "Disponible";
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && isAvailable) ||
        (availabilityFilter === "unavailable" && !isAvailable);

      return matchesSearch && matchesAvailability;
    });
  }, [products, searchTerm, availabilityFilter]);

  // Toggle de disponibilidad rapido
  const handleToggleAvailability = async (e, product) => {
    e.stopPropagation();
    const newAvailability = product.availability === "Disponible" ? "No disponible" : "Disponible";

    try {
      const res = await authFetch(ENDPOINTS.products.byId(product._id), {
        method: "PUT",
        body: JSON.stringify({ availability: newAvailability }),
      });

      if (res.ok) {
        const updatedProduct = await res.json();
        setProducts(prev =>
          prev.map(p => p._id === product._id ? { ...p, availability: newAvailability } : p)
        );
      }
    } catch (error) {
      // Error toggling availability
    }
  };

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleAddProductClick = () => {
    setSelectedProduct({
      _id: null, // indica que es nuevo
      name: "",
      description: "",
      price: 0,
      kitchen: "Encontro matriz",
      availability: "Disponible",
      stockControl: false,
      categoryId: category.id,
      businessId: businessId, // Incluir businessId para nuevos productos
      image: null,
    });
    setIsModalOpen(true);
  };

  const handleCategoryChange = (e) => {
    const raw = e.target.value;
    if (raw.length <= maxChars) {
      setCategoryName(raw);
      updateCategoryName(category.id, raw);
    }
  };

  // 🔹 Función para abrir el modal de categoría
  const handleCategoryClick = (e) => {
    // Evitar que se abra cuando se está editando el nombre
    if (e.target.tagName === 'INPUT') return;
    
    setIsCategoryModalOpen(true);
  };

  // 🔹 Función para guardar cambios de categoría
  const handleCategorySave = async (formData) => {
    try {
      const response = await fetch(ENDPOINTS.categories.byId(category.id), {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        setIsCategoryModalOpen(false);
      } else {
        const errorData = await response.json();
        if (errorData.message) {
          alert(`Error: ${errorData.message}`);
        } else {
          alert("Error al actualizar la categoría");
        }
      }
    } catch (error) {
      if (error.message && error.message.includes('File too large')) {
        alert("Error: Una o más imágenes son demasiado grandes. Máximo permitido: 10MB");
      } else {
        alert("Error de conexión. Verifica tu conexión a internet.");
      }
    }
  };

  const handleDeleteProduct = async (_id) => {
    try {
      const res = await fetch(ENDPOINTS.products.byId(_id), {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== _id));
        setDropdownOpen((prev) => ({ ...prev, [_id]: false }));
      }
    } catch (error) {
      // Error deleting product
    }
  };

  const handleDuplicateProduct = (product) => {
    const newProduct = { ...product, _id: Date.now().toString() }; // temporal para React
    setProducts((prev) => [...prev, newProduct]);
    setDropdownOpen((prev) => ({ ...prev, [product._id]: false }));
  };

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [isExpanded, products, filteredProducts]);

  useEffect(() => {
    document.body.style.overflow = (isModalOpen || isCategoryModalOpen) ? "hidden" : "";
  }, [isModalOpen, isCategoryModalOpen]);

  const openDropdown = (productId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownCoords((prev) => ({
      ...prev,
      [productId]: {
        top: rect.bottom + window.scrollY,
        left: rect.right - 192,
      },
    }));
    setDropdownOpen((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const handleCardClick = (e, product) => {
    setDropdownOpen({});
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-full mx-auto border rounded-lg shadow-sm relative">
      {/* Card principal */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 transition-shadow hover:shadow-md">
        <div className="flex items-center space-x-2">
          {/* Botón con el ícono Grip */}
          <button
            type="button"
            className="p-1 text-gray-400 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded-md transition-colors"
            onClick={handleCategoryClick}
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Sección de categoría */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">
              Nombre de la categoría
            </span>
            <div className="relative inline-block w-[160px] border-b border-gray-500 mt-1">
              <input
                type="text"
                value={categoryName}
                onChange={handleCategoryChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full text-sm bg-transparent outline-none pr-10"
                placeholder="Escribe el nombre"
              />
              {isFocused && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gray-400 select-none">
                  {charCount}/{maxChars}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botón + Producto con indicador */}
        <div className="flex items-center space-x- ml-3 gap-2">
          {/* Indicador de cantidad de productos */}
          <div className="min-w-6 h-6 px-2 bg-white text-gray-500 text-xs font-semibold flex items-center justify-center rounded-full shadow-md">
            {filteredProducts.length !== products.length
              ? `${filteredProducts.length}/${products.length}`
              : products.length}
          </div>

          {/* Botón agregar producto */}
          <button
            onClick={handleAddProductClick}
            className="text-blue-600 font-semibold px-3 py-1 rounded-lg border border-blue-600 hover:bg-blue-50 flex items-center"
          >
            + Producto
          </button>

          {/* Tres puntitos para dropdown de categoría */}
          <div className="relative">
            <button
              className="flex flex-col justify-center space-y-0.5 p-1 hover:bg-gray-100 rounded-full"
              onClick={() => setCategoryDropdownOpen((prev) => !prev)}
            >
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1 h-1 bg-gray-500 rounded-full" />
              ))}
            </button>

            {categoryDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-lg z-50">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setCategoryDropdownOpen(false);
                    onDuplicateCategory(category.id);
                  }}
                >
                  Duplicar categoría
                </button>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setCategoryDropdownOpen(false);
                    onDeleteCategory(category.id);
                  }}
                >
                  Eliminar categoría
                </button>
              </div>
            )}
          </div>

          {/* Flecha desplegable */}
          <button
            onClick={toggleExpand}
            className={`p-2 text-blue-600 bg-white rounded-full shadow-md hover:bg-blue-50 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      {/* Contenido desplegable */}
      <div
        ref={contentRef}
        style={{ maxHeight: height }}
        className="overflow-hidden transition-all duration-300"
      >
        {filteredProducts.length === 0 && products.length > 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No hay productos que coincidan con los filtros
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className={`flex items-center justify-between p-4 bg-white border-t relative cursor-pointer hover:bg-gray-50 ${
                product.availability !== "Disponible" ? "opacity-60" : ""
              }`}
              onClick={(e) => handleCardClick(e, product)}
            >
              <div className="flex items-center space-x-3">
                {product.image ? (
                  <img
                    src={
                      product.image.startsWith("http")
                        ? product.image
                        : `https://${product.image}${product._t ? `?t=${product._t}` : ""}`
                    }
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg">
                    {/* 🍔 SVG de comida como placeholder */}
                    <svg
                      className="w-6 h-6 text-gray-800 dark:text-gray-300"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m4 12 2.66667-1 2.66666 1L12 11l2.6667 1 2.6666-1L20 12m-1 5H5v1c0 1.1046.89543 2 2 2h10c1.1046 0 2-.8954 2-2v-1ZM5 9.00003h14v-1c0-2.20914-1.7909-4-4-4H9c-2.20914 0-4 1.79086-4 4v1ZM18.5 14h-13c-.82843 0-1.5.6716-1.5 1.5 0 .8285.67157 1.5 1.5 1.5h13c.8284 0 1.5-.6715 1.5-1.5 0-.8284-.6716-1.5-1.5-1.5Z"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-medium truncate">{product.name}</span>
                  {/* Indicador de disponibilidad */}
                  <span className={`text-xs ${
                    product.availability === "Disponible"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}>
                    {product.availability}
                  </span>
                </div>
              </div>

              <div
                className="flex items-center space-x-3"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Toggle de disponibilidad */}
                <button
                  onClick={(e) => handleToggleAvailability(e, product)}
                  className={`p-1 rounded-md transition-colors ${
                    product.availability === "Disponible"
                      ? "text-green-500 hover:bg-green-50"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                  title={product.availability === "Disponible" ? "Marcar como no disponible" : "Marcar como disponible"}
                >
                  {product.availability === "Disponible" ? (
                    <ToggleRight size={24} />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                </button>

                <span className="text-gray-900 font-medium">
                  MXN {product.price?.toFixed(2) || "0.00"}
                </span>

              <div className="relative">
                <button
                  className="flex flex-col justify-center space-y-0.5 p-1 hover:bg-gray-100 rounded-full"
                  onClick={(e) => openDropdown(product._id, e)}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 bg-gray-500 rounded-full"
                    />
                  ))}
                </button>

                {dropdownOpen[product._id] && dropdownCoords[product._id] && (
                  <div
                    className="fixed w-48 bg-white border rounded shadow-lg z-50"
                    style={{
                      top: dropdownCoords[product._id].top,
                      left: dropdownCoords[product._id].left,
                    }}
                  >
                    {dropdownView[product._id] === "main" ||
                    !dropdownView[product._id] ? (
                      <div className="flex flex-col">
                        <button
                          className="flex items-center px-3 py-2 hover:bg-gray-100"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Eliminar
                        </button>
                        <button
                          className="flex items-center px-3 py-2 hover:bg-gray-100"
                          onClick={() =>
                            setDropdownView((prev) => ({
                              ...prev,
                              [product._id]: "duplicate",
                            }))
                          }
                        >
                          Duplicar
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="flex items-center px-3 py-2 border-b">
                          <button
                            className="mr-2"
                            onClick={() =>
                              setDropdownView((prev) => ({
                                ...prev,
                                [product._id]: "main",
                              }))
                            }
                          >
                            ←
                          </button>
                          <span>Duplicar en "{categoryName}"</span>
                        </div>
                        <button
                          className="px-3 py-2 hover:bg-gray-100"
                          onClick={() => handleDuplicateProduct(product)}
                        >
                          {categoryName}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Modal de productos */}
      {isModalOpen && selectedProduct && (
        <ProductEditModal
          product={selectedProduct}
          businessId={businessId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={async (formData) => {
            try {
              let savedProduct;
              if (selectedProduct._id) {
                const response = await fetch(
                  ENDPOINTS.products.byId(selectedProduct._id),
                  {
                    method: "PUT",
                    body: formData,
                  }
                );
                savedProduct = await response.json();

                setProducts((prev) =>
                  prev.map((p) =>
                    p._id === savedProduct._id ? savedProduct : p
                  )
                );

                setSelectedProduct(savedProduct);
              } else {
                const response = await fetch(
                  ENDPOINTS.products.create,
                  {
                    method: "POST",
                    body: formData,
                  }
                );
                savedProduct = await response.json();

                if (!response.ok) {
                  return;
                }

                setProducts((prev) => [...prev, savedProduct]);
                setSelectedProduct(savedProduct);
                setIsExpanded(true);
              }

              setIsModalOpen(false);
            } catch (error) {
              // Error saving product
            }
          }}
        />
      )}

      {/* 🔹 Modal de categoría */}
      {isCategoryModalOpen && (
        <CategoryImageModal
          category={{
            _id: category.id,
            name: categoryName,
            iconUrl: category.iconUrl,     // 🔹 Usar iconUrl
            bannerUrl: category.bannerUrl, // 🔹 Usar bannerUrl
          }}
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleCategorySave}
        />
      )}
    </div>
  );
};

export default ExpandableCard;