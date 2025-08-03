'use client';

export default function StatusBadge({ status, size = 'md' }) {
  const getStatusConfig = (status) => {
    const configs = {
      'NEW': {
        color: 'bg-gray-100 text-gray-800',
        icon: '🆕',
        label: 'New'
      },
      'ACCEPTED': {
        color: 'bg-blue-100 text-blue-800',
        icon: '✅',
        label: 'Accepted'
      },
      'DESIGNING': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: '🎨',
        label: 'Designing'
      },
      'READY': {
        color: 'bg-green-100 text-green-800',
        icon: '✨',
        label: 'Ready'
      },
      'DISPATCHED': {
        color: 'bg-orange-100 text-orange-800',
        icon: '🚚',
        label: 'Dispatched'
      },
      'DELIVERED': {
        color: 'bg-teal-100 text-teal-800',
        icon: '📦',
        label: 'Delivered'
      },
      'CANCELLED': {
        color: 'bg-red-100 text-red-800',
        icon: '❌',
        label: 'Cancelled'
      },
      'REJECTED': {
        color: 'bg-red-100 text-red-800',
        icon: '🚫',
        label: 'Rejected'
      }
    };

    return configs[status] || {
      color: 'bg-gray-100 text-gray-800',
      icon: '❓',
      label: status
    };
  };

  const config = getStatusConfig(status);
  
  const sizeClasses = {
    'sm': 'px-2 py-1 text-xs',
    'md': 'px-2.5 py-1.5 text-sm',
    'lg': 'px-3 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]} font-medium rounded-full ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
}
