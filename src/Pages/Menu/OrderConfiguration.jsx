import React, { useState } from 'react';
import { 
  FileText, 
  Home, 
  MapPin, 
  Edit, 
  Plus, 
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  ShoppingCart,
  Trash2
} from 'lucide-react';

export default function OrderConfiguration() {
  const [acceptOrders, setAcceptOrders] = useState(true);
  const [homeDelivery, setHomeDelivery] = useState(true);
  const [receiveFrom, setReceiveFrom] = useState('olaclick');
  const [orderStatus, setOrderStatus] = useState('pending');
  const [requestMethod, setRequestMethod] = useState('automatic');
  const [paraLlevarActive, setParaLlevarActive] = useState(true);
  const [localActive, setLocalActive] = useState(true);
const [mesaActive, setMesaActive] = useState(true);

// Propinas
const [tipAmount, setTipAmount] = useState('no');
const [customTips, setCustomTips] = useState(['MX$ 5', 'MX$ 10', 'Monto libre']);
  // Estado para el tipo de propina: '$' para cantidad fija o '%' para porcentaje
  const [tipType, setTipType] = useState('$');


const handleDeleteTip = (index) => {
  const updated = [...customTips];
  updated.splice(index, 1);
  setCustomTips(updated);
};

const handleAddTip = () => {
  setCustomTips([...customTips, '']);
};

const handleChangeTip = (value, index) => {
  const updatedTips = [...customTips];
  updatedTips[index] = value;
  setCustomTips(updatedTips);
};


const handleTipTypeChange = () => {
  const newType = tipType === '$' ? '%' : '$';
  setTipType(newType);

  // Actualizar todos los customTips existentes
  const updatedTips = customTips.map(tip => {
    // Extraer solo el número del tip
    const num = tip.replace(/[^0-9.]/g, '');
    if (!num) return tip; // si no hay número, mantener
    return newType === '$' ? `MX$${num}` : `${num}%`;
  });

  setCustomTips(updatedTips);
};





  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">
          Configuración de pedidos
        </h1>

        {/* Aceptar pedidos section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Aceptar pedidos</h2>
            </div>
            <button
              onClick={() => setAcceptOrders(!acceptOrders)}
              className="flex items-center"
            >
              {acceptOrders ? (
                <ToggleRight className="w-12 h-6 text-blue-500" />
              ) : (
                <ToggleLeft className="w-12 h-6 text-gray-400" />
              )}
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Tus clientes acceden a tu menú digital (
            <span className="text-blue-500 underline cursor-pointer">código QR o enlace</span>
            ) para realizar pedidos
          </p>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Recibir pedidos desde:</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="receiveFrom"
                  value="both"
                  checked={receiveFrom === 'both'}
                  onChange={(e) => setReceiveFrom(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Kuma y WhatsApp</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="receiveFrom"
                  value="olaclick"
                  checked={receiveFrom === 'olaclick'}
                  onChange={(e) => setReceiveFrom(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Kuma</span>
              </label>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Estado de ingreso de pedidos:</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="orderStatus"
                  value="pending"
                  checked={orderStatus === 'pending'}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">
                  Los pedidos ingresan al PDV en estado "Pendiente"
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="orderStatus"
                  value="preparation"
                  checked={orderStatus === 'preparation'}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">
                  Los pedidos ingresan al PDV en estado "En preparación"
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* A domicilio section */}
        <div className="bg-white rounded-lg shadow-sm mb-6 border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">A domicilio</h2>
            </div>
            <button
              onClick={() => setHomeDelivery(!homeDelivery)}
              className="flex items-center"
            >
              {homeDelivery ? (
                <ToggleRight className="w-12 h-6 text-blue-500" />
              ) : (
                <ToggleLeft className="w-12 h-6 text-gray-400" />
              )}
            </button>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Configurar precios y cobertura de envío</h3>
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-700">Distancia recorrida</span>
              </div>
              <button className="flex items-center gap-2 text-blue-500 text-sm hover:underline">
                <Edit className="w-4 h-4" />
                Editar configuración de entrega
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Configura tus repartidores propios:</h3>
            <p className="text-sm text-gray-600 mb-3">
              El cliente pide en tu menú digital y tú entregas con tus repartidores
            </p>
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <span className="text-sm text-gray-700">Nadia</span>
              </div>
              <button className="flex items-center gap-2 text-blue-500 text-sm hover:underline">
                <Edit className="w-4 h-4" />
                Editar/Crear repartidores propios
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Configura repartidores de aplicaciones de entrega:</h3>
            <p className="text-sm text-gray-600 mb-3">
              El cliente hace un pedido por tu menú digital y haces la entrega con repartidores de aplicativos de entrega
            </p>
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-red-500">No tienes proveedores seleccionados</span>
              <button className="flex items-center gap-2 text-blue-500 text-sm hover:underline">
                <Edit className="w-4 h-4" />
                Editar proveedores
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Configura cómo solicitar repartidores</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="requestMethod"
                  value="manual"
                  checked={requestMethod === 'manual'}
                  onChange={(e) => setRequestMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600 mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900 mb-1">Solicitar manualmente</div>
                  <div className="text-sm text-gray-600">
                    Solicita el repartidor manualmente con cada pedido
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="requestMethod"
                  value="automatic"
                  checked={requestMethod === 'automatic'}
                  onChange={(e) => setRequestMethod(e.target.value)}
                  className="w-4 h-4 text-blue-600 mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900 mb-1">Solicitar automáticamente</div>
                  <div className="text-sm text-gray-600">
                    Solicita el repartidor automáticamente al aceptar el pedido
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-700">• Repartidor a solicitar automáticamente...</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg ml-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <span className="text-sm text-gray-700">Nadia</span>
              </div>
              <button className="flex items-center gap-1 text-blue-500 text-sm hover:underline">
                <Edit className="w-3 h-3" />
                Editar
              </button>
            </div>
          </div>

          <button className="flex items-center gap-2 text-gray-600 text-sm hover:text-gray-800">
            <span>Opciones avanzadas</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

{/* === Para llevar === */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 flex items-center justify-between">
  <h3 className="text-lg font-semibold flex items-center gap-2">
    <ShoppingCart className="w-5 h-5 text-gray-600" />
    Para llevar
  </h3>
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-700">Aceptar pedidos</span>
    <button onClick={() => setParaLlevarActive(!paraLlevarActive)}>
      {paraLlevarActive ? (
        <ToggleRight className="w-12 h-6 text-blue-500" />
      ) : (
        <ToggleLeft className="w-12 h-6 text-gray-400" />
      )}
    </button>
  </div>
</div>





{/* === En el local === */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 flex items-start justify-between">
  <div className="flex flex-col">
    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
      <Home className="w-5 h-5 text-gray-600" />
      En el local
    </h3>
    <p className="text-gray-700 text-sm">
      Ideal para servicios rápidos con un único pedido, como en el mostrador, en la playa o en el servicio de alimentos del hotel. Funciona con códigos QR genéricos o únicos.
    </p>
  </div>
  <div className="flex items-center gap-2 self-start">
    <span className="text-sm text-gray-700 whitespace-nowrap">Aceptar pedidos</span>
    <button onClick={() => setLocalActive(!localActive)}>
      {localActive ? (
        <ToggleRight className="w-12 h-6 text-blue-500" />
      ) : (
        <ToggleLeft className="w-12 h-6 text-gray-400" />
      )}
    </button>
  </div>
</div>




{/* === En mesa (solo PDV) === */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 flex flex-col">
  <div className="flex flex-col">
    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
      <MapPin className="w-5 h-5 text-gray-600" />
      En mesa (solo PDV)
    </h3>
    <p className="text-gray-700 text-sm mb-4">
      Ideal para comer en el lugar, permitiendo múltiples pedidos por mesa antes de cerrar la cuenta, como en restaurantes con números de mesa.
    </p>
  </div>
  
  <div className="flex justify-start mt-2">
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700 whitespace-nowrap">Precio por servicio</span>
      <button onClick={() => setMesaActive(!mesaActive)}>
        {mesaActive ? (
          <ToggleRight className="w-12 h-6 text-blue-500" />
        ) : (
          <ToggleLeft className="w-12 h-6 text-gray-400" />
        )}
      </button>
    </div>
  </div>
</div>





 {/* === Propinas === */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
    <FileText className="w-5 h-5 text-gray-600" />
    Propinas
  </h3>

  {/* Opciones de servicio */}
  <div className="flex justify-between items-center mb-2">
    <p className="text-sm text-gray-700">Agrega propinas solo para un servicio específico</p>
    <div className="flex items-center gap-4">
      {['En mesa (solo PDV)', 'A domicilio', 'Para llevar', 'En el local'].map((opt, i) => (
        <label key={i} className="flex items-center gap-1">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600"
            readOnly
            checked={opt === 'A domicilio'}
          />
          <span className="text-sm text-gray-700 whitespace-nowrap">{opt}</span>
        </label>
      ))}
    </div>
  </div>

  {/* Define el monto de propina */}
  <div className="flex justify-between items-center mt-4">
    <p className="text-sm text-gray-700">Define el monto de propina</p>

    {/* Sección de propinas personalizadas y monto libre */}
    <div className="flex items-center gap-4">

      {/* Botón de cambio $ / % */}
      <button
  className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded flex items-center gap-1 hover:bg-yellow-200 transition-colors"
  onClick={handleTipTypeChange} // <- usamos la función nueva
>
  {tipType} <span className="transform rotate-90">▼</span>
</button>


      {/* Bloque No, gracias */}
      <div className="flex items-center gap-2">
        <button
          className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          onClick={() => setTipAmount('no')}
        >
          No, gracias
        </button>
      </div>

      {/* Línea separadora */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Inputs de propinas personalizadas + botón agregar */}
      <div className="flex items-center gap-2">
        {customTips.filter(tip => tip !== 'Monto libre').map((tip, i) => (
          <div key={i} className="relative">
            <input
              type="text"
              placeholder={tipType === '$' ? 'MXN' : '%'}
              className="border border-gray-300 rounded px-3 py-1 text-sm w-20 pr-7 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tip}
              onChange={(e) => handleChangeTip(e.target.value, i)}
            />
            <button
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
              onClick={() => handleDeleteTip(i)}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Botón para agregar nuevo input */}
        <button
          className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
          onClick={handleAddTip}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Línea separadora */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Monto libre como botón */}
      <button
        className="bg-gray-100 text-gray-400 text-sm px-4 py-1 rounded cursor-default"
      >
        Monto Libre
      </button>
    </div>
  </div>
</div>






  {/* Enlaces QR */}
  <div>
    <h3 className="text-lg font-semibold mb-4">Enlaces y código QR de tu Menú</h3>
    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
      Ir a enlace y código QR
    </button>
  </div>
</div>





      </div>
   
  );
}
