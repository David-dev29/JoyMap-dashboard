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
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Avatar, Dropdown } from '../../components/ui';
import { authFetch, ENDPOINTS } from '../../config/api';

const ratingOptions = [
  { value: '', label: 'Todas las calificaciones' },
  { value: '5', label: '5 estrellas' },
  { value: '4', label: '4 estrellas' },
  { value: '3', label: '3 estrellas' },
  { value: '2', label: '2 estrellas' },
  { value: '1', label: '1 estrella' },
];

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessFilter, setBusinessFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
