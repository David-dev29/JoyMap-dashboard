import { useState, useEffect } from 'react';
import {
  Star,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  Building2,
  Calendar,
  MessageSquare,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Avatar, Dropdown } from '../../components/ui';
import MobileModal from '../../components/ui/MobileModal';
import { authFetch, ENDPOINTS } from '../../config/api';
import { useIsMobile } from '../../hooks/useIsMobile';

const ratingOptions = [
  { value: '', label: 'Todas las calificaciones' },
  { value: '5', label: '5 estrellas' },
  { value: '4', label: '4 estrellas' },
  { value: '3', label: '3 estrellas' },
  { value: '2', label: '2 estrellas' },
  { value: '1', label: '1 estrella' },
];

const Reviews = () => {
  const isMobile = useIsMobile(768);
  const [reviews, setReviews] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessFilter, setBusinessFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedReviewId, setExpandedReviewId] = useState(null);

  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchReviews();
    fetchBusinesses();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      console.log('=== DEBUG Reviews ===');
      console.log('Fetching reviews from:', ENDPOINTS.reviews.base);

      const response = await authFetch(ENDPOINTS.reviews.base);
      const data = await response.json();

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('API Response:', data);

      if (response.ok) {
        const reviewsList = data.reviews || data.response || data.data || (Array.isArray(data) ? data : []);
        console.log('Reviews extracted:', reviewsList);
        console.log('Is Array:', Array.isArray(reviewsList));
        setReviews(Array.isArray(reviewsList) ? reviewsList : []);
      } else {
        throw new Error(data.message || 'Error al cargar resenas');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showToast('Error al cargar las resenas', 'error');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await authFetch(ENDPOINTS.businesses.all);
      const data = await response.json();

      if (response.ok) {
        const businessList = data.businesses || data.response || data.data || (Array.isArray(data) ? data : []);
        setBusinesses(Array.isArray(businessList) ? businessList : []);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  // Build business options for filter
  const businessOptions = [
    { value: '', label: 'Todos los negocios' },
    ...businesses.map(b => ({
      value: b._id,
      label: b.name,
    })),
  ];

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const customerName = review.customerId?.name || review.customer?.name || '';
    const matchesSearch =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.comment || '').toLowerCase().includes(searchQuery.toLowerCase());
    const businessId = review.businessId?._id || review.businessId || '';
    const matchesBusiness = !businessFilter || businessId === businessFilter;
    const matchesRating = !ratingFilter || review.rating?.toString() === ratingFilter;
    const reviewStatus = review.isVisible === false ? 'hidden' : 'visible';
    const matchesStatus = !statusFilter || reviewStatus === statusFilter;
    return matchesSearch && matchesBusiness && matchesRating && matchesStatus;
  });

  // Stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;
  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  // Handlers
  const toggleVisibility = async (review) => {
    const newVisibility = review.isVisible === false ? true : false;
    try {
      const response = await authFetch(ENDPOINTS.reviews.byId(review._id), {
        method: 'PUT',
        body: JSON.stringify({ isVisible: newVisibility }),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast(newVisibility ? 'Resena visible' : 'Resena oculta');
        await fetchReviews();
      } else {
        throw new Error(data.message || 'Error al cambiar visibilidad');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      showToast(error.message || 'Error al cambiar visibilidad', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    setSubmitting(true);
    try {
      const response = await authFetch(ENDPOINTS.reviews.byId(selectedReview._id), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast('Resena eliminada');
        await fetchReviews();
        setIsDeleteModalOpen(false);
        setSelectedReview(null);
      } else {
        throw new Error(data.message || 'Error al eliminar resena');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast(error.message || 'Error al eliminar la resena', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openViewModal = (review) => {
    setSelectedReview(review);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (review) => {
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get customer name
  const getCustomerName = (review) => {
    return review.customerId?.name || review.customer?.name || 'Cliente';
  };

  // Get customer email
  const getCustomerEmail = (review) => {
    return review.customerId?.email || review.customer?.email || '';
  };

  // Get business name
  const getBusinessName = (review) => {
    return review.businessId?.name || review.business?.name || 'Negocio';
  };

  // Get visibility status
  const getVisibilityStatus = (review) => {
    return review.isVisible === false ? 'hidden' : 'visible';
  };

  const StarRating = ({ rating, size = 16 }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );

  // Mobile rating tabs
  const ratingTabs = [
    { key: '', label: 'Todas', count: reviews.length },
    { key: '5', label: '5★', count: ratingCounts[5] },
    { key: '4', label: '4★', count: ratingCounts[4] },
    { key: '3', label: '3★', count: ratingCounts[3] },
    { key: '2', label: '2★', count: ratingCounts[2] },
    { key: '1', label: '1★', count: ratingCounts[1] },
  ];

  // Mobile Review Card Component
  const MobileReviewCard = ({ review }) => {
    const isExpanded = expandedReviewId === review._id;
    const visibilityStatus = getVisibilityStatus(review);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div
          className="p-4"
          onClick={() => setExpandedReviewId(isExpanded ? null : review._id)}
        >
          {/* Header with customer and rating */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar name={getCustomerName(review)} size="sm" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {getCustomerName(review)}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <Building2 size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-500">{getBusinessName(review)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {visibilityStatus === 'hidden' && (
                <Badge variant="default" size="sm">Oculta</Badge>
              )}
              {isExpanded ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </div>
          </div>

          {/* Rating stars */}
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={review.rating} size={16} />
            <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
          </div>

          {/* Comment preview */}
          <p className={`text-sm text-gray-600 dark:text-gray-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
            {review.comment || 'Sin comentario'}
          </p>
        </div>

        {/* Expanded actions */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openViewModal(review);
              }}
              className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              Ver completa
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(review);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
                visibilityStatus === 'visible'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {visibilityStatus === 'visible' ? <EyeOff size={16} /> : <Eye size={16} />}
              {visibilityStatus === 'visible' ? 'Ocultar' : 'Mostrar'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal(review);
              }}
              className="py-2.5 px-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Hidden reviews count
  const hiddenCount = reviews.filter(r => r.isVisible === false).length;

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Toast */}
        {toast.show && (
          <div className={`fixed top-4 left-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
          }`}>
            {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        )}

        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-3">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Reseñas</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Gestiona las reseñas de los clientes
            </p>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o comentario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Rating Tabs */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {ratingTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setRatingFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    ratingFilter === tab.key
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    ratingFilter === tab.key
                      ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 pt-4 pb-2 grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-card text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{avgRating}</span>
            </div>
            <p className="text-xs text-gray-500">Promedio</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-card text-center">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{reviews.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-card text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{hiddenCount}</p>
            <p className="text-xs text-gray-500">Ocultas</p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="px-4 py-4 space-y-3 pb-24">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No se encontraron reseñas</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <MobileReviewCard key={review._id} review={review} />
            ))
          )}
        </div>

        {/* Mobile View Modal */}
        <MobileModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedReview(null);
          }}
          title="Detalle de Reseña"
        >
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar name={getCustomerName(selectedReview)} size="lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {getCustomerName(selectedReview)}
                  </h3>
                  <p className="text-sm text-gray-500">{getCustomerEmail(selectedReview)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={selectedReview.rating} size={18} />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-gray-700 dark:text-gray-200 italic">
                  "{selectedReview.comment || 'Sin comentario'}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500">Negocio</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getBusinessName(selectedReview)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedReview.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    toggleVisibility(selectedReview);
                    setIsViewModalOpen(false);
                    setSelectedReview(null);
                  }}
                  className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                    getVisibilityStatus(selectedReview) === 'visible'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {getVisibilityStatus(selectedReview) === 'visible' ? <EyeOff size={18} /> : <Eye size={18} />}
                  {getVisibilityStatus(selectedReview) === 'visible' ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
          )}
        </MobileModal>

        {/* Mobile Delete Confirmation */}
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedReview(null);
          }}
          title="Eliminar Reseña"
        >
          {selectedReview && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-600 dark:text-red-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                ¿Estás seguro de eliminar esta reseña de <strong>{getCustomerName(selectedReview)}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta acción no se puede deshacer.
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedReview(null);
                  }}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          )}
        </MobileModal>
      </div>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
            : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Resenas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona las resenas de los clientes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-900 dark:text-white">{avgRating}</p>
              <StarRating rating={Math.round(parseFloat(avgRating))} size={20} />
              <p className="text-sm text-gray-500 mt-1">{reviews.length} resenas</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-3">{rating}</span>
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                    <div
                      className="h-2 bg-amber-400 rounded-full transition-all"
                      style={{ width: `${reviews.length > 0 ? (ratingCounts[rating] / reviews.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{ratingCounts[rating]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {reviews.filter((r) => r.rating >= 4).length}
              </p>
              <p className="text-sm text-gray-500">Positivas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {reviews.filter((r) => r.rating === 3).length}
              </p>
              <p className="text-sm text-gray-500">Neutrales</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {reviews.filter((r) => r.rating <= 2).length}
              </p>
              <p className="text-sm text-gray-500">Negativas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por cliente o comentario..."
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              options={businessOptions}
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
              placeholder=""
              fullWidth={false}
              className="w-44"
            />
            <Select
              options={ratingOptions}
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              placeholder=""
              fullWidth={false}
              className="w-40"
            />
            <Select
              options={[
                { value: '', label: 'Todos los estados' },
                { value: 'visible', label: 'Visible' },
                { value: 'hidden', label: 'Oculta' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder=""
              fullWidth={false}
              className="w-36"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <Table>
          <Table.Head>
            <Table.Row hover={false}>
              <Table.Header>Cliente</Table.Header>
              <Table.Header>Negocio</Table.Header>
              <Table.Header>Rating</Table.Header>
              <Table.Header>Comentario</Table.Header>
              <Table.Header>Fecha</Table.Header>
              <Table.Header>Estado</Table.Header>
              <Table.Header align="right">Acciones</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {loading ? (
              <Table.Loading colSpan={7} />
            ) : filteredReviews.length === 0 ? (
              <Table.Empty
                colSpan={7}
                message="No se encontraron resenas"
              />
            ) : (
              filteredReviews.map((review) => (
                <Table.Row key={review._id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Avatar name={getCustomerName(review)} size="sm" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getCustomerName(review)}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {getBusinessName(review)}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <StarRating rating={review.rating} />
                  </Table.Cell>
                  <Table.Cell>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 max-w-xs">
                      {review.comment || '-'}
                    </p>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant={getVisibilityStatus(review) === 'visible' ? 'success' : 'default'}
                      size="sm"
                    >
                      {getVisibilityStatus(review) === 'visible' ? 'Visible' : 'Oculta'}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Dropdown
                      align="right"
                      trigger={
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <MoreHorizontal size={18} className="text-gray-500" />
                        </button>
                      }
                    >
                      {(close) => (
                        <>
                          <Dropdown.Item
                            icon={<MessageSquare size={16} />}
                            onClick={() => {
                              close();
                              openViewModal(review);
                            }}
                          >
                            Ver completa
                          </Dropdown.Item>
                          <Dropdown.Item
                            icon={getVisibilityStatus(review) === 'visible' ? <EyeOff size={16} /> : <Eye size={16} />}
                            onClick={() => {
                              close();
                              toggleVisibility(review);
                            }}
                          >
                            {getVisibilityStatus(review) === 'visible' ? 'Ocultar' : 'Mostrar'}
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            icon={<Trash2 size={16} />}
                            danger
                            onClick={() => {
                              close();
                              openDeleteModal(review);
                            }}
                          >
                            Eliminar
                          </Dropdown.Item>
                        </>
                      )}
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedReview(null);
        }}
        title="Detalle de Resena"
        size="md"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar name={getCustomerName(selectedReview)} size="lg" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {getCustomerName(selectedReview)}
                </h3>
                <p className="text-sm text-gray-500">{getCustomerEmail(selectedReview)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={selectedReview.rating} size={18} />
                  <Badge variant={getVisibilityStatus(selectedReview) === 'visible' ? 'success' : 'default'} size="sm">
                    {getVisibilityStatus(selectedReview) === 'visible' ? 'Visible' : 'Oculta'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-gray-700 dark:text-gray-200 italic">
                "{selectedReview.comment || 'Sin comentario'}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500">Negocio</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {getBusinessName(selectedReview)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(selectedReview.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )}
        {selectedReview && (
          <Modal.Footer>
            <Button
              variant="ghost"
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedReview(null);
              }}
            >
              Cerrar
            </Button>
            <Button
              variant={getVisibilityStatus(selectedReview) === 'visible' ? 'secondary' : 'primary'}
              leftIcon={getVisibilityStatus(selectedReview) === 'visible' ? <EyeOff size={16} /> : <Eye size={16} />}
              onClick={() => {
                toggleVisibility(selectedReview);
                setIsViewModalOpen(false);
                setSelectedReview(null);
              }}
            >
              {getVisibilityStatus(selectedReview) === 'visible' ? 'Ocultar' : 'Mostrar'}
            </Button>
          </Modal.Footer>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedReview(null);
        }}
        title="Eliminar Resena"
        size="sm"
      >
        {selectedReview && (
          <>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-red-600 dark:text-red-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Estas seguro de eliminar esta resena de <strong>{getCustomerName(selectedReview)}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta accion no se puede deshacer.
              </p>
            </div>
            <Modal.Footer>
              <Button variant="ghost" onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedReview(null);
              }}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={submitting}>
                Eliminar
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Reviews;
