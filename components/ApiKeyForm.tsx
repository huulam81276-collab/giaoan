import React, { useState } from 'react';

interface ApiKeyFormProps {
  onSave: (apiKey: string) => void;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSave }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('Vui lòng nhập API Key.');
      return;
    }
    setError('');
    onSave(key.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-lg ring-1 ring-white/10 text-center">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight mb-2">
        Nhập Google AI API Key
      </h1>
      <p className="mt-2 text-sm text-slate-400 max-w-xs mx-auto mb-6">
        Để sử dụng ứng dụng, bạn cần cung cấp API key của riêng bạn từ Google AI Studio.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Dán API Key của bạn vào đây"
            className="w-full px-3 py-2 bg-slate-900/70 text-slate-100 border-0 rounded-md shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm transition text-center"
            aria-label="Google AI API Key"
          />
           {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
        <button
          type="submit"
          className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-colors"
        >
          Lưu và Bắt đầu
        </button>
      </form>
       <div className="mt-6 text-xs text-slate-500">
            <p>API Key của bạn sẽ được lưu trữ an toàn trong trình duyệt của bạn và không được gửi đến bất kỳ máy chủ nào khác ngoài Google.</p>
       </div>
    </div>
  );
};