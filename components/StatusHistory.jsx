'use client';

import StatusBadge from './StatusBadge';

export default function StatusHistory({ statusHistory = [] }) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status History</h3>
        <p className="text-gray-500 text-sm">No status changes recorded yet.</p>
      </div>
    );
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  // Sort history by timestamp (most recent first)
  const sortedHistory = [...statusHistory].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Status History</h3>
      
      <div className="space-y-4">
        {sortedHistory.map((entry, index) => {
          const { date, time } = formatTimestamp(entry.timestamp);
          const isLatest = index === 0;
          
          return (
            <div key={`${entry.status}-${entry.timestamp}`} className={`
              flex items-start space-x-4 pb-4 
              ${index < sortedHistory.length - 1 ? 'border-b border-gray-100' : ''}
            `}>
              {/* Timeline indicator */}
              <div className="flex-shrink-0 mt-1">
                <div className={`w-3 h-3 rounded-full ${
                  isLatest ? 'bg-blue-500 ring-4 ring-blue-100' : 'bg-gray-300'
                }`} />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={entry.status} size="sm" />
                    {isLatest && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{date}</div>
                    <div className="text-xs text-gray-500">{time}</div>
                  </div>
                </div>
                
                {entry.updatedBy && (
                  <div className="mt-1 text-sm text-gray-600">
                    Updated by: {entry.updatedBy}
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
