import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Clock, DollarSign, X, Upload, Save, Filter, Tag, PlusCircle } from 'lucide-react';
import { ENDPOINTS } from '../../config/api';

export default function BusinessesManager() {
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isOpen: true,
    deliveryTime: { min: 20, max: 40 },
    deliveryCost: 0,
    minOrderAmount: 0,
    coordinates: [-98.3077, 19.0639],
    address: '',
    mapIcon: '📍',
  });

  // Nueva categoría
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '🍽️',
    type: 'comida'
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [selectedTypeInModal, setSelectedTypeInModal] = useState('comida');

  useEffect(() => {
    loadCategories();
    loadBusinesses();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch(ENDPOINTS.businessCategories.base);
      const data = await res.json();
      const loadedCategories = data.response || data || [];
      setCategories(loadedCategories);
      
      if (loadedCategories.length > 0 && !formData.category) {
        const firstCategoryOfType = loadedCategories.find(c => c.type === selectedTypeInModal);
        setFormData(prev => ({
          ...prev,
          category: firstCategoryOfType?._id || loadedCategories[0]._id
        }));
      }
    } catch (error) {
      // Error loading categories
    }
  };

  const loadBusinesses = async () => {
    try {
      const res = await fetch(ENDPOINTS.businesses.base);
      const data = await res.json();
      setBusinesses(data.response || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }

    try {
      const res = await fetch(ENDPOINTS.businessCategories.base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name,
          icon: newCategory.icon,
          type: newCategory.type
        })
      });

      const data = await res.json();
      
      if (data.success) {
        await loadCategories();
        setFormData({...formData, category: data.response._id});
        setShowCategoryModal(false);
        setNewCategory({ name: '', icon: '🍽️', type: selectedTypeInModal });
        alert('Categoría creada exitosamente');
      } else {
        alert(data.message || 'Error al crear categoría');
      }
    } catch (error) {
      alert('Error al crear categoría');
    }
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('isOpen', formData.isOpen);
    formDataToSend.append('deliveryTime', JSON.stringify(formData.deliveryTime));
    formDataToSend.append('deliveryCost', formData.deliveryCost);
    formDataToSend.append('minOrderAmount', formData.minOrderAmount);
    formDataToSend.append('coordinates', JSON.stringify(formData.coordinates));
    formDataToSend.append('address', formData.address);
    formDataToSend.append('mapIcon', formData.mapIcon);
    
    if (logoFile) formDataToSend.append('logo', logoFile);
    if (bannerFile) formDataToSend.append('banner', bannerFile);

    try {
      const url = editingBusiness
        ? ENDPOINTS.businesses.byId(editingBusiness._id)
        : ENDPOINTS.businesses.create;
      
      const method = editingBusiness ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        body: formDataToSend,
      });
      
      const data = await res.json();
      
      if (data.success) {
        closeModal();
        loadBusinesses();
      } else {
        alert(data.message || 'Error al guardar el negocio');
      }
    } catch (error) {
      alert('Error al guardar el negocio');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este negocio?')) return;
    
    try {
      const res = await fetch(ENDPOINTS.businesses.byId(id), {
        method: 'DELETE',
      });
      
      const data = await res.json();
      if (data.success) {
        loadBusinesses();
      } else {
        alert(data.message || 'Error al eliminar el negocio');
      }
    } catch (error) {
      alert('Error al eliminar el negocio');
    }
  };

  const openEditModal = (business) => {
    setEditingBusiness(business);
    
    // Detectar el tipo de la categoría del negocio
    const businessCategoryType = business.category?.type || 'comida';
    setSelectedTypeInModal(businessCategoryType);
    
    setFormData({
      name: business.name,
      description: business.description || '',
      category: business.category?._id || business.category || '',
      isOpen: business.isOpen ?? true,
      deliveryTime: business.deliveryTime || { min: 20, max: 40 },
      deliveryCost: business.deliveryCost || 0,
      minOrderAmount: business.minOrderAmount || 0,
      coordinates: business.location?.coordinates || [-98.3077, 19.0639],
      address: business.address || '',
      mapIcon: business.mapIcon || '📍',
    });
    
    setLogoPreview(business.logo || null);
    setBannerPreview(business.banner || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBusiness(null);
    setFormData({
      name: '',
      description: '',
      category: categories.length > 0 ? categories[0]._id : '',
      isOpen: true,
      deliveryTime: { min: 20, max: 40 },
      deliveryCost: 0,
      minOrderAmount: 0,
      coordinates: [-98.3077, 19.0639],
      address: '',
      mapIcon: '📍',
    });
    setLogoFile(null);
    setBannerFile(null);
    setLogoPreview(null);
    setBannerPreview(null);
    setSelectedTypeInModal('comida');
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
      } else {
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
      }
    }
  };

  const filteredBusinesses = businesses.filter(business => {
    if (selectedTypeFilter === 'all') return true;
    return business.category?.type === selectedTypeFilter;
  });

  const categoriesForModal = categories.filter(cat => cat.type === selectedTypeInModal);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando negocios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Negocios</h1>
            <p className="text-gray-600 mt-1">Administra los negocios en el mapa</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg"
          >
            <Plus size={20} />
            Nuevo Negocio
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtrar por sección:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTypeFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTypeFilter === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos ({businesses.length})
              </button>
              <button
                onClick={() => setSelectedTypeFilter('comida')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTypeFilter === 'comida'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🍔 Comida ({businesses.filter(b => b.category?.type === 'comida').length})
              </button>
              <button
                onClick={() => setSelectedTypeFilter('tienda')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTypeFilter === 'tienda'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏪 Tienda ({businesses.filter(b => b.category?.type === 'tienda').length})
              </button>
              <button
                onClick={() => setSelectedTypeFilter('envio')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTypeFilter === 'envio'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📦 Envío ({businesses.filter(b => b.category?.type === 'envio').length})
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <div key={business._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-32 bg-gradient-to-br from-orange-400 to-orange-600 relative overflow-hidden">
                {business.banner ? (
                  <img
                    src={business.banner}
                    alt="Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/30 text-sm">Sin banner</span>
                  </div>
                )}
              </div>
              
              <div className="px-6 pb-6">
                <div className="flex items-start justify-between -mt-12 mb-4">
                  <div className="w-20 h-20 bg-white rounded-xl shadow-lg border-4 border-white overflow-hidden">
                    {business.logo ? (
                      <img
                        src={business.logo}
                        alt={business.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-400">
                        {business.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-14">
                    <button
                      onClick={() => openEditModal(business)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(business._id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{business.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{business.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-lg font-medium">
                      {business.category?.name || business.category}
                    </span>
                    {business.category?.type && (
                      <span className={`px-2 py-1 rounded-lg font-medium text-xs ${
                        business.category.type === 'comida' ? 'bg-purple-100 text-purple-600' :
                        business.category.type === 'tienda' ? 'bg-blue-100 text-blue-600' :
                        'bg-teal-100 text-teal-600'
                      }`}>
                        {business.category.type === 'comida' ? '🍔 Comida' :
                         business.category.type === 'tienda' ? '🏪 Tienda' :
                         '📦 Envío'}
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-lg font-medium ${
                      business.isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {business.isOpen ? 'Abierto' : 'Cerrado'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>
                      {business.deliveryTime?.min || 20}-{business.deliveryTime?.max || 40} min
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign size={16} />
                    <span>
                      Envío: ${business.deliveryCost || 0} | Min: ${business.minOrderAmount || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-xl">{business.mapIcon || '📍'}</span>
                    <span className="truncate">{business.address}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              No hay negocios {selectedTypeFilter !== 'all' ? `de tipo "${selectedTypeFilter}"` : 'registrados'}
            </p>
            <p className="text-gray-500 text-sm mt-2">Comienza agregando tu primer negocio</p>
          </div>
        )}
      </div>

      {/* MODAL DE NEGOCIO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBusiness ? 'Editar Negocio' : 'Nuevo Negocio'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Selector de tipo de sección */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Sección *</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTypeInModal('comida');
                      const firstCategory = categoriesForModal.find(c => c.type === 'comida');
                      setFormData({...formData, category: firstCategory?._id || ''});
                      setNewCategory({...newCategory, type: 'comida'});
                    }}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      selectedTypeInModal === 'comida'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🍔</div>
                    <div className="font-semibold text-gray-900">Comida</div>
                    <div className="text-xs text-gray-500">Para el mapa</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTypeInModal('tienda');
                      const firstCategory = categoriesForModal.find(c => c.type === 'tienda');
                      setFormData({...formData, category: firstCategory?._id || ''});
                      setNewCategory({...newCategory, type: 'tienda'});
                    }}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      selectedTypeInModal === 'tienda'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🏪</div>
                    <div className="font-semibold text-gray-900">Tienda</div>
                    <div className="text-xs text-gray-500">Vista única</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTypeInModal('envio');
                      const firstCategory = categoriesForModal.find(c => c.type === 'envio');
                      setFormData({...formData, category: firstCategory?._id || ''});
                      setNewCategory({...newCategory, type: 'envio'});
                    }}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      selectedTypeInModal === 'envio'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">📦</div>
                    <div className="font-semibold text-gray-900">Envío</div>
                    <div className="text-xs text-gray-500">Logística</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logo')}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-32 h-32 object-contain mx-auto" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload size={32} className="text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Subir logo</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'banner')}
                      className="hidden"
                      id="banner-upload"
                    />
                    <label htmlFor="banner-upload" className="cursor-pointer">
                      {bannerPreview ? (
                        <img src={bannerPreview} alt="Banner preview" className="w-full h-32 object-cover rounded" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload size={32} className="text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Subir banner</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría * 
                    <span className="text-xs text-gray-500 ml-2">
                      (Tipo: {selectedTypeInModal})
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {categoriesForModal.length === 0 ? (
                        <option value="">No hay categorías de tipo "{selectedTypeInModal}"</option>
                      ) : (
                        categoriesForModal.map(cat => (
                          <option key={cat._id} value={cat._id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      title="Crear nueva categoría"
                    >
                      <PlusCircle size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icono en el mapa *</label>
                  <input
                    type="text"
                    required
                    value={formData.mapIcon}
                    onChange={(e) => setFormData({...formData, mapIcon: e.target.value})}
                    placeholder="📍"
                    maxLength="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-2xl text-center"
                  />
                  <p className="text-xs text-gray-500 mt-1">Emoji que aparecerá en el mapa (🍕🍔🌮🍣☕)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitud *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.coordinates[0]}
                    onChange={(e) => setFormData({...formData, coordinates: [parseFloat(e.target.value), formData.coordinates[1]]})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitud *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.coordinates[1]}
                    onChange={(e) => setFormData({...formData, coordinates: [formData.coordinates[0], parseFloat(e.target.value)]})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo mínimo (min)</label>
                  <input
                    type="number"
                    value={formData.deliveryTime.min}
                    onChange={(e) => setFormData({...formData, deliveryTime: {...formData.deliveryTime, min: parseInt(e.target.value)}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo máximo (min)</label>
                  <input
                    type="number"
                    value={formData.deliveryTime.max}
                    onChange={(e) => setFormData({...formData, deliveryTime: {...formData.deliveryTime, max: parseInt(e.target.value)}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Costo de envío ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.deliveryCost}
                    onChange={(e) => setFormData({...formData, deliveryCost: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pedido mínimo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData({...formData, isOpen: e.target.checked})}
                  className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <label className="text-sm font-medium text-gray-700">Negocio abierto</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Save size={20} />
                  {editingBusiness ? 'Guardar Cambios' : 'Crear Negocio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CREAR CATEGORÍA */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Tag className="text-white" size={24} />
                <h3 className="text-xl font-bold text-white">Nueva Categoría</h3>
              </div>
              <button 
                onClick={() => setShowCategoryModal(false)} 
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Categoría *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCategory({...newCategory, type: 'comida'})}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      newCategory.type === 'comida'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🍔</div>
                    <div className="text-xs font-semibold">Comida</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setNewCategory({...newCategory, type: 'tienda'})}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      newCategory.type === 'tienda'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">🏪</div>
                    <div className="text-xs font-semibold">Tienda</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setNewCategory({...newCategory, type: 'envio'})}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      newCategory.type === 'envio'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">📦</div>
                    <div className="text-xs font-semibold">Envío</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pizzerías, Abarrotes, etc."
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icono (Emoji) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="🍕"
                  maxLength="2"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-3xl text-center"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sugerencias: 🍕🍔🌮🍣🥗🍰🏪💊📱🛒
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Vista previa:</strong> {newCategory.icon} {newCategory.name || 'Nombre de categoría'}
                  <br />
                  <span className="text-xs">
                    Tipo: <span className={`px-2 py-0.5 rounded ${
                      newCategory.type === 'comida' ? 'bg-purple-100 text-purple-600' :
                      newCategory.type === 'tienda' ? 'bg-blue-100 text-blue-600' :
                      'bg-teal-100 text-teal-600'
                    }`}>
                      {newCategory.type}
                    </span>
                  </span>
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategory({ name: '', icon: '🍽️', type: selectedTypeInModal });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCategory}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Save size={18} />
                  Crear Categoría
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}