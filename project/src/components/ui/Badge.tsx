import React from 'react';
import { getStatusColor } from '../../utils/helpers';

interface BadgeProps {
  status: string;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, children, className = '' }) => {
  const statusColor = getStatusColor(status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;