import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function TemplateItem({ templateId, config, template, activeTemplate, setActiveTemplate, toggleTemplate }) {
  const isActive = activeTemplate === templateId;

  return (
    <div 
      className={`p-3 mb-2 cursor-pointer transition-all duration-200 ${
        isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
      }`}
      onClick={() => setActiveTemplate(templateId)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-lg">{config.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-sm ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
              {config.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {config.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 ml-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTemplate(templateId);
            }}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              template.enabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                template.enabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
