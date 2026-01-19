import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import TemplateList from './TemplateList';
import TemplateEditor from './TemplateEditor';
import WhatsAppPreview from './WhatsAppPreview';
import OrderUpdatesComponent from './OrderUpdatesComponent';

export default function WhatsAppChatbotRecovery() {
  const [activeTemplate, setActiveTemplate] = useState('abandoned-cart');

  // --- Plantillas ---
  const [templates, setTemplates] = useState({
    'abandoned-cart': {
      enabled: true,
      message:
        'Hola 👋 {client.name}\nNotamos que dejaste tu pedido a medio camino 🛍️ 😊\n\n¡No te pierdas lo que elegiste! Completa tu compra aquí 🛒:\n{company.url_products}',
    },
    'new-customer': {
      enabled: false,
      message:
        'Hola {client.name}! 🎉 Han pasado un par de días desde tu primer pedido en {company.name}...',
    },
    welcome: {
      enabled: true,
      message:
        '👋 Hola, {client.name} ¡Bienvenido/a a {company.name}! Estamos aquí para asegurarnos...',
    },
    absence: {
      enabled: true,
      message:
        '👋 Hola, {client.name} Actualmente estamos fuera de nuestro horario de atención. 🕐 📞 Nuestro...',
    },
    order: {
      enabled: true,
      message:
        '{email} 🎉 Para hacer tu pedido, entra en el siguiente enlace y elige tus platos favoritos: 🍴 Ha...',
    },
    promotions: {
      enabled: true,
      message:
        'Grandes noticias 😍🎉 Tenemos increíbles promociones esperándote. Aprovecha ahora y...',
    },
    information: {
      enabled: true,
      message:
        '¡Claro! Encuentra toda la información sobre nuestro restaurante, incluyendo horario, servicios de enteg...',
    },
    hours: {
      enabled: true,
      message:
        '🕐 Aquí está nuestro horario de atención: {company.business_hours} Estamos disponibles...',
    },
  });

  const templateConfig = {
    'abandoned-cart': {
      title: 'Carrito abandonado',
      subtitle:
        'Hola 👋 {client.name} Notamos que dejaste tu pedido a medio camino 🛍️ 😊 ...No te pierdas lo qu...',
      icon: '🛍️',
      color: 'text-blue-600',
    },
    'new-customer': {
      title: 'Descuento para nuevos clientes',
      subtitle:
        'Hola {client.name}! 🎉 Han pasado un par de días desde tu primer pedido en {company.name}...',
      icon: '🎉',
      color: 'text-gray-600',
    },
    welcome: {
      title: 'Mensaje de bienvenida',
      subtitle:
        '👋 Hola, {client.name} ¡Bienvenido/a a {company.name}! Estamos aquí para asegurarmos...',
      icon: '👋',
      color: 'text-gray-600',
    },
    absence: {
      title: 'Mensaje de ausencia',
      subtitle:
        '👋 Hola, {client.name} Actualmente estamos fuera de nuestro horario de atención. 🕐 📞 Nuestro...',
      icon: '👋',
      color: 'text-gray-600',
    },
    order: {
      title: 'Mensaje para hacer un pedido',
      subtitle:
        '{email} 🎉 Para hacer tu pedido, entra en el siguiente enlace y elige tus platos favoritos: 🍴 Ha...',
      icon: '🎉',
      color: 'text-gray-600',
    },
    promotions: {
      title: 'Mensaje de promociones',
      subtitle:
        'Grandes noticias 😍🎉 Tenemos increíbles promociones esperándote. Aprovecha ahora y...',
      icon: '😍',
      color: 'text-gray-600',
    },
    information: {
      title: 'Mensaje de información',
      subtitle:
        '¡Claro! Encuentra toda la información sobre nuestro restaurante, incluyendo horario, servicios de enteg...',
      icon: 'ℹ️',
      color: 'text-gray-600',
    },
    hours: {
      title: 'Mensaje de horario de apertura',
      subtitle:
        '🕐 Aquí está nuestro horario de atención: {company.business_hours} Estamos disponibles...',
      icon: '🕐',
      color: 'text-gray-600',
    },
  };

  // --- Estados de pedidos ---
  const [orderStatuses, setOrderStatuses] = useState({
    received: {
      enabled: true,
      title: 'Pedido recibido',
      message:
        '👏 Hemos recibido tu pedido N° {order.public_id}. Estamos revisándolo. Por favor, espera un...',
      icon: '👏',
    },
    accepted: {
      enabled: true,
      title: 'Pedido aceptado',
      message:
        '✅ ¡Tu pedido ha sido aceptado! Sigue el progreso de tu pedido N° {order.public_id} en el siguiente...',
      icon: '✅',
    },
    ready: {
      enabled: true,
      title: 'Pedido listo',
      message: '👨‍🍳 Tu pedido N° {order.public_id} está listo',
      icon: '👨‍🍳',
    },
    'on-way': {
      enabled: true,
      title: 'Pedido en camino',
      message:
        '🚗 Tu pedido N° {order.public_id} está en camino y llegará pronto',
      icon: '🚗',
    },
    arrived: {
      enabled: true,
      title: 'Pedido llegó',
      message:
        '🎉 Tu pedido N° {order.public_id} ha llegado a destino. ¡Que lo disfrutes!',
      icon: '🎉',
    },
    delivered: {
      enabled: true,
      title: 'Pedido entregado',
      message:
        '👍 ¡Todo listo! Tu pedido N° {order.public_id} ha sido entregado. ¡Esperamos que lo disfrutes!',
      icon: '👍',
    },
    completed: {
      enabled: true,
      title: 'Pedido finalizado',
      message:
        '⭐ ¡Gracias por tu pedido N° {order.public_id}! Todo salió perfecto. ¡Te esperamos pronto en...',
      icon: '⭐',
    },
    cancelled: {
      enabled: true,
      title: 'Pedido cancelado',
      message:
        '🚫 Lamentamos informarte que tu pedido N° {order.public_id} ha sido cancelado. Si tienes algún...',
      icon: '🚫',
    },
  });

  // --- Toggle de plantillas ---
  const toggleTemplate = (templateId) => {
    setTemplates((prev) => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        enabled: !prev[templateId].enabled,
      },
    }));
  };

  // --- Toggle de estados de pedido ---
  const toggleOrderStatus = (statusId) => {
    setOrderStatuses((prev) => ({
      ...prev,
      [statusId]: {
        ...prev[statusId],
        enabled: !prev[statusId].enabled,
      },
    }));
  };

  // --- Update mensajes (para ambos mundos) ---
  const updateMessage = (id, newMessage) => {
    if (templates[id]) {
      setTemplates((prev) => ({
        ...prev,
        [id]: { ...prev[id], message: newMessage },
      }));
    } else if (orderStatuses[id]) {
      setOrderStatuses((prev) => ({
        ...prev,
        [id]: { ...prev[id], message: newMessage },
      }));
    }
  };

  // --- Obtener el activo ---
  const activeData = templates[activeTemplate] || orderStatuses[activeTemplate];
  const activeConfig =
    templateConfig[activeTemplate] || orderStatuses[activeTemplate];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Chatbot WhatsApp de EnCorto
        </h1>
        <div className="flex items-center space-x-2 text-sm">
          <MessageCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-500">Desvincular Chatbot de WhatsApp</span>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <TemplateList
          templates={templates}
          templateConfig={templateConfig}
          activeTemplate={activeTemplate}
          setActiveTemplate={setActiveTemplate}
          toggleTemplate={toggleTemplate}
          orderStatuses={orderStatuses}
          toggleOrderStatus={toggleOrderStatus}
        />

        {/* Editor + Preview en fila */}
        <div className="flex-1 bg-gray-50 flex overflow-y-auto p-4 space-x-6">
          {activeData && (
            <>
              <div className="w-1/2 flex flex-col">
                <TemplateEditor
                  activeConfig={activeConfig}
                  activeTemplate={activeTemplate}
                  activeTemplateData={activeData}
                  updateMessage={updateMessage}
                />
              </div>
              <div className="w-1/2 flex flex-col">
                <WhatsAppPreview message={activeData.message} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
