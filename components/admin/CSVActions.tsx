'use client';

import { useState, useRef } from 'react';

interface CSVActionsProps {
  productIds: string[];
  onImportComplete: () => void;
}

export default function CSVActions({ productIds, onImportComplete }: CSVActionsProps) {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = async (selectedOnly: boolean = false) => {
    setDownloading(true);
    setMessage(null);
    try {
      const ids = selectedOnly && productIds.length > 0 ? productIds.join(',') : '';
      const url = `/api/admin/product/csv${ids ? `?ids=${ids}` : ''}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Download failed');
      
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `products_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
    setDownloading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/product/csv', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setMessage({ type: 'success', text: data.message });
      onImportComplete();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => handleDownload(false)}
        disabled={downloading}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
      >
        {downloading ? '⏳' : '📥'} Download All
      </button>

      {productIds.length > 0 && (
        <button
          onClick={() => handleDownload(true)}
          disabled={downloading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
        >
          📥 Download Selected ({productIds.length})
        </button>
      )}

      <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm font-medium flex items-center gap-2">
        {uploading ? '⏳' : '📤'} Upload CSV
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {message && (
        <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </span>
      )}
    </div>
  );
}
