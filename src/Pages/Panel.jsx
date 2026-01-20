import React, { useState, useEffect } from "react";
import io from "socket.io-client";

import ProfilePage from "../Pages/Menu/Profile";
import ExpandableCard from "../Components/Dashboard/ExplanableCard";
import CategoryButton from "../Components/Dashboard/CategoryButton";
import Pagination from "../Components/Dashboard/Pagination";
import { ENDPOINTS, SOCKET_URL } from "../config/api";

const socket = io(SOCKET_URL);



const Panel = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [store, setStore] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(ENDPOINTS.stores.base);
        const data = await res.json();
        if (data.success && data.store_data) setStore(data.store_data); // <- CORRECTO
      } catch (err) {
        // Error fetching store
      }
    };
    fetchStore();
  }, []);
  
  
  // 🔹 Cargar categorías al iniciar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Traemos las categorías con sus productos
        const res = await fetch(`${ENDPOINTS.categories.base}?populate=products`);
        const data = await res.json();
  
        setCategories(data.response || []);
        if (data.response.length > 0) {
          setSelectedCategoryId(data.response[0]._id);
        }
      } catch (error) {
        // Error loading categories
      }
    };
  
    fetchCategories();
  }, []);
  

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

 
  // 🔹 Crear categoría
  const addCategory = async () => {
    const storeId = "64abc123def4567890fedcba"; // Traelo de tu usuario, store actual o props
  
    try {
      await fetch(ENDPOINTS.categories.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Categoría ${categories.length + 1}`,
          storeId,
        }),
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

  // 🔹 Duplicar categoría
  const handleDuplicateCategory = async (id) => {
    const category = categories.find((cat) => cat._id === id);
    if (!category) return;

    try {
      await fetch(ENDPOINTS.categories.base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: category.name + " (Copia)",
          storeId: category.storeId,
        }),
      });
    } catch (error) {
      // Error duplicating category
    }
  };

  return (
    <div>
      <ProfilePage store={store} onUpdate={setStore} />


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
        {categories.map((category) => (
          <ExpandableCard
            key={category._id}
            category={category}
            products={category.products} // Aquí ya vienen todos los productos
            updateCategoryName={updateCategoryName}
            onDeleteCategory={handleDeleteCategory}
            onDuplicateCategory={handleDuplicateCategory}
          />
        ))}
      </div>
    </div>
  );
};

export default Panel;
