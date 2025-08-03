'use client';

import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamic import for STL viewer
const DynamicSTLViewer = dynamic(() => import('./DynamicSTLViewer'), {
  ssr: false,
  loading: () => <div className="text-center p-4">Loading 3D Viewer...</div>
});

export default function FileList({ files, caseId, onFileUpload, canUpload = false }) {
  const [uploading, setUploading] = useState(false);
  const [viewingSTL, setViewingSTL] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [viewingPDF, setViewingPDF] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType, fileName) => {
    // Check both MIME type and file extension for STL files
    const isSTL = fileType.includes('stl') || 
                  fileType.includes('sla') || 
                  fileName.toLowerCase().endsWith('.stl');
    
    if (isSTL) {
      return '📐'; // STL file
    } else if (fileType.includes('zip')) {
      return '📦'; // ZIP file
    } else if (fileType.includes('pdf')) {
      return '📄'; // PDF file
    } else if (fileType.includes('image')) {
      return '🖼️'; // Image file
    } else {
      return '📎'; // Generic file
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/files/upload?caseId=${caseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Files uploaded successfully!');
        if (onFileUpload) {
          onFileUpload(data.files);
        }
        // Clear the file input
        event.target.value = '';
      } else {
        toast.error(data.error || 'Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, originalName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Error downloading file');
    }
  };

  const handlePreview = async (file) => {
    // Check both MIME type and file extension for STL files
    const isSTL = file.fileType.includes('stl') || 
                  file.fileType.includes('sla') || 
                  file.originalName.toLowerCase().endsWith('.stl');
    
    const isImage = file.fileType.includes('image');
    const isPDF = file.fileType.includes('pdf');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`/api/files/${file.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to load file:', response.status, errorData);
        toast.error(`Failed to load file for viewing. Status: ${response.status}`);
        return;
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      if (isSTL) {
        setViewingSTL({
          ...file,
          blobUrl: blobUrl
        });
      } else if (isImage) {
        setViewingImage({
          ...file,
          blobUrl: blobUrl
        });
      } else if (isPDF) {
        setViewingPDF({
          ...file,
          blobUrl: blobUrl
        });
      }
    } catch (error) {
      console.error('Error loading file for viewing:', error);
      toast.error('Error loading file for viewing. Please check your connection and try again.');
    }
  };

  const closeSTLViewer = () => {
    // Clean up blob URL if it exists
    if (viewingSTL && viewingSTL.blobUrl) {
      window.URL.revokeObjectURL(viewingSTL.blobUrl);
    }
    setViewingSTL(null);
  };

  const closeImageViewer = () => {
    // Clean up blob URL if it exists
    if (viewingImage && viewingImage.blobUrl) {
      window.URL.revokeObjectURL(viewingImage.blobUrl);
    }
    setViewingImage(null);
  };

  const closePDFViewer = () => {
    // Clean up blob URL if it exists
    if (viewingPDF && viewingPDF.blobUrl) {
      window.URL.revokeObjectURL(viewingPDF.blobUrl);
    }
    setViewingPDF(null);
  };

  // Keyboard shortcuts for closing modals
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (viewingSTL) closeSTLViewer();
        if (viewingImage) closeImageViewer();
        if (viewingPDF) closePDFViewer();
      }
    };

    // Add event listener when any modal is open
    if (viewingSTL || viewingImage || viewingPDF) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewingSTL, viewingImage, viewingPDF]);

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {canUpload && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Upload Files</h3>
          <div className="space-y-3">
            <input
              type="file"
              multiple
              accept=".stl,.zip,.jpg,.jpeg,.png,.gif,.pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {uploading && (
              <p className="text-sm text-gray-600">Uploading files...</p>
            )}
          </div>
        </div>
      )}

      {/* Files List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Files ({files.length})
        </h3>
        
        {files.length === 0 ? (
          <p className="text-gray-500 text-sm">No files uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.fileType, file.originalName)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{file.originalName}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {file.fileType.includes('image') && (
                    <button
                      onClick={() => handlePreview(file)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      🖼️ Preview
                    </button>
                  )}
                  {file.fileType.includes('pdf') && (
                    <button
                      onClick={() => handlePreview(file)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      📄 Preview
                    </button>
                  )}
                  {(file.fileType.includes('stl') || file.fileType.includes('sla') || file.originalName.toLowerCase().endsWith('.stl')) && (
                    <button
                      onClick={() => handlePreview(file)}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      📐 3D View
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(file.id, file.originalName)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STL Viewer Modal */}
      {viewingSTL && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                3D Viewer: {viewingSTL.originalName}
              </h3>
              <button
                onClick={closeSTLViewer}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                title="Close Viewer"
              >
                ×
              </button>
            </div>
            
            <div className="h-96 rounded-lg overflow-hidden">
              <DynamicSTLViewer
                fileUrl={viewingSTL.blobUrl || `/api/files/${viewingSTL.id}/download`}
                width="100%"
                height="100%"
                showControls={true}
                onLoad={() => console.log('STL loaded successfully')}
                onError={(error) => {
                  console.error('STL loading error:', error);
                  toast.error('Error loading STL file. Please try downloading the file instead.');
                  closeSTLViewer();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Image Preview: {viewingImage.originalName}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = viewingImage.blobUrl;
                    a.download = viewingImage.originalName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                  title="Download Image"
                >
                  📥 Download
                </button>
                <button
                  onClick={closeImageViewer}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  title="Close Viewer"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden relative">
              <img
                src={viewingImage.blobUrl}
                alt={viewingImage.originalName}
                className="max-w-full max-h-full object-contain cursor-pointer transition-transform hover:scale-105"
                style={{ maxHeight: '100%', maxWidth: '100%' }}
                onLoad={() => console.log('Image loaded successfully')}
                onError={() => {
                  toast.error('Error loading image. Please try downloading the file instead.');
                  closeImageViewer();
                }}
                onClick={() => {
                  // Open in new tab on click for full-size viewing
                  window.open(viewingImage.blobUrl, '_blank');
                }}
              />
            </div>
            
            <div className="mt-4 text-sm text-gray-500 text-center">
              <p>File size: {formatFileSize(viewingImage.fileSize)}</p>
              <p>💡 Click image to open full-size in new tab • Press ESC to close</p>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                PDF Preview: {viewingPDF.originalName}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = viewingPDF.blobUrl;
                    a.download = viewingPDF.originalName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                  title="Download PDF"
                >
                  📥 Download
                </button>
                <button
                  onClick={() => window.open(viewingPDF.blobUrl, '_blank')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  title="Open in New Tab"
                >
                  🔗 Open in Tab
                </button>
                <button
                  onClick={closePDFViewer}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  title="Close Viewer"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="h-96 bg-gray-50 rounded-lg overflow-hidden">
              <iframe
                src={viewingPDF.blobUrl}
                title={viewingPDF.originalName}
                className="w-full h-full border-0"
                onLoad={() => console.log('PDF loaded successfully')}
                onError={() => {
                  toast.error('Error loading PDF. Please try downloading the file or opening in a new tab.');
                }}
              />
            </div>
            
            <div className="mt-4 text-sm text-gray-500 text-center">
              <p>File size: {formatFileSize(viewingPDF.fileSize)}</p>
              <p>If PDF doesn't display properly, try opening it in a new tab or downloading it • Press ESC to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 