import React, { createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  loading = false,
  children, 
  className = '',
  disabled,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 focus:ring-purple-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

// Card Component
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', actions }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
};

// Badge Component
interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'neutral' | 'purple';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-800',
    purple: 'bg-purple-100 text-purple-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Modal Component
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative bg-white rounded-2xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

// Table Component
interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  rows: any[];
  emptyText?: string;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ columns, rows, emptyText = 'No data available', className = '' }) => {
  if (rows.length === 0) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center ${className}`}>
        <p className="text-gray-500">{emptyText}</p>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// FormRow Component
interface FormRowProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormRow: React.FC<FormRowProps> = ({ label, required, children, className = '' }) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({ error, className = '', ...props }) => {
  return (
    <div>
      <input
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ options, error, className = '', ...props }) => {
  return (
    <div>
      <select
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

// TimeRangePicker Component
interface TimeRangePickerProps {
  onChange: (range: { start: string; end: string }) => void;
  maxMinutes?: number;
  value?: { start: string; end: string };
}

export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({ 
  onChange, 
  maxMinutes = 120,
  value 
}) => {
  const [startTime, setStartTime] = React.useState(value?.start || '');
  const [duration, setDuration] = React.useState('60');
  
  const durationOptions = [];
  for (let i = 30; i <= maxMinutes; i += 30) {
    durationOptions.push({ value: i.toString(), label: `${i} minutes` });
  }
  
  React.useEffect(() => {
    if (startTime && duration) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(start.getTime() + parseInt(duration) * 60000);
      const endTime = end.toTimeString().slice(0, 5);
      onChange({ start: startTime, end: endTime });
    }
  }, [startTime, duration, onChange]);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormRow label="Start Time">
        <Input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </FormRow>
      <FormRow label="Duration">
        <Select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          options={durationOptions}
        />
      </FormRow>
    </div>
  );
};

// Page Animation Wrapper
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Toast Context and Provider
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

const ToastContext = createContext<{
  addToast: (toast: Omit<Toast, 'id'>) => void;
} | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };
  
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };
  
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className={`flex items-center p-4 rounded-xl border shadow-lg max-w-sm ${colors[toast.type]}`}
            >
              <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};