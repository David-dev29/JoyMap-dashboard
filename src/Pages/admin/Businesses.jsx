import { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit2,
  UserPlus,
  Power,
  Trash2,
  Store,
  Truck,
  UtensilsCrossed,
  X,
  Upload,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Avatar, Dropdown } from '../../components/ui';
import api from '../../config/api';

const categoryIcons = {
  food: UtensilsCrossed,
  store: Store,
  delivery: Truck,
};

const categoryLabels = {
  food: 'Comida',
  store: 'Tienda',
  delivery: 'Envio',
};

const categoryColors = {
  food: 'warning',
  store: 'primary',
  delivery: 'info',
};

const Businesses = () => {
  // State
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignOwnerModalOpen, setIsAssignOwnerModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [availableOwners, setAvailableOwners] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'food',
    description: '',
    address: '',
    phone: '',
    email: '',
    logo: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch businesses
  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/businesses');
      setBusinesses(response.data.businesses || response.data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      // Mock data for development
      setBusinesses([
        { id: 1, name: 'El Buen Sabor', category: 'food', owner: { name: 'Juan Perez', email: 'juan@email.com' }, status: 'active', logo: null },
        { id: 2, name: 'Pizza Express', category: 'food', owner: { name: 'Maria Garcia', email: 'maria@email.com' }, status: 'active', logo: null },
        { id: 3, name: 'Tienda Central', category: 'store', owner: null, status: 'inactive', logo: null },
        { id: 4, name: 'Envios Rapidos', category: 'delivery', owner: { name: 'Carlos Lopez', email: 'carlos@email.com' }, status: 'active', logo: null },
        { id: 5, name: 'Sushi Master', category: 'food', owner: null, status: 'active', logo: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableOwners = async () => {
    try {
      const response = await api.get('/users?role=business_owner&unassigned=true');
      setAvailableOwners(response.data.users || response.data || []);
    } catch (error) {
      // Mock data
      setAvailableOwners([
        { id: 1, name: 'Pedro Sanchez', email: 'pedro@email.com' },
        { id: 2, name: 'Ana Martinez', email: 'ana@email.com' },
        { id: 3, name: 'Luis Rodriguez', email: 'luis@email.com' },
      ]);
    }
  };

  // Filter businesses
  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || business.category === categoryFilter;
    const matchesStatus = !statusFilter || business.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handlers
  const handleCreateBusiness = async () => {
    setFormErrors({});

    // Validation
    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.category) errors.category = 'La categoria es requerida';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/businesses/create', formData);
      await fetchBusinesses();
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating business:', error);
      // For development, add to local state
      const newBusiness = {
        id: Date.now(),
        ...formData,
        status: 'active',
        owner: null,
      };
      setBusinesses([...businesses, newBusiness]);
      setIsCreateModalOpen(false);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBusiness = async () => {
    setFormErrors({});

    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/businesses/${selectedBusiness.id}`, formData);
      await fetchBusinesses();
      setIsEditModalOpen(false);
      setSelectedBusiness(null);
      resetForm();
    } catch (error) {
      // Update local state
      setBusinesses(businesses.map(b =>
        b.id === selectedBusiness.id ? { ...b, ...formData } : b
      ));
      setIsEditModalOpen(false);
      setSelectedBusiness(null);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignOwner = async (ownerId) => {
    setSubmitting(true);
    try {
      await api.post('/admin/assign-business', {
        businessId: selectedBusiness.id,
        userId: ownerId,
      });
      await fetchBusinesses();
    } catch (error) {
      // Update local state
      const owner = availableOwners.find(o => o.id === ownerId);
      setBusinesses(businesses.map(b =>
        b.id === selectedBusiness.id ? { ...b, owner } : b
      ));
    } finally {
      setSubmitting(false);
      setIsAssignOwnerModalOpen(false);
      setSelectedBusiness(null);
    }
  };

  const handleToggleStatus = async (business) => {
    const newStatus = business.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/businesses/${business.id}`, { status: newStatus });
      await fetchBusinesses();
    } catch (error) {
      setBusinesses(businesses.map(b =>
        b.id === business.id ? { ...b, status: newStatus } : b
      ));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'food',
      description: '',
      address: '',
      phone: '',
      email: '',
      logo: '',
    });
    setFormErrors({});
  };

  const openEditModal = (business) => {
    setSelectedBusiness(business);
    setFormData({
      name: business.name,
      category: business.category,
      description: business.description || '',
      address: business.address || '',
      phone: business.phone || '',
      email: business.email || '',
      logo: business.logo || '',
    });
    setIsEditModalOpen(true);
  };

  const openAssignOwnerModal = (business) => {
    setSelectedBusiness(business);
    fetchAvailableOwners();
    setIsAssignOwnerModalOpen(true);
  };

  const openViewModal = (business) => {
    setSelectedBusiness(business);
    setIsViewModalOpen(true);
  };

  const CategoryIcon = ({ category }) => {
    const Icon = categoryIcons[category] || Store;
    return <Icon size={16} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion de Negocios
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Administra todos los negocios de la plataforma
          </p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          Nuevo Negocio
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre..."
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select
              options={[
                { value: '', label: 'Todas las categorias' },
                { value: 'food', label: 'Comida' },
                { value: 'store', label: 'Tienda' },
                { value: 'delivery', label: 'Envio' },
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder=""
              fullWidth={false}
              className="w-44"
            />
            <Select
              options={[
                { value: '', label: 'Todos los estados' },
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder=""
              fullWidth={false}
              className="w-40"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <Table>
          <Table.Head>
            <Table.Row hover={false}>
              <Table.Header>Negocio</Table.Header>
              <Table.Header>Categoria</Table.Header>
              <Table.Header>Owner Asignado</Table.Header>
              <Table.Header>Estado</Table.Header>
              <Table.Header align="right">Acciones</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {loading ? (
              <Table.Loading colSpan={5} />
            ) : filteredBusinesses.length === 0 ? (
              <Table.Empty
                colSpan={5}
                message={searchQuery || categoryFilter || statusFilter
                  ? 'No se encontraron negocios con los filtros aplicados'
                  : 'No hay negocios registrados'
                }
              />
            ) : (
              filteredBusinesses.map((business) => (
                <Table.Row key={business.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={business.name}
                        src={business.logo}
                        size="md"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {business.name}
                        </p>
                        {business.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {business.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={categoryColors[business.category]} size="sm">
                      <span className="flex items-center gap-1.5">
                        <CategoryIcon category={business.category} />
                        {categoryLabels[business.category]}
                      </span>
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {business.owner ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={business.owner.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {business.owner.name}
                          </p>
                          <p className="text-xs text-gray-500">{business.owner.email}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm italic">Sin asignar</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant={business.status === 'active' ? 'success' : 'default'}
                      dot
                      size="sm"
                    >
                      {business.status === 'active' ? 'Activo' : 'Inactivo'}
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
                            icon={<Eye size={16} />}
                            onClick={() => {
                              close();
                              openViewModal(business);
                            }}
                          >
                            Ver detalles
                          </Dropdown.Item>
                          <Dropdown.Item
                            icon={<Edit2 size={16} />}
                            onClick={() => {
                              close();
                              openEditModal(business);
                            }}
                          >
                            Editar
                          </Dropdown.Item>
                          <Dropdown.Item
                            icon={<UserPlus size={16} />}
                            onClick={() => {
                              close();
                              openAssignOwnerModal(business);
                            }}
                          >
                            Asignar Owner
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            icon={<Power size={16} />}
                            onClick={() => {
                              close();
                              handleToggleStatus(business);
                            }}
                          >
                            {business.status === 'active' ? 'Desactivar' : 'Activar'}
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

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {filteredBusinesses.length} de {businesses.length} negocios
        </p>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Negocio"
        description="Agrega un nuevo negocio a la plataforma"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del negocio"
              placeholder="Ej: Restaurante El Buen Sabor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />
            <Select
              label="Categoria"
              options={[
                { value: 'food', label: 'Comida' },
                { value: 'store', label: 'Tienda' },
                { value: 'delivery', label: 'Envio' },
              ]}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              error={formErrors.category}
            />
          </div>
          <Input
            label="Descripcion"
            placeholder="Descripcion breve del negocio..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Direccion"
            placeholder="Direccion del negocio"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefono"
              placeholder="+52 999 123 4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="contacto@negocio.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateBusiness} loading={submitting}>
            Crear Negocio
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBusiness(null);
          resetForm();
        }}
        title="Editar Negocio"
        description={`Editando: ${selectedBusiness?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del negocio"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />
            <Select
              label="Categoria"
              options={[
                { value: 'food', label: 'Comida' },
                { value: 'store', label: 'Tienda' },
                { value: 'delivery', label: 'Envio' },
              ]}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <Input
            label="Descripcion"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Direccion"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsEditModalOpen(false);
            setSelectedBusiness(null);
            resetForm();
          }}>
            Cancelar
          </Button>
          <Button onClick={handleEditBusiness} loading={submitting}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Assign Owner Modal */}
      <Modal
        isOpen={isAssignOwnerModalOpen}
        onClose={() => {
          setIsAssignOwnerModalOpen(false);
          setSelectedBusiness(null);
        }}
        title="Asignar Owner"
        description={`Selecciona un owner para: ${selectedBusiness?.name}`}
      >
        <div className="space-y-2">
          {availableOwners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserPlus size={40} className="mx-auto mb-3 opacity-50" />
              <p>No hay owners disponibles</p>
              <p className="text-sm">Crea un usuario con rol "business_owner" primero</p>
            </div>
          ) : (
            availableOwners.map((owner) => (
              <button
                key={owner.id}
                onClick={() => handleAssignOwner(owner.id)}
                disabled={submitting}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <Avatar name={owner.name} size="md" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{owner.name}</p>
                  <p className="text-sm text-gray-500">{owner.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedBusiness(null);
        }}
        title="Detalles del Negocio"
        size="lg"
      >
        {selectedBusiness && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={selectedBusiness.name} size="xl" src={selectedBusiness.logo} />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedBusiness.name}
                </h3>
                <Badge variant={categoryColors[selectedBusiness.category]} className="mt-1">
                  <span className="flex items-center gap-1.5">
                    <CategoryIcon category={selectedBusiness.category} />
                    {categoryLabels[selectedBusiness.category]}
                  </span>
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Estado</label>
                <p className="mt-1">
                  <Badge
                    variant={selectedBusiness.status === 'active' ? 'success' : 'default'}
                    dot
                  >
                    {selectedBusiness.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Owner</label>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {selectedBusiness.owner?.name || 'Sin asignar'}
                </p>
              </div>
              {selectedBusiness.address && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Direccion</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedBusiness.address}</p>
                </div>
              )}
              {selectedBusiness.phone && (
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Telefono</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedBusiness.phone}</p>
                </div>
              )}
              {selectedBusiness.email && (
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedBusiness.email}</p>
                </div>
              )}
            </div>
          </div>
        )}
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsViewModalOpen(false);
            setSelectedBusiness(null);
          }}>
            Cerrar
          </Button>
          <Button onClick={() => {
            setIsViewModalOpen(false);
            openEditModal(selectedBusiness);
          }}>
            Editar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Businesses;
