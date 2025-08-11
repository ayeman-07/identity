'use client';

export default function StatWidget({ title, value, subtitle, icon, color = 'blue', trend = null }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-200 border-blue-400/20',
    green: 'bg-green-500/10 text-green-200 border-green-400/20',
    yellow: 'bg-yellow-500/10 text-yellow-200 border-yellow-400/20',
    purple: 'bg-purple-500/10 text-purple-200 border-purple-400/20',
    red: 'bg-red-500/10 text-red-200 border-red-400/20',
    indigo: 'bg-indigo-500/10 text-indigo-200 border-indigo-400/20'
  };

  const iconColorClasses = {
    blue: 'text-blue-300',
    green: 'text-green-300',
    yellow: 'text-yellow-300',
    purple: 'text-purple-300',
    red: 'text-red-300',
    indigo: 'text-indigo-300'
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]} bg-opacity-50`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-100">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`text-sm mt-2 flex items-center ${
              trend.direction === 'up' ? 'text-green-300' : 
              trend.direction === 'down' ? 'text-red-300' : 'text-gray-400'
            }`}>
              {trend.direction === 'up' && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trend.direction === 'down' && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trend.value}
            </div>
          )}
        </div>
        {icon && (
          <div className={`text-4xl ${iconColorClasses[color]} opacity-75`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
