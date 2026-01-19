import React from 'react';

export default function WhatsAppPreview({ message }) {
  return (
    <div className="p-6 bg-gray-50">
      <div className="mx-auto" style={{ width: '300px' }}>
        {/* Phone mockup */}
        <div className="bg-black rounded-3xl p-2">
          <div className="bg-gray-100 rounded-2xl overflow-hidden">
            {/* Status bar */}
            <div className="bg-green-600 h-8 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-12 h-1 bg-white rounded-full"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            {/* Chat header */}
            <div className="bg-green-700 px-4 py-3 flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Hola, buenos días</div>
                <div className="text-green-200 text-xs">12:4 p.m. ✓✓</div>
              </div>
            </div>

            {/* Chat messages */}
            <div className="bg-gray-100 p-3 space-y-3" style={{ height: '300px' }}>
              {/* Incoming message */}
              <div className="flex justify-end">
                <div className="bg-green-500 text-white rounded-lg px-3 py-2 max-w-xs">
                  <div className="text-sm">Hola, buenos días</div>
                  <div className="text-xs text-green-100 mt-1">12:4 p.m. ✓✓</div>
                </div>
              </div>

              {/* Bot response */}
              <div className="flex justify-start">
                <div className="bg-white rounded-lg px-3 py-2 max-w-xs shadow-sm">
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {message}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">12:45 p.m. ✓✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}
