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
  CheckCircle,
  XCircle,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Avatar, Dropdown } from '../../components/ui';
import MobileModal from '../../components/ui/MobileModal';
import { authFetch, ENDPOINTS } from '../../config/api';

// Hook for mobile detection
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

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

const roleTabs = [
  { key: 'all', label: 'Todos', icon: UsersIcon },
  { key: 'admin', label: 'Admins', icon: ShieldCheck },
  { key: 'business_owner', label: 'Owners', icon: Shield },
  { key: 'driver', label: 'Drivers', icon: Truck },
  { key: 'customer', label: 'Clientes', icon: User },
];

// Mobile User Card Component
const MobileUserCard = ({ user, onEdit, onAssignBusiness, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const RoleIcon = roleIcons[user.role] || User;

  const roleColorClasses = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    business_owner: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    driver: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    customer: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      <button
        onClick={() => setShowActions(!showActions)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <Avatar name={user.name || 'Usuario'} size="lg" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {user.name || 'Sin nombre'}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              <Mail size={12} />
              <span className="truncate">{user.email || '-'}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                <Phone size={12} />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${roleColorClasses[user.role] || roleColorClasses.customer}`}>
              <RoleIcon size={12} />
              {roleLabels[user.role] || user.role}
            </span>
            <ChevronRight size={18} className={`text-gray-400 transition-transform ${showActions ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {/* Business assigned */}
        {user.business && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Building2 size={14} className="text-gray-400" />
            <span>{user.business.name || 'Sin nombre'}</span>
          </div>
        )}

        {/* Registration date */}
        {user.createdAt && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={12} />
            Registrado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
          </div>
        )}
      </button>

      {/* Action drawer */}
      {showActions && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 flex gap-2 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={() => onEdit(user)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm"
          >
            <Edit2 size={16} />
            Editar
          </button>
          {user.role === 'business_owner' && (
            <button
              onClick={() => onAssignBusiness(user)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-500 rounded-xl text-sm font-medium text-white shadow-sm"
            >
              <Building2 size={16} />
              Negocio
            </button>
          )}
          <button
            onClick={() => onDelete(user)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-red-50 dark:bg-red-900/30 rounded-xl text-sm font-medium text-red-600 dark:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const Users = () => {
  const isMobile = useIsMobile();

  // State
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Fetch data
  useEffect(() => {
    fetchUsers();
    fetchBusinesses();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authFetch(ENDPOINTS.users.base);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar usuarios');
      }

      const usersData = data.users || data.response || data.data || (Array.isArray(data) ? data : []);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Error al cargar usuarios', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await authFetch(ENDPOINTS.businesses.all);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar negocios');
      }

      const businessesData = data.businesses || data.response || data.data || (Array.isArray(data) ? data : []);
      setBusinesses(businessesData);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setBusinesses([]);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (user.name || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower);

    // Mobile uses tabs, desktop uses select
    const currentRoleFilter = isMobile ? (activeTab === 'all' ? '' : activeTab) : roleFilter;
    const matchesRole = !currentRoleFilter || user.role === currentRoleFilter;

    return matchesSearch && matchesRole;
  });

  // Count by role for tabs
  const countByRole = (role) => {
    if (role === 'all') return users.length;
    return users.filter(u => u.role === role).length;
  };

  // Handlers
  const handleCreateUser = async () => {
    setFormErrors({});

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
      const response = await authFetch(ENDPOINTS.users.create, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear usuario');
      }

      showToast('Usuario creado exitosamente');
      await fetchUsers();
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating user:', error);
      showToast(error.message || 'Error al crear usuario', 'error');
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
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      };

      if (formData.password && formData.password.length >= 6) {
        updateData.password = formData.password;
      }

      const response = await authFetch(ENDPOINTS.users.byId(selectedUser._id), {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar usuario');
      }

      showToast('Usuario actualizado exitosamente');
      await fetchUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);
      resetForm();
    } catch (error) {
      console.error('Error updating user:', error);
      showToast(error.message || 'Error al actualizar usuario', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignBusiness = async (businessId) => {
    setSubmitting(true);
    try {
      const response = await authFetch(ENDPOINTS.admin.assignBusiness, {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUser._id,
          businessId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al asignar negocio');
      }

      showToast('Negocio asignado exitosamente');
      await fetchUsers();
      setIsAssignBusinessModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error assigning business:', error);
      showToast(error.message || 'Error al asignar negocio', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    setSubmitting(true);
    try {
      const response = await authFetch(ENDPOINTS.users.byId(selectedUser._id), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar usuario');
      }

      showToast('Usuario eliminado exitosamente');
      await fetchUsers();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast(error.message || 'Error al eliminar usuario', 'error');
    } finally {
      setSubmitting(false);
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
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
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

  // Form content for modals
  const renderUserForm = (isEdit = false) => (
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
        label={isEdit ? 'Nueva contrasena (dejar vacio para no cambiar)' : 'Contrasena'}
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
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 -m-4 md:-m-6">
        {/* Toast */}
        {toast.show && (
          <div className={`fixed top-4 left-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {toast.message}
          </div>
        )}

        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          {/* Title */}
          <div className="px-4 pt-4 pb-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Usuarios
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {filteredUsers.length} de {users.length} usuarios
            </p>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Role Tabs */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {roleTabs.map((tab) => {
                const Icon = tab.icon;
                const count = countByRole(tab.key);
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-indigo-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="p-4 space-y-3 pb-24">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || activeTab !== 'all'
                  ? 'No se encontraron usuarios'
                  : 'No hay usuarios registrados'
                }
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <MobileUserCard
                key={user._id}
                user={user}
                onEdit={openEditModal}
                onAssignBusiness={openAssignBusinessModal}
                onDelete={openDeleteModal}
              />
            ))
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-50"
        >
          <Plus size={24} />
        </button>

        {/* Create Modal */}
        <MobileModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetForm();
          }}
          title="Nuevo Usuario"
          description="Crea un nuevo usuario en la plataforma"
          size="lg"
        >
          {renderUserForm(false)}
          <MobileModal.Footer>
            <Button variant="ghost" onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} loading={submitting}>
              Crear Usuario
            </Button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Edit Modal */}
        <MobileModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
            resetForm();
          }}
          title="Editar Usuario"
          description={selectedUser?.name}
          size="lg"
        >
          {renderUserForm(true)}
          <MobileModal.Footer>
            <Button variant="ghost" onClick={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser} loading={submitting}>
              Guardar
            </Button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Assign Business Modal */}
        <MobileModal
          isOpen={isAssignBusinessModalOpen}
          onClose={() => {
            setIsAssignBusinessModalOpen(false);
            setSelectedUser(null);
          }}
          title="Asignar Negocio"
          description={selectedUser?.name}
          size="md"
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
                  key={business._id}
                  onClick={() => handleAssignBusiness(business._id)}
                  disabled={submitting}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <Building2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{business.name}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              ))
            )}
          </div>
        </MobileModal>

        {/* Delete Modal */}
        <MobileModal
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
          <MobileModal.Footer>
            <Button variant="ghost" onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedUser(null);
            }}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteUser} loading={submitting}>
              Eliminar
            </Button>
          </MobileModal.Footer>
        </MobileModal>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {toast.message}
        </div>
      )}

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
                <Table.Row key={user._id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name || 'Usuario'} size="md" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.name || 'Sin nombre'}
                        </p>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Mail size={14} className="text-gray-400" />
                        {user.email || '-'}
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
                    <Badge variant={roleColors[user.role] || 'default'} size="sm">
                      <span className="flex items-center gap-1.5">
                        <RoleIcon role={user.role} />
                        {roleLabels[user.role] || user.role}
                      </span>
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {user.business ? (
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {user.business.name || 'Sin nombre'}
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
        {renderUserForm(false)}
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
        {renderUserForm(true)}
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
                key={business._id}
                onClick={() => handleAssignBusiness(business._id)}
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
