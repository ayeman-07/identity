'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import StatusBadge from './StatusBadge';

export default function StatusUpdateControl({ caseData, onStatusUpdate, userRole }) {
  const [updating, setUpdating] = useState(false);

  const getNextStatus = (currentStatus) => {
    const transitions = {
      'ACCEPTED': 'DESIGNING',
      'IN_PROGRESS': 'DESIGNING', // Legacy support
      'DESIGNING': 'READY',
      'READY': 'DISPATCHED',
      'DISPATCHED': 'DELIVERED'
    };
    return transitions[currentStatus] || null;
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      'DESIGNING': 'Mark as being actively worked on',
      'READY': 'Work completed, ready for dispatch',
      'DISPATCHED': 'Package sent to clinic',
      'DELIVERED': 'Case completed and delivered'
    };
    return descriptions[status] || '';
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!caseData) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/case/${caseData.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      const data = await response.json();
      
      // Call parent callback to refresh data
      if (onStatusUpdate) {
        onStatusUpdate(data.case);
      }
      
      toast.success(`Case status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!caseData) return null;

  const currentStatus = caseData.status;
  const nextStatus = getNextStatus(currentStatus);
  const canUpdate = userRole === 'LAB' && nextStatus && currentStatus !== 'DELIVERED';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Case Status</h3>
      
      {/* Current Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Status
        </label>
        <StatusBadge status={currentStatus} size="lg" />
      </div>

      {/* Status Update Controls (Lab only) */}
      {canUpdate && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status
            </label>
            <button
              onClick={() => handleStatusUpdate(nextStatus)}
              disabled={updating}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>
                {updating ? 'Updating...' : `Move to ${nextStatus.replace('_', ' ')}`}
              </span>
              {!updating && <span>→</span>}
            </button>
            
            {nextStatus && (
              <p className="mt-2 text-sm text-gray-600">
                {getStatusDescription(nextStatus)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Final Status Message */}
      {currentStatus === 'DELIVERED' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 text-xl mr-2">🎉</span>
            <div>
              <h4 className="text-green-800 font-medium">Case Completed!</h4>
              <p className="text-green-700 text-sm">This case has been successfully delivered.</p>
            </div>
          </div>
        </div>
      )}

      {/* Read-only for Clinics */}
      {userRole === 'CLINIC' && currentStatus !== 'DELIVERED' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-blue-600 text-xl mr-2">ℹ️</span>
            <div>
              <h4 className="text-blue-800 font-medium">Status Updates</h4>
              <p className="text-blue-700 text-sm">
                The lab will update the status as work progresses on your case.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
