import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Plus, Info } from "lucide-react";
import { ENDPOINTS } from "../../config/api";

const ProductEditModal = ({ product, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("Simple");
  const [stockControl, setStockControl] = useState(false);
  const [availability, setAvailability] = useState("Disponible");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [kitchen, setKitchen] = useState("");
  const [kitchens, setKitchens] = useState([]);
  const [image, setImage] = useState(null);
  const [subcategory, setSubcategory] = useState("");
  const [subcategoryId, setSubcategoryId] = useState(""); // 🆕
  const [category, setCategory] = useState("");
  const [subcategoriesOptions, setSubcategoriesOptions] = useState([]); // 🆕

  const fileInputRef = useRef(null);
  const availabilityOptions = ["Disponible", "No disponible", "Agotado"];

  // 🆕 Cargar subcategorías desde API
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await fetch(ENDPOINTS.subcategories.base);
        const result = await response.json();
        
        setSubcategoriesOptions(result.data || []);
      } catch (error) {
        // Error loading subcategories
      }
    };

    fetchSubcategories();
  }, []);

  // Cargar cocinas desde la API
  useEffect(() => {
    const fetchKitchens = async () => {
      try {
        const res = await fetch(ENDPOINTS.kitchens.base);
        const data = await res.json();
        setKitchens(data);
      } catch (error) {
        // Error loading kitchens
      }
    };

    fetchKitchens();
  }, []);

  // Cargar producto en el modal
  useEffect(() => {
    if (product) {
      setProductName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price != null ? product.price.toString() : "");
      setKitchen(product.kitchen?._id || "");
      setAvailability(product.availability || "Disponible");
      setStockControl(product.stockControl || false);
      setSubcategory(product.subcategory || "");
      setSubcategoryId(product.subcategoryId || ""); // 🆕
      setCategory(product.category || "");
      setImage(
        product.image?.startsWith("http")
          ? product.image
          : product.image
          ? `https://${product.image}`
          : null
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [product]);

  // 🆕 Obtener subcategorías de la categoría actual
  const getCurrentSubcategories = () => {
    if (!category || !subcategoriesOptions.length) {
      return [];
    }
    
    const normalizeStr = (str) =>
      str?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "-") || ""; // 🔥 Agregamos reemplazo de espacios
    
    const normalizedCategory = normalizeStr(category);

    const categoryData = subcategoriesOptions.find(
      cat => normalizeStr(cat.categoryName) === normalizedCategory
    );
    
    return categoryData?.subcategories || [];
  };

  // 🆕 Manejar cambio de subcategoría
  const handleSubcategoryChange = (e) => {
    const selectedId = e.target.value;
    setSubcategoryId(selectedId);
    
    // Encontrar el nombre de la subcategoría
    const subcats = getCurrentSubcategories();
    const selected = subcats.find(s => s._id === selectedId);
    if (selected) {
      setSubcategory(selected.name);
    }
  };

  // Guardar producto
  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", productName);
    formData.append("description", description);
    formData.append("price", price ? Number(price) : 0);
    formData.append("availability", availability);
    formData.append("stockControl", stockControl);
    formData.append("categoryId", product.categoryId);
    formData.append("subcategory", subcategory);
    formData.append("subcategoryId", subcategoryId); // 🆕 Guardar el ID

    // Cocina seleccionada
    if (kitchen) {
      formData.append("kitchenId", kitchen);

      const selectedKitchen = kitchens.find((k) => k._id === kitchen);
      if (selectedKitchen) {
        formData.append("kitchen", selectedKitchen.name);
      }
    }

    if (fileInputRef.current?.files[0]) {
      formData.append("image", fileInputRef.current.files[0]);
    }

    onSave(formData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const currentSubcategories = getCurrentSubcategories();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside
        className={`fixed top-12 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-xl transition-transform duration-500 ease-in-out transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Editar producto</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Imagen y Nombre/Descripción */}
          <div className="flex items-start space-x-4">
            <div
              className="relative bg-blue-600 rounded-lg text-white flex-shrink-0 w-24 h-24 flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={() => fileInputRef.current.click()}
            >
              {image ? (
                <>
                  <img
                    src={image}
                    alt="preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div
                    className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current.click();
                    }}
                  >
                    <Upload className="w-4 h-4 text-gray-600" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm font-medium">Subir fotos</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="flex-1 space-y-2">
              <label className="block text-sm text-gray-600">Nombre</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <label className="block text-sm text-gray-600 mt-2">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Precio y Opciones */}
          <div className="bg-gray-50 p-4 rounded-md space-y-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("Simple")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "Simple" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setActiveTab("Variantes")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "Variantes" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                Variantes
              </button>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Precio</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">MXN $</span>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="appearance-none bg-green-100 text-green-800 px-3 py-1 pr-8 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <button className="flex items-center space-x-1 bg-white border border-gray-300 px-3 py-1 rounded-md text-sm hover:bg-gray-50">
                <Plus className="w-4 h-4" />
                <span>Descuento</span>
              </button>
              <button className="flex items-center space-x-1 bg-white border border-gray-300 px-3 py-1 rounded-md text-sm hover:bg-gray-50">
                <Plus className="w-4 h-4" />
                <span>Costo</span>
              </button>
              <button className="flex items-center space-x-1 bg-white border border-gray-300 px-3 py-1 rounded-md text-sm hover:bg-gray-50">
                <Plus className="w-4 h-4" />
                <span>Embalaje</span>
              </button>
              <button className="flex items-center space-x-1 bg-white border border-gray-300 px-3 py-1 rounded-md text-sm hover:bg-gray-50">
                <Plus className="w-4 h-4" />
                <span>SKU</span>
              </button>
            </div>
          </div>

          {/* Subcategoría */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Subcategoría</label>
            {currentSubcategories.length > 0 ? (
              <select
                value={subcategoryId}
                onChange={handleSubcategoryChange}
                className="w-full appearance-none bg-white border border-gray-300 px-3 py-2 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecciona una subcategoría</option>
                {currentSubcategories.map((subcat) => (
                  <option key={subcat._id} value={subcat._id}>
                    {subcat.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ No hay subcategorías disponibles para esta categoría
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Categoría actual: {category || 'No definida'}
            </p>
            {subcategoryId && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Subcategoría seleccionada: {subcategory}
              </p>
            )}
          </div>

          {/* Control de stock */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-gray-900">Control de Stock</h3>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <button
              onClick={() => setStockControl(!stockControl)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                stockControl ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  stockControl ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Cocina */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Cocina</label>
            <select
              value={kitchen}
              onChange={(e) => setKitchen(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 px-3 py-2 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona una cocina</option>
              {kitchens.map((k) => (
                <option key={k._id} value={k._id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Guardar */}
          <div className="pt-4 pb-6">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ProductEditModal;