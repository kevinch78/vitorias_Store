import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      toast.success('Bienvenido al panel');
      navigate('/admin/pedidos');
    } else {
      toast.error('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-dark-base flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-surface border border-dark-border p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Glow background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-volt opacity-[0.03] rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-volt/10 border border-volt/20 rounded-2xl flex items-center justify-center mb-4 transform -rotate-6">
            <Lock className="w-8 h-8 text-volt" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Acceso Restringido</h1>
          <p className="text-gray-400 mt-2 text-sm text-center">Panel Administrativo Victoria</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-card border border-white/10 rounded-xl px-4 py-3 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none transition-all"
              placeholder="admin@deportes.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-card border border-white/10 rounded-xl px-4 py-3 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-volt hover:bg-volt-hover text-volt-contrast font-black uppercase tracking-wider py-3.5 rounded-xl transition-all glow-hover"
            >
              Ingresar al Sistema
            </button>
          </div>
        </form>
        
        <div className="mt-8 pt-6 border-t border-dark-border text-center">
          <p className="text-xs text-gray-500 font-mono">
            Tip: admin@victoria.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};
