'use client';

export default function RevenueWidget({ totalEarnings, recentEarnings }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Revenue Overview</h3>
        <div className="text-3xl">💰</div>
      </div>

      {/* Total Earnings */}
      <div className="mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Estimated Earnings</p>
              <p className="text-3xl font-bold text-green-700">{formatCurrency(totalEarnings)}</p>
            </div>
            <div className="text-2xl text-green-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Earnings */}
      {recentEarnings && recentEarnings.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Completed Jobs</h4>
          <div className="space-y-3">
            {recentEarnings.map((earning, index) => (
              <div key={earning.caseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{earning.caseTitle}</p>
                  <p className="text-xs text-gray-500">{earning.clinicName}</p>
                  <p className="text-xs text-gray-400">Completed {formatDate(earning.completedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(earning.estimatedEarning)}
                  </p>
                  <p className="text-xs text-gray-500">estimated</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!recentEarnings || recentEarnings.length === 0) && totalEarnings === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 text-sm">No completed jobs yet</p>
          <p className="text-gray-400 text-xs mt-1">Revenue will appear here once you complete jobs</p>
        </div>
      )}

      {/* Note */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-600">
          💡 <strong>Note:</strong> Earnings are estimated based on typical case types. 
          Actual pricing may vary based on complexity and agreements with clinics.
        </p>
      </div>
    </div>
  );
}
