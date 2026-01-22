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
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Avatar, Dropdown } from '../../components/ui';

// Mock data
const mockReviews = [
  {
    id: 1,
    customer: { name: 'Juan Perez', email: 'juan@email.com' },
    business: { id: 1, name: 'El Buen Sabor' },
    rating: 5,
    comment: 'Excelente comida y muy rapido el servicio. Los tacos estaban deliciosos y la salsa verde increible. Definitivamente volvere a pedir.',
    date: '2024-01-21',
    status: 'visible',
    orderId: '1001',
  },
  {
    id: 2,
    customer: { name: 'Maria Garcia', email: 'maria@email.com' },
    business: { id: 2, name: 'Pizza Express' },
    rating: 4,
    comment: 'Buena pizza, aunque tardo un poco mas de lo esperado. El sabor estuvo muy bien.',
    date: '2024-01-20',
    status: 'visible',
    orderId: '998',
  },
  {
    id: 3,
    customer: { name: 'Carlos Lopez', email: 'carlos@email.com' },
    business: { id: 3, name: 'Sushi Master' },
    rating: 2,
    comment: 'El sushi llego frio y algunos rollos estaban aplastados. No fue una buena experiencia.',
    date: '2024-01-19',
    status: 'visible',
    orderId: '995',
  },
  {
    id: 4,
    customer: { name: 'Ana Martinez', email: 'ana@email.com' },
    business: { id: 1, name: 'El Buen Sabor' },
    rating: 5,
    comment: 'Todo perfecto! La mejor comida mexicana de la ciudad.',
    date: '2024-01-19',
    status: 'visible',
    orderId: '990',
  },
  {
    id: 5,
    customer: { name: 'Pedro Sanchez', email: 'pedro@email.com' },
    business: { id: 4, name: 'Cafe Central' },
    rating: 3,
    comment: 'El cafe estaba bien pero las galletas un poco secas.',
    date: '2024-01-18',
    status: 'hidden',
    orderId: '985',
  },
  {
    id: 6,
    customer: { name: 'Laura Torres', email: 'laura@email.com' },
    business: { id: 2, name: 'Pizza Express' },
    rating: 5,
    comment: 'La mejor pizza de pepperoni! Super rapidos en la entrega.',
    date: '2024-01-18',
    status: 'visible',
    orderId: '982',
  },
  {
    id: 7,
    customer: { name: 'Diego Ruiz', email: 'diego@email.com' },
    business: { id: 5, name: 'Taqueria Don Jose' },
    rating: 1,
    comment: 'Pesimo servicio, la comida llego muy tarde y fria. No lo recomiendo.',
    date: '2024-01-17',
    status: 'hidden',
    orderId: '978',
  },
  {
    id: 8,
    customer: { name: 'Sofia Morales', email: 'sofia@email.com' },
    business: { id: 3, name: 'Sushi Master' },
    rating: 4,
    comment: 'Muy buen sushi, fresco y bien presentado. Solo que las porciones son un poco pequenas.',
    date: '2024-01-17',
    status: 'visible',
    orderId: '975',
  },
];

const mockBusinesses = [
  { value: '', label: 'Todos los negocios' },
  { value: '1', label: 'El Buen Sabor' },
  { value: '2', label: 'Pizza Express' },
  { value: '3', label: 'Sushi Master' },
  { value: '4', label: 'Cafe Central' },
  { value: '5', label: 'Taqueria Don Jose' },
];

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

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
    }, 500);
  }, []);

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBusiness = !businessFilter || review.business.id.toString() === businessFilter;
    const matchesRating = !ratingFilter || review.rating.toString() === ratingFilter;
    const matchesStatus = !statusFilter || review.status === statusFilter;
    return matchesSearch && matchesBusiness && matchesRating && matchesStatus;
  });

  // Stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
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
    setReviews(reviews.map((r) =>
      r.id === review.id
        ? { ...r, status: r.status === 'visible' ? 'hidden' : 'visible' }
        : r
    ));
  };

  const handleDelete = async () => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setReviews(reviews.filter((r) => r.id !== selectedReview.id));
    setSubmitting(false);
    setIsDeleteModalOpen(false);
    setSelectedReview(null);
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
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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
              options={mockBusinesses}
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
                <Table.Row key={review.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Avatar name={review.customer.name} size="sm" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {review.customer.name}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {review.business.name}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <StarRating rating={review.rating} />
                  </Table.Cell>
                  <Table.Cell>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 max-w-xs">
                      {review.comment}
                    </p>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant={review.status === 'visible' ? 'success' : 'default'}
                      size="sm"
                    >
                      {review.status === 'visible' ? 'Visible' : 'Oculta'}
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
                            icon={review.status === 'visible' ? <EyeOff size={16} /> : <Eye size={16} />}
                            onClick={() => {
                              close();
                              toggleVisibility(review);
                            }}
                          >
                            {review.status === 'visible' ? 'Ocultar' : 'Mostrar'}
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
              <Avatar name={selectedReview.customer.name} size="lg" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedReview.customer.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedReview.customer.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={selectedReview.rating} size={18} />
                  <Badge variant={selectedReview.status === 'visible' ? 'success' : 'default'} size="sm">
                    {selectedReview.status === 'visible' ? 'Visible' : 'Oculta'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-gray-700 dark:text-gray-200 italic">
                "{selectedReview.comment}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-500">Negocio</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedReview.business.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Orden</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  #{selectedReview.orderId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(selectedReview.date)}
                </p>
              </div>
            </div>
          </div>
        )}
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
            variant={selectedReview?.status === 'visible' ? 'secondary' : 'primary'}
            leftIcon={selectedReview?.status === 'visible' ? <EyeOff size={16} /> : <Eye size={16} />}
            onClick={() => {
              toggleVisibility(selectedReview);
              setIsViewModalOpen(false);
              setSelectedReview(null);
            }}
          >
            {selectedReview?.status === 'visible' ? 'Ocultar' : 'Mostrar'}
          </Button>
        </Modal.Footer>
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
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={28} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Estas seguro de eliminar esta resena de <strong>{selectedReview?.customer.name}</strong>?
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
      </Modal>
    </div>
  );
};

export default Reviews;
