import React, { useEffect, useState } from 'react';
import api from '../api';
import { FaHistory, FaClock, FaUser } from 'react-icons/fa';

const AdminLogsManager = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/logs');
      setLogs(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('İşlem geçmişi alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return <div className="text-center py-10">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <FaHistory className="text-accent" />
          İşlem Geçmişi
        </h2>
        <button 
          onClick={fetchLogs}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm transition"
        >
          Yenile
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Henüz bir işlem kaydedilmedi.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-gray-800">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="p-4 rounded-tl-lg font-semibold text-gray-600">ID</th>
                <th className="p-4 font-semibold text-gray-600">Admin</th>
                <th className="p-4 font-semibold text-gray-600">İşlem</th>
                <th className="p-4 rounded-tr-lg font-semibold text-gray-600">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr 
                  key={log.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition`}
                >
                  <td className="p-4 text-gray-500 text-sm">#{log.id}</td>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <FaUser className="text-gray-400 text-sm" />
                    {log.username || 'Bilinmiyor'}
                  </td>
                  <td className="p-4">{log.action_text}</td>
                  <td className="p-4 text-sm text-gray-500 flex items-center gap-2">
                    <FaClock className="text-gray-400" />
                    {formatDate(log.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLogsManager;
