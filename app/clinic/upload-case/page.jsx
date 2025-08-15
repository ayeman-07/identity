'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import FileList from '../../../components/FileList';
import LogoutButton from '../../../components/LogoutButton';
import { validateUploadCase } from '../../../utils/caseSchemas';

function UploadCaseContent() {
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
  const [isLabFixed, setIsLabFixed] = useState(false); // New state to track if lab is fixed
  const [errors, setErrors] = useState({});
  const [cloudUploads, setCloudUploads] = useState([]); // list of uploaded file records
  // Cloudinary client config (public vars only). Ensure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME & NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET are set.
  const cloudConfig = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    unsignedPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET,
    uploadEndpoint: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload` : null
  };

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
              setIsLabFixed(true); // Mark lab as fixed when pre-selected
              toast.success(`${selectedLab.name} has been locked for this case.`, {
                duration: 4000,
                icon: '🔒'
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
    setErrors({});

    // Validation
    const validation = validateUploadCase(formData);
    if (!validation.success) {
      setErrors(validation.errors);
      setLoading(false);
      setMessage('Please correct the highlighted fields.');
      return;
    }

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
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-6 md:gap-0">
            <div>
              <h1 className="text-3xl font-bold"><span className="tx-gradient">Upload New Case</span></h1>
              <p className="text-gray-400 text-sm md:text-base">Create a case, optionally assign a lab, then upload STL & supporting assets.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/clinic/cases"
                className="btn-ghost px-4 py-2 hover:bg-white/5"
              >
                Back to Cases
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Form (Refactored Layout) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="glass-card rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3">
            {/* Main Column */}
            <div className="p-6 space-y-10 lg:col-span-2">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-100 tracking-wide">Primary Details</h2>
                  <p className="mt-1 text-[12px] text-gray-500 max-w-sm">Provide minimal required info. You can attach files once the case exists.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {caseId && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-400/30 text-emerald-300 bg-emerald-500/10 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Draft Saved
                    </span>
                  )}
                  {selectedLabName && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${isLabFixed ? 'border-indigo-400/30 text-indigo-300 bg-indigo-500/10' : 'border-emerald-400/30 text-emerald-300 bg-emerald-500/10'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isLabFixed ? 'bg-indigo-300' : 'bg-emerald-300'} animate-pulse`} />
                      {isLabFixed ? 'Lab Locked' : 'Lab Pre-selected'}
                    </span>
                  )}
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-md text-xs font-medium border leading-relaxed ${
                  message.includes('successfully')
                    ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
                    : 'bg-rose-500/10 border-rose-400/30 text-rose-200'
                }`}>{message}</div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Case Title <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`input-dark w-full ${errors.title ? 'ring-1 ring-rose-400/60' : ''}`}
                  placeholder="e.g., Single Crown #001"
                  required
                />
                {errors.title && <p className="mt-1 text-xs text-rose-300">{errors.title}</p>}
              </div>

              {/* Tooth & Lab */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="toothNumber" className="block text-sm font-medium text-gray-300 mb-1">Tooth Number(s) <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    id="toothNumber"
                    value={formData.toothNumber}
                    onChange={(e) => setFormData({...formData, toothNumber: e.target.value})}
                    className={`input-dark w-full ${errors.toothNumber ? 'ring-1 ring-rose-400/60' : ''}`}
                    placeholder="e.g., 14 or Multiple"
                    required
                  />
                  {errors.toothNumber && <p className="mt-1 text-xs text-rose-300">{errors.toothNumber}</p>}
                </div>
                <div>
                  <label htmlFor="labId" className="block text-sm font-medium text-gray-300 mb-1">Assign Lab (Optional)</label>
                  <select
                    id="labId"
                    value={formData.labId}
                    onChange={(e) => {
                      setFormData({...formData, labId: e.target.value});
                      const selectedLab = labs.find(lab => lab.id === e.target.value);
                      setSelectedLabName(selectedLab ? selectedLab.name : '');
                    }}
                    className={`input-dark w-full pr-8 ${isLabFixed ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={labsLoading || isLabFixed}
                  >
                    <option value="">Unassigned (open to labs)</option>
                    {labs.map((lab) => (
                      <option key={lab.id} value={lab.id} className="bg-slate-800">
                        {lab.name} – {lab.location} ({lab.turnaroundTime}d)
                      </option>
                    ))}
                  </select>
                  {errors.labId && <p className="mt-1 text-xs text-rose-300">{errors.labId}</p>}
                  <p className="mt-2 text-xs text-gray-500">
                    {labsLoading 
                      ? 'Loading labs…'
                      : isLabFixed && selectedLabName
                        ? `🔒 Locked to ${selectedLabName}`
                        : selectedLabName
                          ? `Will assign directly to ${selectedLabName}`
                          : 'Leave unassigned to let any qualified lab accept.'}
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="caseNotes" className="block text-sm font-medium text-gray-300">Case Notes</label>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Optional</span>
                </div>
                <textarea
                  id="caseNotes"
                  rows={4}
                  value={formData.caseNotes}
                  onChange={(e) => setFormData({...formData, caseNotes: e.target.value})}
                  className={`input-dark w-full min-h-[140px] resize-y ${errors.caseNotes ? 'ring-1 ring-rose-400/60' : ''}`}
                  placeholder="Materials, shade, margin, instructions..."/>
                {errors.caseNotes && <p className="mt-1 text-xs text-rose-300">{errors.caseNotes}</p>}
              </div>

              {/* Action */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gradient px-8 py-3 rounded-lg text-sm font-medium tracking-wide flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && <span className="h-4 w-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />}
                  <span>{loading ? 'Creating...' : caseId ? 'Update Case' : 'Create Case'}</span>
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="border-t lg:border-t-0 lg:border-l border-white/10 p-6 space-y-8 bg-white/5/5 backdrop-blur-sm">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-wide text-gray-200 uppercase">Case Summary</h3>
                <ul className="text-xs text-gray-400 space-y-2">
                  <li><span className="text-gray-500">Title:</span> {formData.title || <span className="text-gray-600 italic">(not set)</span>}</li>
                  <li><span className="text-gray-500">Tooth:</span> {formData.toothNumber || <span className="text-gray-600 italic">(none)</span>}</li>
                  <li><span className="text-gray-500">Lab:</span> {selectedLabName ? selectedLabName : <span className="text-gray-600 italic">Unassigned</span>}</li>
                  <li><span className="text-gray-500">Files:</span> {caseId ? 'Pending Upload' : '—'}</li>
                </ul>
              </div>
              {labsLoading && !selectedLabName && (
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                  <div className="grid grid-cols-3 gap-2 animate-pulse">
                    {[...Array(3)].map((_,i)=>(<div key={i} className="h-8 bg-white/5 rounded" />))}
                  </div>
                </div>
              )}
              {caseId && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold tracking-wide text-gray-200 uppercase">Upload Files</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Add STL, images & docs. Uploading will auto-save.</p>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".stl,.pdf,.png,.jpg,.jpeg"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;
                        for (const file of files) {
                          if (file.size > 80 * 1024 * 1024) { // 80MB client limit
                            toast.error(`${file.name} too large (>80MB)`);
                            continue;
                          }
                          const form = new FormData();
                          form.append('file', file);
                          if (cloudConfig.unsignedPreset) form.append('upload_preset', cloudConfig.unsignedPreset);
                          try {
                            const res = await fetch(cloudConfig.uploadEndpoint, { method: 'POST', body: form });
                            const json = await res.json();
                            if (!res.ok || json.error) {
                              toast.error(`Cloud upload failed: ${file.name}`);
                              continue;
                            }
                            // Persist metadata to backend (simple endpoint reuse: create File record)
                            const token = localStorage.getItem('token');
                            const metaRes = await fetch(`/api/files/cloudinary?caseId=${caseId}`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                originalName: file.name,
                                fileType: file.type || 'application/octet-stream',
                                fileSize: file.size,
                                fileUrl: json.secure_url,
                                publicId: json.public_id
                              })
                            });
                            const metaJson = await metaRes.json();
                            if (!metaRes.ok) {
                              toast.error(metaJson.error || 'Metadata save failed');
                              continue;
                            }
                            toast.success(`Uploaded ${file.name}`);
                            setCloudUploads(prev => [...prev, metaJson.file]);
                          } catch (err) {
                            console.error(err);
                            toast.error(`Upload error: ${file.name}`);
                          }
                        }
                        e.target.value = '';
                      }}
                      className="block w-full text-[11px] text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-500/10 file:text-indigo-300 hover:file:bg-indigo-500/20"
                    />
                    <p className="text-[10px] text-gray-500">Direct Cloudinary upload. Limit 80MB per file.</p>
                  </div>
                  <div className="rounded-md border border-indigo-400/20 bg-indigo-500/5 p-3">
                    <FileList
                      files={cloudUploads}
                      caseId={caseId}
                      onFileUpload={handleFileUpload}
                      canUpload={false} // hide legacy local uploader (using Cloudinary direct uploads above)
                    />
                  </div>
                </div>
              )}
              {!caseId && (
                <div className="text-xs text-gray-500 leading-relaxed">
                  After creating the case you can upload STL & supporting files here.
                </div>
              )}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Tips</h4>
                <ul className="text-[11px] text-gray-500 space-y-2 list-disc list-inside">
                  <li>Use clear tooth numbering (FDI/Universal).</li>
                  <li>Add material & shade in notes.</li>
                  <li>Assign a lab only to lock routing.</li>
                </ul>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function UploadCase() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="glass-card px-8 py-6 rounded-xl flex flex-col items-center border border-white/10">
          <div className="h-12 w-12 rounded-full border-2 border-indigo-400/30 border-t-indigo-500 animate-spin mb-4" />
          <p className="text-sm text-slate-400 tracking-wide">Loading Upload Form</p>
        </div>
      </div>
    }>
      <UploadCaseContent />
    </Suspense>
  );
} 