import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Percent,
  DollarSign,
  Calendar,
  Building2,
  Copy,
  CheckCircle,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Dropdown } from '../../components/ui';

// Mock data
const mockDiscounts = [
  {
    id: 1,
    code: 'BIENVENIDO20',
    type: 'percentage',
    value: 20,
    business: null,
    businessName: 'Todos los negocios',
    usageCount: 156,
    usageLimit: 500,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    status: 'active',
    minOrder: 100,
  },
  {
    id: 2,
    code: 'PIZZA50',
    type: 'fixed',
    value: 50,
    business: 2,
    businessName: 'Pizza Express',
    usageCount: 89,
    usageLimit: 200,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'active',
    minOrder: 150,
  },
  {
    id: 3,
    code: 'SUSHI15',
    type: 'percentage',
    value: 15,
    business: 3,
    businessName: 'Sushi Master',
    usageCount: 200,
    usageLimit: 200,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    status: 'expired',
    minOrder: 200,
  },
  {
    id: 4,
    code: 'ENVIOGRATIS',
    type: 'fixed',
    value: 35,
    business: null,
    businessName: 'Todos los negocios',
    usageCount: 45,
    usageLimit: null,
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    status: 'active',
    minOrder: 250,
  },
  {
    id: 5,
    code: 'PROMO10',
    type: 'percentage',
    value: 10,
    business: 1,
    businessName: 'El Buen Sabor',
    usageCount: 0,
    usageLimit: 100,
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    status: 'scheduled',
    minOrder: 0,
  },
];

const mockBusinesses = [
  { value: '', label: 'Todos los negocios' },
  { value: '1', label: 'El Buen Sabor' },
  { value: '2', label: 'Pizza Express' },
  { value: '3', label: 'Sushi Master' },
  { value: '4', label: 'Taqueria Don Jose' },
  { value: '5', label: 'Cafe Central' },
];

const statusConfig = {
  active: { label: 'Activo', color: 'success' },
  expired: { label: 'Expirado', color: 'default' },
  scheduled: { label: 'Programado', color: 'info' },
  disabled: { label: 'Deshabilitado', color: 'danger' },
};

const Discounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    business: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    minOrder: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDiscounts(mockDiscounts);
      setLoading(false);
    }, 500);
  }, []);

  // Filter discounts
  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch = discount.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || discount.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleSubmit = async () => {
    setFormErrors({});

    const errors = {};
    if (!formData.code.trim()) errors.code = 'El codigo es requerido';
    if (!formData.value || formData.value <= 0) errors.value = 'El valor debe ser mayor a 0';
    if (formData.type === 'percentage' && formData.value > 100) {
      errors.value = 'El porcentaje no puede ser mayor a 100';
    }
    if (!formData.startDate) errors.startDate = 'La fecha de inicio es requerida';
    if (!formData.endDate) errors.endDate = 'La fecha de fin es requerida';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newDiscount = {
      id: editingDiscount?.id || Date.now(),
      ...formData,
      code: formData.code.toUpperCase(),
      value: parseFloat(formData.value),
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      minOrder: formData.minOrder ? parseFloat(formData.minOrder) : 0,
      usageCount: editingDiscount?.usageCount || 0,
      businessName: formData.business
        ? mockBusinesses.find((b) => b.value === formData.business)?.label
        : 'Todos los negocios',
      status: new Date(formData.startDate) > new Date() ? 'scheduled' : 'active',
    };

    if (editingDiscount) {
      setDiscounts(discounts.map((d) => (d.id === editingDiscount.id ? newDiscount : d)));
    } else {
      setDiscounts([...discounts, newDiscount]);
    }

    setSubmitting(false);
    closeModal();
  };

  const handleDelete = async () => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setDiscounts(discounts.filter((d) => d.id !== selectedDiscount.id));
    setSubmitting(false);
    setIsDeleteModalOpen(false);
    setSelectedDiscount(null);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreateModal = () => {
    setEditingDiscount(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      business: '',
      usageLimit: '',
      startDate: '',
      endDate: '',
      minOrder: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      type: discount.type,
      value: discount.value.toString(),
      business: discount.business?.toString() || '',
      usageLimit: discount.usageLimit?.toString() || '',
      startDate: discount.startDate,
      endDate: discount.endDate,
      minOrder: discount.minOrder?.toString() || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteModal = (discount) => {
    setSelectedDiscount(discount);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDiscount(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      business: '',
      usageLimit: '',
      startDate: '',
      endDate: '',
      minOrder: '',
    });
    setFormErrors({});
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Codigos de Descuento
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los codigos promocionales de la plataforma
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={openCreateModal}>
          Nuevo Descuento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por codigo..."
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'active', label: 'Activo' },
              { value: 'scheduled', label: 'Programado' },
              { value: 'expired', label: 'Expirado' },
              { value: 'disabled', label: 'Deshabilitado' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder=""
            fullWidth={false}
            className="w-44"
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <Table>
          <Table.Head>
            <Table.Row hover={false}>
              <Table.Header>Codigo</Table.Header>
              <Table.Header>Descuento</Table.Header>
              <Table.Header>Negocio</Table.Header>
              <Table.Header>Usos</Table.Header>
              <Table.Header>Vigencia</Table.Header>
              <Table.Header>Estado</Table.Header>
              <Table.Header align="right">Acciones</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {loading ? (
              <Table.Loading colSpan={7} />
            ) : filteredDiscounts.length === 0 ? (
              <Table.Empty
                colSpan={7}
                message={searchQuery || statusFilter
                  ? 'No se encontraron descuentos con los filtros aplicados'
                  : 'No hay codigos de descuento registrados'
                }
              />
            ) : (
              filteredDiscounts.map((discount) => (
                <Table.Row key={discount.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-mono text-sm font-semibold">
                        {discount.code}
                      </code>
                      <button
                        onClick={() => copyCode(discount.code)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Copiar codigo"
                      >
                        {copiedCode === discount.code ? (
                          <CheckCircle size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      {discount.type === 'percentage' ? (
                        <Percent size={16} className="text-purple-500" />
                      ) : (
                        <DollarSign size={16} className="text-emerald-500" />
                      )}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                      </span>
                    </div>
                    {discount.minOrder > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Min. ${discount.minOrder}
                      </p>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {discount.businessName}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {discount.usageCount}
                      </span>
                      <span className="text-gray-500">
                        {discount.usageLimit ? ` / ${discount.usageLimit}` : ' / ∞'}
                      </span>
                    </div>
                    {discount.usageLimit && (
                      <div className="w-20 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mt-1">
                        <div
                          className="h-1.5 bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min((discount.usageCount / discount.usageLimit) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">{formatDate(discount.startDate)}</p>
                      <p className="text-gray-500">al {formatDate(discount.endDate)}</p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={statusConfig[discount.status]?.color} size="sm" dot>
                      {statusConfig[discount.status]?.label}
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
                            icon={<Edit2 size={16} />}
                            onClick={() => {
                              close();
                              openEditModal(discount);
                            }}
                          >
                            Editar
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            icon={<Trash2 size={16} />}
                            danger
                            onClick={() => {
                              close();
                              openDeleteModal(discount);
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingDiscount ? 'Editar Descuento' : 'Nuevo Descuento'}
        description={editingDiscount ? `Editando: ${editingDiscount.code}` : 'Crea un nuevo codigo de descuento'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Codigo de descuento"
            placeholder="Ej: PROMO20"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            error={formErrors.code}
            helperText="Solo letras mayusculas y numeros"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo de descuento"
              options={[
                { value: 'percentage', label: 'Porcentaje (%)' },
                { value: 'fixed', label: 'Monto fijo ($)' },
              ]}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            />
            <Input
              label={formData.type === 'percentage' ? 'Porcentaje' : 'Monto'}
              type="number"
              placeholder={formData.type === 'percentage' ? 'Ej: 20' : 'Ej: 50'}
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              error={formErrors.value}
              rightIcon={formData.type === 'percentage' ? <Percent size={16} /> : <DollarSign size={16} />}
            />
          </div>

          <Select
            label="Aplicar a"
            options={mockBusinesses}
            value={formData.business}
            onChange={(e) => setFormData({ ...formData, business: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Limite de usos (opcional)"
              type="number"
              placeholder="Sin limite"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
            />
            <Input
              label="Orden minima (opcional)"
              type="number"
              placeholder="0"
              value={formData.minOrder}
              onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
              leftIcon={<DollarSign size={16} />}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha de inicio"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              error={formErrors.startDate}
            />
            <Input
              label="Fecha de fin"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              error={formErrors.endDate}
            />
          </div>
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={closeModal}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            {editingDiscount ? 'Guardar Cambios' : 'Crear Descuento'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDiscount(null);
        }}
        title="Eliminar Descuento"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={28} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Estas seguro de eliminar el codigo <strong>{selectedDiscount?.code}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Esta accion no se puede deshacer.
          </p>
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsDeleteModalOpen(false);
            setSelectedDiscount(null);
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

export default Discounts;
