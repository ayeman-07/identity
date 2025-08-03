'use client';

export default function StatusProgressBar({ currentStatus, statusHistory = [] }) {
  const statuses = [
    { key: 'NEW', label: 'New', icon: '🆕' },
    { key: 'ACCEPTED', label: 'Accepted', icon: '✅' },
    { key: 'DESIGNING', label: 'Designing', icon: '🎨' },
    { key: 'READY', label: 'Ready', icon: '✨' },
    { key: 'DISPATCHED', label: 'Dispatched', icon: '🚚' },
    { key: 'DELIVERED', label: 'Delivered', icon: '📦' }
  ];

  const getCurrentStatusIndex = () => {
    return statuses.findIndex(status => status.key === currentStatus);
  };

  const getStatusTimestamp = (statusKey) => {
    const historyEntry = statusHistory.find(entry => entry.status === statusKey);
    return historyEntry ? new Date(historyEntry.timestamp) : null;
  };

  const currentIndex = getCurrentStatusIndex();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {statuses.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const timestamp = getStatusTimestamp(status.key);
          
          return (
            <div key={status.key} className="flex flex-col items-center flex-1">
              {/* Status Circle */}
              <div className="flex items-center w-full">
                {/* Line before (except for first item) */}
                {index > 0 && (
                  <div className={`flex-1 h-1 ${
                    index <= currentIndex ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
                
                {/* Status Circle */}
                <div className={`
                  relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${isCompleted 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                  ${isCurrent ? 'ring-4 ring-blue-200 ring-opacity-50' : ''}
                `}>
                  {isCompleted ? (
                    <span className="text-sm">
                      {isCurrent ? status.icon : '✓'}
                    </span>
                  ) : (
                    <span className="text-sm">{status.icon}</span>
                  )}
                </div>
                
                {/* Line after (except for last item) */}
                {index < statuses.length - 1 && (
                  <div className={`flex-1 h-1 ${
                    index < currentIndex ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
              
              {/* Status Label */}
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium ${
                  isCompleted ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {status.label}
                </div>
                {timestamp && (
                  <div className="text-xs text-gray-400 mt-1">
                    {timestamp.toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
