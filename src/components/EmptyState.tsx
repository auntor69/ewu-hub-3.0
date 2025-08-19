import React from 'react';
import { FileText, Calendar, Users, Settings } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'calendar' | 'file' | 'users' | 'settings';
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = 'file', 
  title, 
  description, 
  action 
}) => {
  const icons = {
    calendar: Calendar,
    file: FileText,
    users: Users,
    settings: Settings
  };
  
  const Icon = icons[icon];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
      <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
};