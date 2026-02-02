import { MessageCircle, Construction, Bell } from 'lucide-react';

export default function WhatsAppChatbotRecovery() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle size={56} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <Construction size={24} className="text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ChatBot de WhatsApp
        </h1>

        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-6">
          <Bell size={16} />
          Proximamente
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Estamos trabajando en la integracion con WhatsApp Business API para que puedas automatizar
          mensajes a tus clientes: confirmaciones de pedido, actualizaciones de estado,
          promociones y mas.
        </p>

        {/* Features preview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm text-left">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Funciones que vienen:
          </h3>
          <ul className="space-y-3">
            {[
              'Mensajes automaticos de confirmacion de pedido',
              'Notificaciones de estado (preparando, en camino, entregado)',
              'Recuperacion de carritos abandonados',
              'Mensajes de bienvenida para nuevos clientes',
              'Envio de promociones y descuentos',
            ].map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                </div>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Te notificaremos cuando esta funcion este disponible.
        </p>
      </div>
    </div>
  );
}
