'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import FileList from '../../../components/FileList';
import LogoutButton from '../../../components/LogoutButton';

export default function UploadCase() {
  const [formData, setFormData] = useState({
    title: '',
    toothNumber: '',
    caseNotes: '',
    labId: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [caseId, setCaseId] = useState(null);
  const [labs, setLabs] = useState([]);
  const [labsLoading, setLabsLoading] = useState(true);
  const [selectedLabName, setSelectedLabName] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch available labs
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/labs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setLabs(data.labs);
          
          // Check for pre-selected lab from URL parameters
          const preSelectedLabId = searchParams.get('labId');
          if (preSelectedLabId) {
            const selectedLab = data.labs.find(lab => lab.id === preSelectedLabId);
            if (selectedLab) {
              setFormData(prev => ({ ...prev, labId: preSelectedLabId }));
              setSelectedLabName(selectedLab.name);
              toast.success(`${selectedLab.name} has been pre-selected for this case.`, {
                duration: 4000,
                icon: '🏥'
              });
            }
          }
        } else {
          console.error('Failed to fetch labs');
        }
      } catch (error) {
        console.error('Error fetching labs:', error);
      } finally {
        setLabsLoading(false);
      }
    };

    fetchLabs();
  }, [router, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('toothNumber', formData.toothNumber);
      formDataToSend.append('caseNotes', formData.caseNotes);
      if (formData.labId) {
        formDataToSend.append('labId', formData.labId);
      }

      const response = await fetch('/api/case/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        setCaseId(data.case.id);
        setMessage('Case created successfully! You can now upload files.');
      } else {
        setMessage(data.error || 'Failed to create case');
      }
    } catch (error) {
      setMessage('Error uploading case');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (uploadedFiles) => {
    // Files uploaded successfully, refresh the page or show success message
    setMessage('Files uploaded successfully! Case is ready.');
    setTimeout(() => {
      router.push('/clinic/cases');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload New Case</h1>
              <p className="text-gray-600">Submit a new dental case to labs</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/clinic/cases"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Cases
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Case Information</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Pre-selected Lab Banner */}
            {selectedLabName && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-indigo-800">
                      Lab Pre-selected
                    </h3>
                    <div className="mt-1 text-sm text-indigo-700">
                      <p>This case will be assigned to <strong>{selectedLabName}</strong>. You can change the lab assignment below if needed.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {/* Case Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Case Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Crown Case #001"
                required
              />
            </div>

            {/* Tooth Number */}
            <div>
              <label htmlFor="toothNumber" className="block text-sm font-medium text-gray-700">
                Tooth Number(s)
              </label>
              <input
                type="text"
                id="toothNumber"
                value={formData.toothNumber}
                onChange={(e) => setFormData({...formData, toothNumber: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 14 or Multiple"
                required
              />
            </div>

            {/* Case Notes */}
            <div>
              <label htmlFor="caseNotes" className="block text-sm font-medium text-gray-700">
                Case Notes
              </label>
              <textarea
                id="caseNotes"
                rows={4}
                value={formData.caseNotes}
                onChange={(e) => setFormData({...formData, caseNotes: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe the case requirements, patient notes, etc."
              />
            </div>

            {/* File Upload Section - Only show after case is created */}
            {caseId && (
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Now you can upload STL files, images, and supporting documents for this case.
                </p>
                <FileList 
                  files={[]} 
                  caseId={caseId} 
                  onFileUpload={handleFileUpload}
                  canUpload={true}
                />
              </div>
            )}

            {/* Lab Assignment (Optional) */}
            <div>
              <label htmlFor="labId" className="block text-sm font-medium text-gray-700">
                Assign to Specific Lab (Optional)
                {selectedLabName && (
                  <span className="ml-2 text-sm font-normal text-indigo-600">
                    • {selectedLabName} pre-selected
                  </span>
                )}
              </label>
              <select
                id="labId"
                value={formData.labId}
                onChange={(e) => {
                  setFormData({...formData, labId: e.target.value});
                  const selectedLab = labs.find(lab => lab.id === e.target.value);
                  setSelectedLabName(selectedLab ? selectedLab.name : '');
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={labsLoading}
              >
                <option value="">Leave unassigned (labs can accept)</option>
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name} - {lab.location} ({lab.turnaroundTime} days)
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {labsLoading 
                  ? 'Loading available labs...' 
                  : selectedLabName
                    ? `Case will be assigned directly to ${selectedLabName}. You can change this selection if needed.`
                    : 'Leave unassigned to let labs accept the case, or assign to a specific lab.'
                }
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Case'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 