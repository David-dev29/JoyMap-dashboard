import { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Building2,
  Shield,
  ShieldCheck,
  Truck,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Avatar, Dropdown } from '../../components/ui';
import api from '../../config/api';

const roleIcons = {
  admin: ShieldCheck,
  business_owner: Shield,
  driver: Truck,
  customer: User,
};

const roleLabels = {
  admin: 'Administrador',
  business_owner: 'Owner de Negocio',
  driver: 'Repartidor',
  customer: 'Cliente',
};

const roleColors = {
  admin: 'danger',
  business_owner: 'primary',
  driver: 'info',
  customer: 'default',
};

const Users = () => {
  // State
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignBusinessModalOpen, setIsAssignBusinessModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchUsers();
    fetchBusinesses();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data.users || response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Mock data
      setUsers([
        { id: 1, name: 'Admin Principal', email: 'admin@joymap.com', phone: '+52 999 111 2222', role: 'admin', business: null },
        { id: 2, name: 'Juan Perez', email: 'juan@email.com', phone: '+52 999 123 4567', role: 'business_owner', business: { id: 1, name: 'El Buen Sabor' } },
        { id: 3, name: 'Maria Garcia', email: 'maria@email.com', phone: '+52 999 234 5678', role: 'business_owner', business: { id: 2, name: 'Pizza Express' } },
        { id: 4, name: 'Carlos Lopez', email: 'carlos@email.com', phone: '+52 999 345 6789', role: 'driver', business: null },
        { id: 5, name: 'Ana Martinez', email: 'ana@email.com', phone: '+52 999 456 7890', role: 'customer', business: null },
        { id: 6, name: 'Pedro Sanchez', email: 'pedro@email.com', phone: '+52 999 567 8901', role: 'business_owner', business: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await api.get('/businesses');
      setBusinesses(response.data.businesses || response.data || []);
    } catch (error) {
      // Mock data
      setBusinesses([
        { id: 1, name: 'El Buen Sabor' },
        { id: 2, name: 'Pizza Express' },
        { id: 3, name: 'Tienda Central' },
        { id: 4, name: 'Sushi Master' },
      ]);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower);
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handlers
  const handleCreateUser = async () => {
    setFormErrors({});

    // Validation
    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.email.trim()) errors.email = 'El email es requerido';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email invalido';
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'La contrasena debe tener al menos 6 caracteres';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/users/create', formData);
      await fetchUsers();
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      // Add to local state
      const newUser = {
        id: Date.now(),
        ...formData,
        business: null,
      };
      setUsers([...users, newUser]);
      setIsCreateModalOpen(false);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    setFormErrors({});

    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.email.trim()) errors.email = 'El email es requerido';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email invalido';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/users/${selectedUser.id}`, formData);
      await fetchUsers();
    } catch (error) {
      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, ...formData } : u
      ));
    } finally {
      setSubmitting(false);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      resetForm();
    }
  };

  const handleAssignBusiness = async (businessId) => {
    setSubmitting(true);
    try {
      await api.post('/admin/assign-business', {
        userId: selectedUser.id,
        businessId,
      });
      await fetchUsers();
    } catch (error) {
      const business = businesses.find(b => b.id === businessId);
      setUsers(users.map(u =>
        u.id === selectedUser.id ? { ...u, business } : u
      ));
    } finally {
      setSubmitting(false);
      setIsAssignBusinessModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/users/${selectedUser.id}`);
      await fetchUsers();
    } catch (error) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
    } finally {
      setSubmitting(false);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      password: '',
    });
    setFormErrors({});
    setShowPassword(false);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '',
    });
    setIsEditModalOpen(true);
  };

  const openAssignBusinessModal = (user) => {
    setSelectedUser(user);
    setIsAssignBusinessModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const RoleIcon = ({ role }) => {
    const Icon = roleIcons[role] || User;
    return <Icon size={14} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion de Usuarios
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Administra todos los usuarios de la plataforma
          </p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          Nuevo Usuario
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o email..."
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            options={[
              { value: '', label: 'Todos los roles' },
              { value: 'admin', label: 'Administrador' },
              { value: 'business_owner', label: 'Owner de Negocio' },
              { value: 'driver', label: 'Repartidor' },
              { value: 'customer', label: 'Cliente' },
            ]}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            placeholder=""
            fullWidth={false}
            className="w-48"
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <Table>
          <Table.Head>
            <Table.Row hover={false}>
              <Table.Header>Usuario</Table.Header>
              <Table.Header>Contacto</Table.Header>
              <Table.Header>Rol</Table.Header>
              <Table.Header>Negocio Asignado</Table.Header>
              <Table.Header align="right">Acciones</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {loading ? (
              <Table.Loading colSpan={5} />
            ) : filteredUsers.length === 0 ? (
              <Table.Empty
                colSpan={5}
                message={searchQuery || roleFilter
                  ? 'No se encontraron usuarios con los filtros aplicados'
                  : 'No hay usuarios registrados'
                }
              />
            ) : (
              filteredUsers.map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="md" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Mail size={14} className="text-gray-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Phone size={14} className="text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={roleColors[user.role]} size="sm">
                      <span className="flex items-center gap-1.5">
                        <RoleIcon role={user.role} />
                        {roleLabels[user.role]}
                      </span>
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {user.business ? (
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {user.business.name}
                        </span>
                      </div>
                    ) : user.role === 'business_owner' ? (
                      <button
                        onClick={() => openAssignBusinessModal(user)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                      >
                        + Asignar negocio
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
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
                              openEditModal(user);
                            }}
                          >
                            Editar
                          </Dropdown.Item>
                          {user.role === 'business_owner' && (
                            <Dropdown.Item
                              icon={<Building2 size={16} />}
                              onClick={() => {
                                close();
                                openAssignBusinessModal(user);
                              }}
                            >
                              Asignar negocio
                            </Dropdown.Item>
                          )}
                          <Dropdown.Divider />
                          <Dropdown.Item
                            icon={<Trash2 size={16} />}
                            danger
                            onClick={() => {
                              close();
                              openDeleteModal(user);
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

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {filteredUsers.length} de {users.length} usuarios
        </p>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Nuevo Usuario"
        description="Crea un nuevo usuario en la plataforma"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nombre completo"
            placeholder="Ej: Juan Perez"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
          />
          <Input
            label="Email"
            type="email"
            placeholder="usuario@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
          />
          <Input
            label="Telefono"
            placeholder="+52 999 123 4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Select
            label="Rol"
            options={[
              { value: 'customer', label: 'Cliente' },
              { value: 'driver', label: 'Repartidor' },
              { value: 'business_owner', label: 'Owner de Negocio' },
              { value: 'admin', label: 'Administrador' },
            ]}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
          <Input
            label="Contrasena"
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimo 6 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={formErrors.password}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsCreateModalOpen(false);
            resetForm();
          }}>
            Cancelar
          </Button>
          <Button onClick={handleCreateUser} loading={submitting}>
            Crear Usuario
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
          resetForm();
        }}
        title="Editar Usuario"
        description={`Editando: ${selectedUser?.name}`}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
          />
          <Input
            label="Telefono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Select
            label="Rol"
            options={[
              { value: 'customer', label: 'Cliente' },
              { value: 'driver', label: 'Repartidor' },
              { value: 'business_owner', label: 'Owner de Negocio' },
              { value: 'admin', label: 'Administrador' },
            ]}
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
          <Input
            label="Nueva contrasena (dejar vacio para no cambiar)"
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimo 6 caracteres"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
            resetForm();
          }}>
            Cancelar
          </Button>
          <Button onClick={handleEditUser} loading={submitting}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Assign Business Modal */}
      <Modal
        isOpen={isAssignBusinessModalOpen}
        onClose={() => {
          setIsAssignBusinessModalOpen(false);
          setSelectedUser(null);
        }}
        title="Asignar Negocio"
        description={`Selecciona un negocio para: ${selectedUser?.name}`}
      >
        <div className="space-y-2">
          {businesses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 size={40} className="mx-auto mb-3 opacity-50" />
              <p>No hay negocios disponibles</p>
            </div>
          ) : (
            businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => handleAssignBusiness(business.id)}
                disabled={submitting}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <Building2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{business.name}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        title="Eliminar Usuario"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={28} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Estas seguro de eliminar al usuario <strong>{selectedUser?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Esta accion no se puede deshacer.
          </p>
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
          }}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteUser} loading={submitting}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users;
