import { useState, useCallback, useRef } from 'react';
import { FaCloudUploadAlt, FaSpinner, FaCheck, FaTimes, FaTrash, FaLink } from 'react-icons/fa';
import api from '../api';

const ImageUploader = ({ 
  value, 
  onChange, 
  placeholder = "Görsel yüklemek için sürükle-bırak veya tıkla",
  accept = "image/*",
  maxSize = 10, // MB
  showPreview = true,
  previewClassName = "w-full h-48",
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('upload'); // 'upload' or 'url'
  const fileInputRef = useRef(null);

  // Sürükle-bırak event handler'ları
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  // Dosya seçme
  const handleFileSelect = useCallback((e) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  // Dosya işleme ve yükleme
  const handleFile = async (file) => {
    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyaları yüklenebilir');
      return;
    }

    // Dosya boyutu kontrolü
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Dosya boyutu ${maxSize}MB'dan büyük olamaz`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.data.success) {
        onChange(response.data.url);
        setError(null);
      } else {
        setError('Yükleme başarısız');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Yükleme sırasında bir hata oluştu');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // URL değişikliği
  const handleUrlChange = (e) => {
    onChange(e.target.value);
    setError(null);
  };

  // Görseli kaldır
  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Google Drive URL dönüştürme
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
      const fileId = idMatch ? idMatch[1] : null;
      if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`;
      }
    }
    return url;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            mode === 'upload' 
              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FaCloudUploadAlt size={14} />
          Dosya Yükle
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            mode === 'url' 
              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <FaLink size={14} />
          URL Gir
        </button>
      </div>

      {mode === 'upload' ? (
        /* Sürükle-Bırak Alanı */
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
            ${isDragging 
              ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
            ${isUploading ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />

          {isUploading ? (
            <div className="space-y-3">
              <FaSpinner className="mx-auto text-3xl text-blue-500 animate-spin" />
              <p className="text-gray-600">Yükleniyor... %{uploadProgress}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <FaCloudUploadAlt className={`mx-auto text-4xl ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-gray-600">{placeholder}</p>
              <p className="text-xs text-gray-400">
                Maksimum dosya boyutu: {maxSize}MB
              </p>
            </div>
          )}
        </div>
      ) : (
        /* URL Girişi */
        <div>
          <input
            type="url"
            value={value || ''}
            onChange={handleUrlChange}
            placeholder="https://... veya Google Drive linki"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Direkt URL veya Google Drive linki desteklenir
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <FaTimes />
          {error}
        </div>
      )}

      {/* Preview */}
      {showPreview && value && (
        <div className="relative group">
          <div className={`${previewClassName} rounded-lg overflow-hidden bg-gray-100 border border-gray-200`}>
            <img
              src={getImageUrl(value)}
              alt="Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%239ca3af" font-size="12">Görsel yüklenemedi</text></svg>';
              }}
            />
          </div>
          
          {/* Overlay with Remove Button */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              <FaTrash />
              Kaldır
            </button>
          </div>

          {/* Success Badge */}
          <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full">
            <FaCheck size={12} />
          </div>
        </div>
      )}

      {/* Current URL Display */}
      {value && (
        <div className="text-xs text-gray-500 truncate bg-gray-50 p-2 rounded">
          <span className="font-medium">URL:</span> {value}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

