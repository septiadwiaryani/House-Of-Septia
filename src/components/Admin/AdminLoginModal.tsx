import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, Loader2, KeyRound } from 'lucide-react';
import { AdminUser } from '../../types/index.ts';
import { loginAdmin } from '../../services/api.ts';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [username, setUsername] = useState('admin@houseofseptia.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Harap isi username dan kata sandi.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await loginAdmin(username, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin@houseofseptia.com');
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1F18]/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#FCFAF6] rounded-xl shadow-2xl border border-[#E2D7C7] overflow-hidden">
        {/* Header - Earth Tone */}
        <div className="bg-[#382A22] text-[#F7F3EC] p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src="/logo.jpg"
            alt="House of Septia Logo"
            className="w-16 h-16 rounded-full mx-auto mb-2 object-cover border border-[#634C3E] shadow-sm"
          />
          <h3 className="font-editorial text-2xl font-bold tracking-wide">
            Portal Admin House of Septia
          </h3>
          <p className="text-xs text-[#D6C7B2] mt-1">
            Masuk untuk mengelola produk, stok, pesanan, dan verifikasi bukti transfer
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Access Note */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-md text-xs text-amber-900 flex items-center justify-between">
            <div>
              <span className="font-bold">Akun Pengelola:</span>
              <p className="text-[11px] text-stone-600 font-mono">admin@houseofseptia.com / admin123</p>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-2 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-medium rounded text-[11px] cursor-pointer"
            >
              Isi Otomatis
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Username / Email Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D8CABE] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8D6444]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D8CABE] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8D6444]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#2C2724] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#403834] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk ke Admin Panel</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
