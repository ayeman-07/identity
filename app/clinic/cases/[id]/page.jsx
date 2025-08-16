"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import FileList from '../../../../components/FileList';
import LogoutButton from '../../../../components/LogoutButton';
import StatusBadge from '../../../../components/StatusBadge';
import StatusProgressBar from '../../../../components/StatusProgressBar';
import StatusHistory from '../../../../components/StatusHistory';
import MessageThread from '../../../../components/MessageThread';
import ReviewFormModal from '../../../../components/ReviewFormModal';

export default function CaseDetail() {
  const params = useParams();
  const router = useRouter();
  const [caseItem, setCaseItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        const userRes = await fetch('/api/user/me', { headers: { Authorization: `Bearer ${token}` } });
        if (userRes.ok) { const u = await userRes.json(); setCurrentUser(u.user); }
        const caseRes = await fetch(`/api/case/${params.id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (caseRes.status === 401) { localStorage.removeItem('token'); router.push('/login'); return; }
        if (!caseRes.ok) throw new Error('Failed to fetch case');
        const data = await caseRes.json();
        setCaseItem(data.case);
        if (data.case.status === 'DELIVERED') checkExistingReview(data.case.id);
      } catch (e) {
        console.error(e);
        setError('Failed to load case details');
      } finally { setLoading(false); }
    };
    run();
  }, [params.id, router]);

  const checkExistingReview = async (caseId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reviews', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setHasReviewed(!!data.reviews.find(r => r.caseId === caseId));
      }
    } catch (e) { console.error(e); }
  };

  const handleReviewSubmit = () => { setHasReviewed(true); toast.success('Thank you for your review!'); };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="glass-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-6 md:gap-0">
              <div className="space-y-3 w-full md:w-auto animate-pulse">
                <div className="h-8 w-48 bg-white/10 rounded" />
                <div className="h-4 w-64 bg-white/5 rounded" />
              </div>
              <div className="flex flex-wrap gap-3 animate-pulse">
                <div className="h-10 w-32 bg-white/5 rounded" />
                <div className="h-10 w-36 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-6 animate-pulse">
                <div className="h-5 w-32 bg-white/10 rounded mb-6" />
                <div className="space-y-4">{[...Array(5)].map((_,i)=> <div key={i} className="h-3 w-full bg-white/5 rounded" />)}</div>
              </div>
              <div className="glass-card p-6 animate-pulse">
                <div className="h-6 w-40 bg-white/10 rounded mb-6" />
                <div className="space-y-5">{[...Array(6)].map((_,i)=> <div key={i} className="h-4 w-48 bg-white/5 rounded" />)}</div>
              </div>
              <div className="glass-card p-6 animate-pulse space-y-4">
                <div className="h-5 w-44 bg-white/10 rounded" />
                {[...Array(4)].map((_,i)=> <div key={i} className="h-4 w-40 bg-white/5 rounded" />)}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-6 animate-pulse">
                <div className="h-6 w-56 bg-white/10 rounded mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_,i)=> <div key={i} className="h-24 bg-white/5 rounded" />)}</div>
                <div className="mt-6 h-10 w-40 bg-white/5 rounded" />
              </div>
              <div className="glass-card p-6 animate-pulse">
                <div className="h-6 w-48 bg-white/10 rounded mb-6" />
                <div className="space-y-4">{[...Array(5)].map((_,i)=> <div key={i} className="h-4 w-full bg-white/5 rounded" />)}</div>
                <div className="mt-6 h-10 w-full bg-white/5 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/clinic/cases" className="btn-gradient px-4 py-2 rounded">Back to Cases</Link>
        </div>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Case not found</p>
          <Link href="/clinic/cases" className="btn-gradient px-4 py-2 rounded">Back to Cases</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-6 md:gap-0">
            <div>
              <h1 className="text-3xl font-bold"><span className="tx-gradient">Case Details</span></h1>
              <p className="text-gray-400">Case ID: {caseItem.id}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/clinic/cases" className="btn-ghost px-4 py-2 hover:bg-white/5">Back to Cases</Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-medium text-gray-100 mb-4">Case Progress</h2>
              <StatusProgressBar currentStatus={caseItem.status} statusHistory={caseItem.statusHistory || []} />
            </div>
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Case Information</h2>
              <div className="space-y-4">
                <Info label="Title" value={caseItem.title} />
                <div>
                  <label className="block text-sm font-medium text-gray-400">Status</label>
                  <div className="mt-1"><StatusBadge status={caseItem.status} size="md" /></div>
                </div>
                <Info label="Tooth Number" value={caseItem.toothNumber || 'Not specified'} />
                {caseItem.caseNotes && <Info label="Notes" value={caseItem.caseNotes} />}
                <Info label="Created" value={new Date(caseItem.createdAt).toLocaleDateString()} />
                <Info label="Last Updated" value={new Date(caseItem.updatedAt).toLocaleDateString()} />
                {caseItem.lab && <Info label="Assigned Lab" value={caseItem.lab.name} />}
                {caseItem.status === 'DELIVERED' && caseItem.lab && (
                  <div className="pt-4 border-t border-gray-200">
                    {hasReviewed ? (
                      <div className="text-center py-3">
                        <div className="text-green-600 mb-2">
                          <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        </div>
                        <p className="text-sm text-gray-600">You have already reviewed this lab</p>
                      </div>
                    ) : (
                      <button onClick={() => setReviewModalOpen(true)} className="w-full btn-gradient px-4 py-2 flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span>Leave a Review</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="glass-card p-6">
              <h2 className="text-lg font-medium text-gray-100 mb-4">Status History</h2>
              <StatusHistory statusHistory={caseItem.statusHistory || []} />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Files</h2>
              <div className="mb-6 space-y-3">
                {(() => {
                  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                    if (!cloudName) {
                      return <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-400/20 px-3 py-2 rounded">Cloud uploads disabled: set PUBLIC_CLOUDINARY_CLOUD_NAME.</div>;
                  }
                  return (
                    <input
                      type="file"
                      multiple
                      accept=".stl,.pdf,.png,.jpg,.jpeg"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;
                        let signatureData = null;
                        try {
                          const token = localStorage.getItem('token');
                          const sigRes = await fetch(`/api/files/signature?folder=dental-cases`, { headers: { Authorization: `Bearer ${token}` } });
                          signatureData = await sigRes.json();
                          if (!sigRes.ok || signatureData.error) throw new Error(signatureData.error || 'Signature error');
                        } catch (err) {
                          toast.error('Signature fetch failed');
                          return;
                        }
                        for (const f of files) {
                          if (f.size > 80 * 1024 * 1024) { toast.error(`File too large: ${f.name}`); continue; }
                          const form = new FormData();
                          form.append('file', f);
                          form.append('api_key', signatureData.apiKey);
                          form.append('timestamp', signatureData.timestamp);
                          form.append('signature', signatureData.signature);
                          form.append('folder', signatureData.folder);
                          try {
                            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`, { method: 'POST', body: form });
                            const uploadJson = await uploadRes.json();
                            if (!uploadRes.ok || uploadJson.error) { console.error('Cloud upload failed', f.name, uploadJson.error); toast.error(`Upload failed: ${f.name}`); continue; }
                            const token = localStorage.getItem('token');
                            const metaRes = await fetch(`/api/files/cloudinary?caseId=${caseItem.id}`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                originalName: f.name,
                                fileType: f.type || 'application/octet-stream',
                                fileSize: f.size,
                                fileUrl: uploadJson.secure_url,
                                publicId: uploadJson.public_id
                              })
                            });
                            const metaJson = await metaRes.json();
                            if (!metaRes.ok) { console.error('Metadata save failed', metaJson.error); toast.error(`Meta save failed: ${f.name}`); continue; }
                            setCaseItem(prev => ({ ...prev, files: [ ...(prev.files||[]), metaJson.file ] }));
                            toast.success(`Uploaded: ${f.name}`);
                          } catch (err) {
                            console.error('Upload error', f.name, err);
                            toast.error(`Error: ${f.name}`);
                          }
                        }
                        e.target.value = '';
                      }}
                      className="block w-full text-[11px] text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-500/10 file:text-indigo-300 hover:file:bg-indigo-500/20"
                    />
                  );
                })()}
                <p className="text-[10px] text-gray-500">Direct Cloudinary upload (STL, PDF, images). Max 80MB per file.</p>
              </div>
              <FileList files={caseItem.files || []} caseId={caseItem.id} onFileUpload={() => {}} canUpload={false} />
            </div>
            <MessageThread caseId={caseItem.id} currentUser={currentUser} />
          </div>
        </div>
      </div>

      {caseItem.status === 'DELIVERED' && caseItem.lab && (
        <ReviewFormModal
          caseData={caseItem}
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400">{label}</label>
      <p className="mt-1 text-sm text-gray-100 break-words">{value}</p>
    </div>
  );
}