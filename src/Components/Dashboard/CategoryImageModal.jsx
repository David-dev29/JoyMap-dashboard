import React, { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";

const CategoryImageModal = ({ category, isOpen, onClose, onSave }) => {
  const [categoryName, setCategoryName] = useState("");
  const [iconImage, setIconImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);

  const iconInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // 🔹 Cargar datos de la categoría en el modal
  useEffect(() => {
    if (category) {
      setCategoryName(category.name || "");
      
      // Cargar icono existente
      setIconImage(
        category.iconUrl?.startsWith("http")
          ? category.iconUrl
          : category.iconUrl
          ? `https://${category.iconUrl}`
          : null
      );

      // Cargar banner existente
      setBannerImage(
        category.bannerUrl?.startsWith("http")
          ? category.bannerUrl
          : category.bannerUrl
          ? `https://${category.bannerUrl}`
          : null
      );

      // Limpiar inputs de archivos
      if (iconInputRef.current) {
        iconInputRef.current.value = "";
      }
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
    }
  }, [category]);

  // 🔹 Guardar categoría con imágenes
  const handleSave = () => {
    const formData = new FormData();
    formData.append("name", categoryName);
    
    // Agregar icono si se seleccionó uno nuevo
    if (iconInputRef.current?.files[0]) {
      formData.append("icon", iconInputRef.current.files[0]);
    }
    
    // Agregar banner si se seleccionó uno nuevo
    if (bannerInputRef.current?.files[0]) {
      formData.append("banner", bannerInputRef.current.files[0]);
    }

    // Incluir ID de categoría para actualizaciones
    if (category?._id) {
      formData.append("categoryId", category._id);
    }

    onSave(formData);
  };

  // 🔹 Manejar cambio de icono
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar tamaño del archivo (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`El archivo es demasiado grande. Máximo permitido: 10MB. Tu archivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      e.target.value = ''; // Limpiar el input
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setIconImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Manejar cambio de banner
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar tamaño del archivo (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`El archivo es demasiado grande. Máximo permitido: 10MB. Tu archivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      e.target.value = ''; // Limpiar el input
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

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
        className={`fixed top-12 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-xl transition-transform duration-500 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {category ? "Editar categoría" : "Nueva categoría"}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Nombre de categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Nombre de la categoría
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Bebidas, Comida, Postres..."
            />
          </div>

          {/* Icono de categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">
              Icono de categoría
            </label>
            <div
              className="relative bg-blue-600 rounded-lg text-white w-20 h-20 flex items-center justify-center cursor-pointer overflow-hidden mx-auto"
              onClick={() => iconInputRef.current.click()}
            >
              {iconImage ? (
                <>
                  <img
                    src={iconImage}
                    alt="icono preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div
                    className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      iconInputRef.current.click();
                    }}
                  >
                    <Upload className="w-3 h-3 text-gray-600" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-1">
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-medium text-center">Subir icono</span>
                </div>
              )}
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleIconChange}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Recomendado: 80x80px, formato PNG o JPG
            </p>
          </div>

          {/* Banner de categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">
              Banner de categoría
            </label>
            <div
              className="relative bg-gray-200 rounded-lg w-full h-32 flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={() => bannerInputRef.current.click()}
            >
              {bannerImage ? (
                <>
                  <img
                    src={bannerImage}
                    alt="banner preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div
                    className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      bannerInputRef.current.click();
                    }}
                  >
                    <Upload className="w-4 h-4 text-gray-600" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-gray-500">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-medium">Subir banner</span>
                  <span className="text-xs text-center px-4">
                    Imagen horizontal para mostrar en la parte superior de la categoría
                  </span>
                </div>
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Recomendado: 400x150px, formato PNG o JPG
            </p>
          </div>

          {/* Vista previa de imágenes seleccionadas */}
          {(iconImage || bannerImage) && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Vista previa:</h4>
              <div className="flex items-center space-x-4">
                {iconImage && (
                  <div className="text-center">
                    <img
                      src={iconImage}
                      alt="Icono"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">Icono</p>
                  </div>
                )}
                {bannerImage && (
                  <div className="text-center flex-1">
                    <img
                      src={bannerImage}
                      alt="Banner"
                      className="w-full h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">Banner</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CategoryImageModal;