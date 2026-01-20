import React, { useState, useEffect } from "react";
import io from "socket.io-client";

import ProfilePage from "../Pages/Menu/Profile";
import ExpandableCard from "../Components/Dashboard/ExplanableCard";
import CategoryButton from "../Components/Dashboard/CategoryButton";
import Pagination from "../Components/Dashboard/Pagination";
import NoBusinessSelected from "../Components/Dashboard/NoBusinessSelected";
import { ENDPOINTS, SOCKET_URL, authFetch } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import {
  getMyCategories,
  getBusinessCategories,
  createCategory,
} from "../services/api";

const socket = io(SOCKET_URL);

const Panel = () => {
  const { user } = useAuth();
  const { selectedBusiness, loading: businessLoading } = useBusiness();
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determinar si es admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(ENDPOINTS.stores.base);
        const data = await res.json();
        if (data.success && data.store_data) setStore(data.store_data);
      } catch (err) {
        // Error fetching store
      }
    };
    fetchStore();
  }, []);

  // Cargar categorias segun negocio seleccionado
  useEffect(() => {
    const fetchCategories = async () => {
      // Si es admin y no hay negocio seleccionado, no cargar
      if (isAdmin && !selectedBusiness) {
        setCategories([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let data;

        if (isAdmin && selectedBusiness) {
          // Admin: cargar datos del negocio seleccionado
          data = await getBusinessCategories(selectedBusiness._id, 'products');
        } else {
          // Business owner: cargar sus datos
          data = await getMyCategories('products');
        }

        const categoriesList = data.response || data.categories || [];
        setCategories(categoriesList);
        if (categoriesList.length > 0) {
          setSelectedCategoryId(categoriesList[0]._id);
        } else {
          setSelectedCategoryId(null);
        }
      } catch (error) {
        // Error loading categories
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    if (!businessLoading) {
      fetchCategories();
    }
  }, [user, selectedBusiness, isAdmin, businessLoading]);
  

  // 🔹 Conectar sockets en tiempo real
  useEffect(() => {
    socket.on("category:created", (newCategory) => {
      setCategories((prev) => [...prev, newCategory]);
    });

    socket.on("category:updated", (updatedCategory) => {
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === updatedCategory._id ? updatedCategory : cat
        )
      );
    });

    socket.on("category:deleted", ({ id }) => {
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    });

    return () => {
      socket.off("category:created");
      socket.off("category:updated");
      socket.off("category:deleted");
    };
  }, []);

 
  // Crear categoria con el negocio seleccionado
  const addCategory = async () => {
    if (!selectedBusiness?._id) return;

    try {
      await createCategory({
        name: `Categoria ${categories.length + 1}`,
        businessId: selectedBusiness._id,
      });
    } catch (error) {
      // Error creating category
    }
  };
  


  // 🔹 Actualizar nombre
  const updateCategoryName = async (id, newName) => {
    try {
      await fetch(ENDPOINTS.categories.byId(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
    } catch (error) {
      // Error updating category
    }
  };

  // 🔹 Eliminar categoría
  const handleDeleteCategory = async (id) => {
    try {
      await fetch(ENDPOINTS.categories.byId(id), { method: "DELETE" });
    } catch (error) {
      // Error deleting category
    }
  };

  // Duplicar categoria
  const handleDuplicateCategory = async (id) => {
    const category = categories.find((cat) => cat._id === id);
    if (!category || !selectedBusiness?._id) return;

    try {
      await createCategory({
        name: category.name + " (Copia)",
        businessId: selectedBusiness._id,
      });
    } catch (error) {
      // Error duplicating category
    }
  };

  // Mostrar mensaje si admin no ha seleccionado negocio
  if (isAdmin && !selectedBusiness && !businessLoading) {
    return (
      <div className="p-4">
        <NoBusinessSelected
          title="Selecciona un negocio"
          message="Para ver y gestionar el menu de productos, primero selecciona un negocio desde el selector en la barra superior."
        />
      </div>
    );
  }

  // Mostrar loading mientras se cargan los datos
  if (loading || businessLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-500">Cargando datos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ProfilePage store={store} onUpdate={setStore} />

      {/* Header con nombre del negocio */}
      {selectedBusiness && (
        <div className="px-4 pt-4">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
            <h2 className="text-lg font-bold">{selectedBusiness.name}</h2>
            <p className="text-orange-100 text-sm">
              {categories.length} categorias - {categories.reduce((acc, cat) => acc + (cat.products?.length || 0), 0)} productos
            </p>
          </div>
        </div>
      )}

      <div className="p-4 flex items-center gap-4">
        <CategoryButton
          onAddCategory={addCategory}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        <Pagination
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      </div>

      <div className="p-4 space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No hay categorias en este negocio.</p>
            <p className="text-sm mt-2">Crea una nueva categoria para comenzar.</p>
          </div>
        ) : (
          categories.map((category) => (
            <ExpandableCard
              key={category._id}
              category={category}
              products={category.products}
              updateCategoryName={updateCategoryName}
              onDeleteCategory={handleDeleteCategory}
              onDuplicateCategory={handleDuplicateCategory}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Panel;
