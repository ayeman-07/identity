'use client';

export default function StatusBadge({ status, size = 'md' }) {
  const getStatusConfig = (status) => {
    const configs = {
      'NEW': {
        color: 'bg-white/10 text-gray-200 border border-white/20',
        icon: '🆕',
        label: 'New'
      },
      'ACCEPTED': {
        color: 'bg-blue-500/10 text-blue-200 border border-blue-400/20',
        icon: '✅',
        label: 'Accepted'
      },
      'DESIGNING': {
        color: 'bg-yellow-500/10 text-yellow-200 border border-yellow-400/20',
        icon: '🎨',
        label: 'Designing'
      },
      'READY': {
        color: 'bg-green-500/10 text-green-200 border border-green-400/20',
        icon: '✨',
        label: 'Ready'
      },
      'DISPATCHED': {
        color: 'bg-orange-500/10 text-orange-200 border border-orange-400/20',
        icon: '🚚',
        label: 'Dispatched'
      },
      'DELIVERED': {
        color: 'bg-teal-500/10 text-teal-200 border border-teal-400/20',
        icon: '📦',
        label: 'Delivered'
      },
      'CANCELLED': {
        color: 'bg-red-500/10 text-red-200 border border-red-400/20',
        icon: '❌',
        label: 'Cancelled'
      },
      'REJECTED': {
        color: 'bg-red-500/10 text-red-200 border border-red-400/20',
        icon: '🚫',
        label: 'Rejected'
      }
    };

    return configs[status] || {
      color: 'bg-white/10 text-gray-200 border border-white/20',
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
