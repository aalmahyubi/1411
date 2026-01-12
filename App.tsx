import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { storageService } from './services/storage';
import { Button } from './components/Button';
import { EmployeeView } from './components/EmployeeView';
import { AdminView } from './components/AdminView';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check for persistent session (simulated)
  useEffect(() => {
    const savedUser = localStorage.getItem('eijaza_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const foundUser = storageService.login(username, password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('eijaza_session', JSON.stringify(foundUser));
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('eijaza_session');
    setUsername('');
    setPassword('');
  };

  // Render Login
  if (!user) {
    return (
      <div className="min-h-screen bg-[#4f008c] flex flex-col relative overflow-hidden">
        {/* Decorative Background Circles */}
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
        <div className="absolute top-[100px] left-[-30px] w-20 h-20 bg-[#ff375e] opacity-10 rounded-full blur-xl"></div>

        {/* Top Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 text-white">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl mb-6 shadow-xl border border-white/10">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-center">نظام إجازاتي</h1>
          <p className="text-purple-200 text-sm font-medium">أهلاً بك مجدداً، سجل دخولك للمتابعة</p>
        </div>

        {/* Bottom Card Section */}
        <div className="bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] p-8 pt-12 animate-in slide-in-from-bottom-10 duration-500">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
          
          <form onSubmit={handleLogin} className="space-y-6 max-w-sm mx-auto">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 mr-1 block">اسم المستخدم</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#4f008c]/20 text-gray-800 placeholder-gray-400 font-medium transition-all"
                    placeholder="ادخل اسم المستخدم"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 mr-1 block">كلمة المرور</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[#4f008c]/20 text-gray-800 placeholder-gray-400 font-medium transition-all"
                    placeholder="•••••••"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center font-bold border border-red-100 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" className="w-full text-lg py-4 shadow-xl shadow-[#ff375e]/30">
                تسجيل الدخول
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-2">بيانات تجريبية</p>
              <div className="flex justify-center gap-4 text-xs font-mono text-gray-500 bg-gray-50 py-2 px-4 rounded-lg inline-flex mx-auto">
                <span>admin / 123</span>
                <span className="text-gray-300">|</span>
                <span>ahmed / 123</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render Dashboard based on Role
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-2xl overflow-hidden relative">
      {user.role === UserRole.ADMIN ? (
        <AdminView user={user} onLogout={handleLogout} />
      ) : (
        <EmployeeView user={user} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;