import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Dropdown from '../../Components/Dashboard/ConfigButton'
import Modal from '../../Components/Dashboard/MobileModal'
import SearchModal from '../../Components/Dashboard/SearchModal'
import { ENDPOINTS, SOCKET_URL } from "../../config/api";

const socket = io(SOCKET_URL);

const Profile = ({ store, onUpdate }) => {
  const [businessName, setBusinessName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [textLogoFile, setTextLogoFile] = useState(null); // ✨ NUEVO
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [textLogoPreview, setTextLogoPreview] = useState(""); // ✨ NUEVO

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const textLogoInputRef = useRef(null); // ✨ NUEVO
  const maxChars = 45;

  useEffect(() => {
    if (store) {
      setBusinessName(store.businessName || "");
      setLogoPreview(store.logoUrl || "");
      setBannerPreview(store.bannerUrl || "");
      setTextLogoPreview(store.textLogoUrl || ""); // ✨ NUEVO
    }
  }, [store]);

  // Escuchar cambios de la tienda en tiempo real
  useEffect(() => {
    socket.on("storeUpdated", (updatedStore) => {
      if (updatedStore._id === store._id) {
        onUpdate(updatedStore);
        setBusinessName(updatedStore.businessName || "");
        setLogoPreview(updatedStore.logoUrl || "");
        setBannerPreview(updatedStore.bannerUrl || "");
        setTextLogoPreview(updatedStore.textLogoUrl || ""); // ✨ NUEVO
      }
    });

    return () => {
      socket.off("storeUpdated");
    };
  }, [store, onUpdate]);

  const handleFileUpload = async (file, type) => {
    if (!file || !store?._id) return;
  
    const formData = new FormData();
    formData.append(type, file);
    formData.append("businessName", businessName);
  
    try {
      const response = await fetch(ENDPOINTS.stores.byId(store._id), {
        method: "PUT",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        onUpdate(data.response);
      }
    } catch (error) {
      // Error uploading file
    }
  };
  
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (type === "logo") setLogoFile(file);
    if (type === "banner") setBannerFile(file);
    if (type === "textLogo") setTextLogoFile(file); // ✨ NUEVO
  
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "logo") setLogoPreview(reader.result);
      if (type === "banner") setBannerPreview(reader.result);
      if (type === "textLogo") setTextLogoPreview(reader.result); // ✨ NUEVO
    };
    reader.readAsDataURL(file);
  
    handleFileUpload(file, type);
  };
  
  // Guardar nombre automáticamente con debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!store?._id) return;
  
      const formData = new FormData();
      formData.append("businessName", businessName);
  
      try {
        const response = await fetch(ENDPOINTS.stores.byId(store._id), {
          method: "PUT",
          body: formData,
        });
        const data = await response.json();
        if (response.ok) {
          onUpdate(data.response);
        }
      } catch (err) {
        // Error updating name
      }
    }, 1000);
  
    return () => clearTimeout(timer);
  }, [businessName]);

  return (
    <div className="bg-white flex flex-col">
      {/* Banner */}
      <div className="relative h-40 flex-shrink-0 overflow-hidden group bg-gray-200">
        <img src={bannerPreview} alt="Store banner" className="w-full h-full object-cover" />
        <button
          onClick={() => bannerInputRef.current.click()}
          className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Cambiar banner
        </button>
        <input
          type="file"
          ref={bannerInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileChange(e, "banner")}
        />
        <div className="absolute top-4 left-4 bg-black/75 text-white px-3 py-1.5 rounded-lg flex items-center space-x-2">
          <span>https://kuma-delivery</span>
          <button className="text-green-400 text-sm hover:text-green-300">
            📋 Obtén tu dominio propio
          </button>
        </div>
        <div className="absolute flex gap-2 top-4 right-4">
          <Modal />
          <Dropdown />
        </div>
      </div>

      {/* Store Info */}
      <div className="flex-shrink-0 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3 w-full">
          <div className="relative group -mt-8 flex-shrink-0">
            <img
              src={logoPreview}
              alt="Store logo"
              className="w-28 h-28 rounded-2xl object-cover shadow-md border-4 border-white bg-gray-200"
            />
            <button
              onClick={() => logoInputRef.current.click()}
              className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
            >
              Editar
            </button>
            <input
              type="file"
              ref={logoInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "logo")}
            />
          </div>

          <div className="flex flex-col flex-grow pt-2 gap-3">
            {/* Nombre del negocio */}
            <div>
              <label className="text-gray-600 text-sm">Nombre del negocio</label>
              <div className="relative w-full">
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) =>
                    e.target.value.length <= maxChars && setBusinessName(e.target.value)
                  }
                  className="w-full border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent text-lg pr-12 pb-1"
                />
                <span className="absolute bottom-1 right-0 text-xs text-gray-500">
                  {businessName.length}/{maxChars}
                </span>
              </div>
            </div>

            {/* ✨ NUEVO: Logo Tipográfico */}
            <div>
              <label className="text-gray-600 text-sm">Logo tipográfico (para header)</label>
              <div className="flex items-center gap-2 mt-1">
                {textLogoPreview ? (
                  <div className="relative group">
                    <img 
                      src={textLogoPreview} 
                      alt="Text Logo" 
                      className="h-8 max-w-[200px] object-contain border border-gray-200 rounded px-2 py-1 bg-white"
                    />
                    <button
                      onClick={() => textLogoInputRef.current.click()}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity rounded"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => textLogoInputRef.current.click()}
                    className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    📝 Subir logo tipográfico
                  </button>
                )}
                <input
                  type="file"
                  ref={textLogoInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "textLogo")}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Recomendado: PNG transparente, 200x50px aprox.
              </p>
            </div>
          </div>

          <SearchModal products={store?.products || []} />
        </div>
      </div>
    </div>
  );
};

export default Profile;