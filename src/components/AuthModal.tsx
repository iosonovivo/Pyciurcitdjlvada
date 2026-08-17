import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, X, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!username.trim()) {
          throw new Error('Inserisci un nome utente');
        }
        if (password.length < 6) {
          throw new Error('La password deve contenere almeno 6 caratteri');
        }
        
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update display name (username)
        await updateProfile(userCredential.user, {
          displayName: username,
        });
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
      }
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Errore autenticazione:", err);
      let localizedError = err.message;
      if (err.code === 'auth/email-already-in-use') {
        localizedError = 'Questa email è già registrata. Effettua il login.';
      } else if (err.code === 'auth/invalid-email') {
        localizedError = 'Indirizzo email non valido.';
      } else if (err.code === 'auth/weak-password') {
        localizedError = 'La password deve contenere almeno 6 caratteri.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        localizedError = 'Credenziali non valide. Riprova.';
      } else if (err.code === 'auth/invalid-credential') {
        localizedError = 'Credenziali non valide.';
      }
      setError(localizedError);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Errore Google login:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="auth-modal-overlay">
      <div 
        className="relative w-full max-w-md bg-[#0b1329] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        id="auth-modal-card"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span>{isRegister ? 'Crea Account' : 'Bentornato su PyCircuit'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isRegister ? 'Registrati per salvare i tuoi progressi e kit.' : 'Accedi per continuare il tuo percorso hardware.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/40 transition"
            id="auth-modal-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs" id="auth-error-alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10" id="auth-form">
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">Nome Utente</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Inserisci il tuo nome"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition"
                  id="auth-input-username"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="nome@esempio.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition"
                id="auth-input-email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 tracking-wide uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition"
                id="auth-input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-slate-300"
                id="auth-btn-toggle-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/5 active:scale-[0.98] disabled:opacity-50"
            id="auth-btn-submit"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Registrati' : 'Accedi'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest relative z-10">
          <div className="flex-grow border-t border-slate-800/80"></div>
          <span className="flex-shrink mx-4">Oppure</span>
          <div className="flex-grow border-t border-slate-800/80"></div>
        </div>

        {/* Social SSO */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-300 flex items-center justify-center gap-2 relative z-10"
          id="auth-btn-google-sso"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Accedi con Google</span>
        </button>

        {/* Footer switcher */}
        <div className="text-center text-xs text-slate-500 relative z-10 pt-2">
          {isRegister ? (
            <p>
              Hai già un account?{' '}
              <button 
                onClick={() => setIsRegister(false)} 
                className="font-bold text-orange-400 hover:text-orange-300 underline underline-offset-4"
                id="auth-switch-to-login"
              >
                Accedi qui
              </button>
            </p>
          ) : (
            <p>
              Non hai ancora un account?{' '}
              <button 
                onClick={() => setIsRegister(true)} 
                className="font-bold text-orange-400 hover:text-orange-300 underline underline-offset-4"
                id="auth-switch-to-register"
              >
                Crea account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
