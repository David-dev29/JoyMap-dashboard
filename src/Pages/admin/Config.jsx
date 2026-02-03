import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Grid3X3,
  Settings,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { authFetch, ENDPOINTS } from '../../config/api';
import { useIsMobile } from '../../hooks/useIsMobile';

// Config Section Item Component
const ConfigItem = ({ icon: Icon, iconColor, title, description, count, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card text-left active:scale-[0.98] transition-transform"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {count !== undefined && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
              {count}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
      <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
    </div>
  </button>
);

const Config = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);

  // Counters state
  const [usersCount, setUsersCount] = useState(null);
  const [categoriesCount, setCategoriesCount] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch counts
  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        // Fetch users count
        const usersResponse = await authFetch(ENDPOINTS.users.base);
        const usersData = await usersResponse.json();
        if (usersResponse.ok) {
          const usersList = usersData.users || usersData.response || usersData.data || [];
          setUsersCount(Array.isArray(usersList) ? usersList.length : 0);
        }

        // Fetch categories count
        const categoriesResponse = await authFetch(ENDPOINTS.businessCategories.base);
        const categoriesData = await categoriesResponse.json();
        if (categoriesResponse.ok) {
          const categoriesList = categoriesData.categories || categoriesData.response || categoriesData.data || [];
          setCategoriesCount(Array.isArray(categoriesList) ? categoriesList.length : 0);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Config sections
  const sections = [
    {
      id: 'users',
      icon: Users,
      iconColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      title: 'Gestion de Usuarios',
      description: 'Administra admins, owners, drivers y clientes',
      count: usersCount,
      path: '/admin/users',
    },
    {
      id: 'categories',
      icon: Grid3X3,
      iconColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      title: 'Categorias de Negocios',
      description: 'Comida, tiendas, envios y mas',
      count: categoriesCount,
      path: '/admin/categories',
    },
    {
      id: 'settings',
      icon: Settings,
      iconColor: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
      title: 'Configuracion de Plataforma',
      description: 'Branding, delivery, redes sociales',
      count: undefined,
      path: '/admin/settings',
    },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isMobile ? '-m-4' : ''}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Configuracion</h1>
              <p className="text-sm text-gray-500">Gestiona usuarios y ajustes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Config Sections */}
      <div className="p-4 space-y-3 pb-24">
        {loading ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          sections.map(section => (
            <ConfigItem
              key={section.id}
              icon={section.icon}
              iconColor={section.iconColor}
              title={section.title}
              description={section.description}
              count={section.count}
              onClick={() => navigate(section.path)}
            />
          ))
        )}
      </div>

      {/* Desktop Layout - Grid */}
      {!isMobile && (
        <div className="hidden md:block p-6">
          <div className="grid grid-cols-3 gap-6">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => navigate(section.path)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card text-left hover:shadow-lg transition-shadow"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${section.iconColor}`}>
                    <Icon size={28} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                    {section.count !== undefined && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-full">
                        {section.count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Config;
