import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiPhotograph,
  HiX,
  HiMenuAlt4,
  HiEye,
  HiEyeOff
} from 'react-icons/hi';
import { toast } from 'sonner';
import { authFetch, API_BASE_URL } from '../../config/api';

const PROMO_ENDPOINTS = {
  all: `${API_BASE_URL}/promotions/admin/all`,
  create: `${API_BASE_URL}/promotions`,
  update: (id) => `${API_BASE_URL}/promotions/${id}`,
  delete: (id) => `${API_BASE_URL}/promotions/${id}`,
  reorder: `${API_BASE_URL}/promotions/reorder`,
};

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    type: 'carousel',
    linkType: 'none',
    linkValue: '',
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      const response = await authFetch(PROMO_ENDPOINTS.all);
      const data = await response.json();
      if (data.success) {
        setPromotions(data.data);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Error al cargar promociones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('La imagen no puede superar 10MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Open modal for create/edit
  const openModal = (promotion = null) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        title: promotion.title || '',
        subtitle: promotion.subtitle || '',
        type: promotion.type || 'carousel',
        linkType: promotion.linkType || 'none',
        linkValue: promotion.linkValue || '',
        isActive: promotion.isActive ?? true,
      });
      setImagePreview(promotion.image);
    } else {
      setEditingPromotion(null);
      setFormData({
        title: '',
        subtitle: '',
        type: 'carousel',
        linkType: 'none',
        linkValue: '',
        isActive: true,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingPromotion(null);
    setImageFile(null);
    setImagePreview(null);
  };

  // Save promotion
  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    setSaving(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('linkType', formData.linkType);
      formDataToSend.append('linkValue', formData.linkValue);
      formDataToSend.append('isActive', formData.isActive);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const url = editingPromotion
        ? PROMO_ENDPOINTS.update(editingPromotion._id)
        : PROMO_ENDPOINTS.create;

      const response = await authFetch(url, {
        method: editingPromotion ? 'PUT' : 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingPromotion ? 'Promoción actualizada' : 'Promoción creada');
        fetchPromotions();
        closeModal();
      } else {
        toast.error(data.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Error al guardar promoción');
    } finally {
      setSaving(false);
    }
  };

  // Delete promotion
  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta promoción?')) return;

    try {
      const response = await authFetch(PROMO_ENDPOINTS.delete(id), {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Promoción eliminada');
        setPromotions(promotions.filter(p => p._id !== id));
      } else {
        toast.error(data.message || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Error al eliminar');
    }
  };

  // Toggle active status
  const toggleActive = async (promotion) => {
    try {
      const response = await authFetch(PROMO_ENDPOINTS.update(promotion._id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !promotion.isActive }),
      });
      const data = await response.json();

      if (data.success) {
        setPromotions(promotions.map(p =>
          p._id === promotion._id ? { ...p, isActive: !p.isActive } : p
        ));
        toast.success(promotion.isActive ? 'Promoción desactivada' : 'Promoción activada');
      }
    } catch (error) {
      console.error('Error toggling promotion:', error);
      toast.error('Error al cambiar estado');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Promociones
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Banners y carrusel del home
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Nueva promoción
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-12">
            <HiPhotograph className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay promociones</p>
            <button
              onClick={() => openModal()}
              className="mt-4 text-indigo-600 font-medium hover:underline"
            >
              Crear primera promoción
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.map((promotion) => (
              <motion.div
                key={promotion._id}
                layout
                className={`relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border ${
                  promotion.isActive
                    ? 'border-gray-200 dark:border-gray-700'
                    : 'border-gray-300 dark:border-gray-600 opacity-60'
                }`}
              >
                {/* Preview */}
                <div className="h-32 relative bg-rose-600">
                  {promotion.image && (
                    <img
                      src={promotion.image}
                      alt={promotion.title}
                      className="absolute right-0 top-0 h-full w-1/2 object-cover object-left"
                    />
                  )}
                  <div className="absolute inset-0 p-4 flex flex-col justify-center">
                    <h3 className="font-bold text-lg leading-tight text-white">
                      {promotion.title}
                    </h3>
                    {promotion.subtitle && (
                      <p className="text-sm mt-1 text-white/90">
                        {promotion.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      promotion.type === 'hero'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {promotion.type === 'hero' ? 'Hero' : 'Carrusel'}
                    </span>
                    {!promotion.isActive && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleActive(promotion)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title={promotion.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {promotion.isActive ? (
                        <HiEye className="w-4 h-4" />
                      ) : (
                        <HiEyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openModal(promotion)}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(promotion._id)}
                      className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingPromotion ? 'Editar promoción' : 'Nueva promoción'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-4 space-y-4">
                {/* Preview */}
                <div className="rounded-xl overflow-hidden h-32 relative bg-rose-600">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="absolute right-0 top-0 h-full w-1/2 object-cover object-left"
                    />
                  )}
                  <div className="absolute inset-0 p-4 flex flex-col justify-center">
                    <h3 className="font-bold text-lg leading-tight text-white">
                      {formData.title || 'Título de la promoción'}
                    </h3>
                    {formData.subtitle && (
                      <p className="text-sm mt-1 text-white/90">
                        {formData.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Hasta 30% OFF"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Las mejores promos para compartir"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Imagen
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                      <HiPhotograph className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {imageFile ? imageFile.name : 'Seleccionar imagen'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="carousel">Carrusel</option>
                    <option value="hero">Hero (banner principal)</option>
                  </select>
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Activo
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      formData.isActive ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        formData.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : editingPromotion ? 'Guardar cambios' : 'Crear promoción'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Promotions;
