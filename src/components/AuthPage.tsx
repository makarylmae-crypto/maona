// full path: /src/components/AuthPage.tsx
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface AuthPageProps {
  mode: 'login' | 'register';
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'resident' | 'admin';
}

export default function AuthPage({ mode }: AuthPageProps) {
  const { register, login } = useApp();
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'resident' as 'farmer' | 'resident',
    address: '', phone: '', farmName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // dynamic users list from DB for quick login
  const [demoUsers, setDemoUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isLogin) {
      fetch('/api/users') // fetch all users from database
        .then(res => res.json())
        .then((data) => {
          // filter by role or just take all for quick login
          setDemoUsers(data.rows || []);
        })
        .catch(console.error);
    }
  }, [isLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (isLogin) {
      const err = login(formData.email, formData.password);
      if (err) setError(err);
      else setSuccess('Login successful! Welcome back!');
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields'); return;
      }
      if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
      if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
      const extra: Record<string, string> = {};
      if (formData.role === 'farmer') {
        if (!formData.farmName) { setError('Farm name is required for farmers'); return; }
        extra.farmName = formData.farmName;
      }
      extra.address = formData.address || 'Hinunangan, Southern Leyte';
      if (formData.phone) extra.phone = formData.phone;
      const err = register(formData.name, formData.email, formData.password, formData.role, extra);
      if (err) setError(err);
      else setSuccess('Registration successful! Welcome to FreshKart PH!');
    }
  };

  const handleDemoLogin = (email: string, password: string) => {
    setFormData({ ...formData, email, password });
    setLoggingIn(true);
    setTimeout(() => {
      const err = login(email, password);
      if (err) setError(err);
      setLoggingIn(false);
    }, 300);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a1a] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-4">{isLogin ? '🌱' : '🌿'}</span>
          <h1 className="text-3xl font-bold text-[#e8eaf6]">
            {isLogin ? 'Welcome Back!' : 'Join FreshKart PH'}
          </h1>
          <p className="text-[#6b708d] mt-2">
            {isLogin ? 'Sign in to your account' : 'Create your account and start connecting'}
          </p>
          {isLogin && (
            <p className="text-[#6b708d] text-xs mt-1">📍 Hinunangan, Southern Leyte</p>
          )}
        </div>

        {/* DEMO USERS from DB */}
        {isLogin && demoUsers.length > 0 && (
          <div className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a4a] p-5 mb-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">🚀</span>
              <p className="text-sm font-medium text-[#a0a4b8]">Quick Login — Click any user</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {demoUsers.map(user => (
                <button
                  key={user.email}
                  type="button"
                  disabled={loggingIn}
                  onClick={() => handleDemoLogin(user.email, 'password123')} // default password or fetch from DB securely
                  className="px-4 py-3 rounded-xl text-sm font-medium bg-[#448aff]/10 text-[#82b1ff] border border-[#448aff]/20 flex items-center justify-between hover:brightness-125 transition-all"
                >
                  <span>{user.role === 'farmer' ? '👨‍🌾' : user.role === 'resident' ? '🏠' : '⚙️'} {user.name}</span>
                  <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">→ Click to login</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* login/register toggle */}
        <div className="flex bg-[#1a1a2e] rounded-xl p-1 border border-[#2a2a4a] mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isLogin ? 'bg-[#00c853] text-[#0a0a1a] shadow-sm' : 'text-[#6b708d] hover:text-[#a0a4b8]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              !isLogin ? 'bg-[#00c853] text-[#0a0a1a] shadow-sm' : 'text-[#6b708d] hover:text-[#a0a4b8]'
            }`}
          >
            Register
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a4a] p-6 space-y-4 shadow-xl shadow-black/20">
          {error && <div className="bg-[#ff5252]/10 border border-[#ff5252]/30 text-[#ff5252] px-4 py-3 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-[#00c853]/10 border border-[#00c853]/30 text-[#00e676] px-4 py-3 rounded-lg text-sm">{success}</div>}

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'resident' })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${formData.role === 'resident' ? 'border-[#00c853] bg-[#00c853]/10' : 'border-[#2a2a4a] hover:border-[#3a3a5a]'}`}
                  >
                    <span className="text-2xl block mb-1">🏠</span>
                    <span className="text-sm font-medium text-[#e8eaf6]">Resident</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'farmer' })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${formData.role === 'farmer' ? 'border-[#00c853] bg-[#00c853]/10' : 'border-[#2a2a4a] hover:border-[#3a3a5a]'}`}
                  >
                    <span className="text-2xl block mb-1">👨‍🌾</span>
                    <span className="text-sm font-medium text-[#e8eaf6]">Farmer</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Full Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter your full name" required className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6]" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Email *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" required className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6]" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Password *</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter your password" required className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6]" />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Confirm Password *</label>
                <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Confirm your password" className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6]" />
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#00c853]/20">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
