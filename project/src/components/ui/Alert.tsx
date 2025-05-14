import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ 
  type, 
  message, 
  className = '',
  onClose
}) => {
  const alertClasses = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  return (
    <div className={`flex items-center p-4 mb-4 rounded-md border ${alertClasses[type]} ${className}`}>
      <div className="flex-shrink-0 mr-3">
        {iconMap[type]}
      </div>
      <div className="flex-1 ml-2 text-sm">
        {message}
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Fechar</span>
          <XCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;