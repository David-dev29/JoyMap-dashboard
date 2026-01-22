import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">404</h1>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Pagina no encontrada
      </h2>

      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        Lo sentimos, la pagina que buscas no existe o ha sido movida.
      </p>

      <div className="flex gap-4">
        <Button
          variant="secondary"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
        >
          Volver atras
        </Button>
        <Button
          leftIcon={<Home size={16} />}
          onClick={() => navigate('/')}
        >
          Ir al inicio
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
