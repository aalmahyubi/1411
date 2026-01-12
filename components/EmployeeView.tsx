import React, { useState, useEffect } from 'react';
import { User, LeaveRequest, LeaveType, LeaveStatus, UserRole } from '../types';
import { storageService } from '../services/storage';
import { generateLeaveReason } from '../services/geminiService';
import { Button } from './Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, Plus, Wand2, X, PlusCircle, LogOut, Mail, Phone, Briefcase, User as UserIcon, Users, Home, Search, Eye } from 'lucide-react';

interface Props {
  user: User;
  onLogout: () => void;
}

export const EmployeeView: React.FC<Props> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'colleagues'>('dashboard');
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [colleagues, setColleagues] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Request Form State
  const [reason, setReason] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [formType, setFormType] = useState<LeaveType>(LeaveType.ANNUAL);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedColleague, setSelectedColleague] = useState<User | null>(null);

  useEffect(() => {
    // Load Leaves
    const allLeaves = storageService.getLeaves();
    setLeaves(allLeaves.filter(l => l.userId === user.id));

    // Load Colleagues (excluding self)
    const allUsers = storageService.getUsers();
    setColleagues(allUsers.filter(u => u.role === UserRole.EMPLOYEE && u.id !== user.id));
  }, [user.id, currentView]);

  const handleAiAssist = async () => {
    if (!keywords.trim()) return;
    setAiLoading(true);
    const generated = await generateLeaveReason(formType, keywords);
    setReason(generated);
    setAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(endDate) < new Date(startDate)) {
      alert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      return;
    }

    const newLeave: LeaveRequest = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      type: formType,
      startDate,
      endDate,
      reason,
      status: LeaveStatus.PENDING,
      createdAt: new Date().toISOString()
    };
    storageService.addLeave(newLeave);
    setIsRequestFormOpen(false);
    // Reset form
    setReason('');
    setKeywords('');
    setStartDate('');
    setEndDate('');
    // Refresh leaves
    const allLeaves = storageService.getLeaves();
    setLeaves(allLeaves.filter(l => l.userId === user.id));
  };

  // Filter Colleagues
  const filteredColleagues = colleagues.filter(c => 
    c.name.includes(searchQuery) || 
    c.username.includes(searchQuery) ||
    c.department?.includes(searchQuery) ||
    c.jobTitle?.includes(searchQuery)
  );

  // Chart Data
  const usedBalance = 30 - user.balance;
  const chartData = [
    { name: 'المتبقي', value: user.balance, color: '#4f008c' },
    { name: 'المستهلك', value: usedBalance, color: '#E5E7EB' },
  ];

  const getStatusColor = (status: LeaveStatus) => {
    switch(status) {
      case LeaveStatus.APPROVED: return 'bg-green-100 text-green-700';
      case LeaveStatus.REJECTED: return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusText = (status: LeaveStatus) => {
    switch(status) {
      case LeaveStatus.APPROVED: return 'مقبولة';
      case LeaveStatus.REJECTED: return 'مرفوضة';
      default: return 'قيد الانتظار';
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-gray-50">
      {/* Header - Purple Theme */}
      <header className="bg-[#4f008c] p-6 pb-12 shadow-md relative z-10 text-white rounded-b-[2rem]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsProfileOpen(true)} className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden flex-shrink-0 bg-white/10">
               {user.imageUrl ? (
                 <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center"><UserIcon size={20}/></div>
               )}
             </button>
             <div>
               <h1 className="text-xl font-bold">مساء الخير، {user.name.split(' ')[0]}</h1>
               <p className="text-xs text-purple-200 mt-1">{user.department || 'موظف'}</p>
             </div>
          </div>
          <button onClick={onLogout} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors text-white">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="px-4 -mt-8 relative z-20">
        
        {currentView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Balance Card */}
            <div className="bg-white rounded-3xl p-6 shadow-lg shadow-gray-200/50 flex flex-col items-center relative overflow-hidden">
              <h3 className="text-gray-500 font-medium mb-2 self-start w-full text-sm">رصيد الإجازات السنوي</h3>
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-bold text-[#4f008c]">{user.balance}</span>
                  <span className="text-xs text-gray-400 mt-1">يوم متبقي</span>
                </div>
              </div>
              
              <button 
                onClick={() => setIsRequestFormOpen(true)}
                className="mt-4 w-full py-3.5 rounded-2xl bg-[#4f008c]/5 text-[#4f008c] font-bold flex items-center justify-center gap-2 hover:bg-[#4f008c]/10 transition-colors border border-[#4f008c]/10"
              >
                <PlusCircle size={20} />
                طلب إجازة جديد
              </button>
            </div>

            {/* History List */}
            <div className="pb-4">
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-lg font-bold text-gray-800">سجل طلباتي</h3>
              </div>
              
              {leaves.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                  لا توجد طلبات سابقة
                </div>
              ) : (
                <div className="space-y-3">
                  {leaves.map(leave => (
                    <div key={leave.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-800">{leave.type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(leave.status)}`}>
                            {getStatusText(leave.status)}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 gap-3">
                          <span className="flex items-center gap-1"><Calendar size={12}/> {leave.startDate}</span>
                          <span>إلى</span>
                          <span className="flex items-center gap-1"><Calendar size={12}/> {leave.endDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'colleagues' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Search Bar */}
            <div className="bg-white p-2 rounded-2xl shadow-lg shadow-gray-200/50 mb-6 flex items-center border border-gray-100">
              <div className="p-3 text-gray-400">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="ابحث عن زميل..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-2 outline-none text-gray-700 placeholder-gray-400 bg-transparent font-medium"
              />
            </div>

            {/* Colleagues List */}
            <div className="space-y-3">
              {filteredColleagues.length === 0 ? (
                 <div className="text-center py-12 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
                    لا يوجد زملاء مطابقين للبحث
                 </div>
              ) : (
                filteredColleagues.map(colleague => (
                  <div 
                    key={colleague.id} 
                    onClick={() => setSelectedColleague(colleague)}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0">
                      {colleague.imageUrl ? (
                        <img src={colleague.imageUrl} alt={colleague.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><UserIcon size={24}/></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-lg">{colleague.name}</h4>
                      <p className="text-xs text-[#4f008c] font-medium">{colleague.jobTitle || colleague.department || 'موظف'}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-full text-gray-400">
                      <Eye size={18} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* New Request Modal (Full Screen Overlay) */}
      {isRequestFormOpen && (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto animate-in slide-in-from-bottom-10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">طلب إجازة جديد</h2>
              <button onClick={() => setIsRequestFormOpen(false)} className="p-2 bg-white shadow-sm border border-gray-100 rounded-full text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <label className="block text-sm font-bold text-gray-700">نوع الإجازة</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(LeaveType).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormType(type)}
                      className={`py-3 px-4 rounded-2xl text-sm font-bold border-2 transition-all ${
                        formType === type 
                          ? 'bg-[#4f008c]/5 border-[#4f008c] text-[#4f008c]' 
                          : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">من</label>
                    <input
                      required
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#4f008c]/20 outline-none text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">إلى</label>
                    <input
                      required
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#4f008c]/20 outline-none text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* AI Section */}
              <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 space-y-4">
                <div className="flex items-center gap-2">
                  <Wand2 size={20} className="text-[#4f008c]" />
                  <span className="text-base font-bold text-[#4f008c]">المساعد الذكي للصياغة</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="مثلاً: عندي موعد أسنان..."
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="flex-1 p-3 rounded-2xl text-sm border-none bg-white focus:ring-2 focus:ring-[#4f008c]/20 outline-none"
                  />
                  <Button 
                    type="button" 
                    variant="primary" 
                    className="!py-2 !px-4 !text-xs !bg-[#4f008c] !shadow-none !rounded-xl" 
                    onClick={handleAiAssist}
                    isLoading={aiLoading}
                  >
                    صياغة
                  </Button>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">السبب (يمكنك التعديل)</label>
                    <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-[#4f008c]/20 outline-none text-sm h-32 resize-none leading-relaxed"
                    placeholder="سيظهر النص المقترح هنا..."
                    />
                </div>
              </div>

              <div className="pt-4 pb-10">
                 <Button type="submit" className="w-full !py-4 text-lg !shadow-xl !shadow-[#ff375e]/30 !rounded-2xl">إرسال الطلب</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAB - New Request (Only on Dashboard) */}
      {currentView === 'dashboard' && (
        <button
          onClick={() => setIsRequestFormOpen(true)}
          className="fixed bottom-24 left-6 w-16 h-16 bg-[#ff375e] text-white rounded-full shadow-lg shadow-[#ff375e]/40 flex items-center justify-center hover:scale-105 transition-transform z-30"
        >
          <Plus size={32} />
        </button>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 rounded-t-[2rem]">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'dashboard' ? 'text-[#4f008c]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-[#4f008c]/10' : 'bg-transparent'}`}>
              <Home size={24} strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold">الرئيسية</span>
          </button>
          
          <button 
            onClick={() => setCurrentView('colleagues')}
            className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'colleagues' ? 'text-[#4f008c]' : 'text-gray-400 hover:text-gray-600'}`}
          >
             <div className={`p-2 rounded-xl transition-all ${currentView === 'colleagues' ? 'bg-[#4f008c]/10' : 'bg-transparent'}`}>
              <Users size={24} strokeWidth={currentView === 'colleagues' ? 2.5 : 2} />
             </div>
            <span className="text-[10px] font-bold">الزملاء</span>
          </button>
        </div>
      </div>

      {/* Colleague Profile Modal (Read Only) */}
      {selectedColleague && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-0 shadow-2xl scale-100 overflow-hidden relative">
              <button onClick={() => setSelectedColleague(null)} className="absolute top-4 left-4 p-2 bg-black/20 text-white rounded-full z-10 hover:bg-black/40"><X size={20}/></button>
              
              <div className="bg-[#4f008c] h-32 relative">
                 <div className="absolute -bottom-12 right-0 left-0 flex justify-center">
                    <div className="w-28 h-28 rounded-full bg-white p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden">
                        {selectedColleague.imageUrl ? (
                          <img src={selectedColleague.imageUrl} alt={selectedColleague.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><UserIcon size={40} /></div>
                        )}
                      </div>
                    </div>
                 </div>
              </div>

              <div className="pt-14 pb-8 px-6 text-center">
                 <h2 className="text-2xl font-bold text-gray-900">{selectedColleague.name}</h2>
                 <p className="text-[#4f008c] font-medium">{selectedColleague.jobTitle || 'موظف'}</p>
                 <p className="text-gray-400 text-sm mt-1">@{selectedColleague.username}</p>
                 
                 <div className="mt-8 space-y-4 text-right">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4f008c] shadow-sm"><Briefcase size={18}/></div>
                       <div>
                          <p className="text-xs text-gray-400">القسم</p>
                          <p className="font-bold text-gray-800 text-sm">{selectedColleague.department || 'غير محدد'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4f008c] shadow-sm"><Mail size={18}/></div>
                       <div>
                          <p className="text-xs text-gray-400">البريد الإلكتروني</p>
                          <p className="font-bold text-gray-800 text-sm">{selectedColleague.email || '-'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4f008c] shadow-sm"><Phone size={18}/></div>
                       <div>
                          <p className="text-xs text-gray-400">رقم الهاتف</p>
                          <p className="font-bold text-gray-800 text-sm">{selectedColleague.phone || '-'}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* My Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-0 shadow-2xl scale-100 overflow-hidden relative">
              <button onClick={() => setIsProfileOpen(false)} className="absolute top-4 left-4 p-2 bg-black/20 text-white rounded-full z-10 hover:bg-black/40"><X size={20}/></button>
              
              <div className="bg-[#4f008c] h-32 relative">
                 <div className="absolute -bottom-12 right-0 left-0 flex justify-center">
                    <div className="w-28 h-28 rounded-full bg-white p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden">
                        {user.imageUrl ? (
                          <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><UserIcon size={40} /></div>
                        )}
                      </div>
                    </div>
                 </div>
              </div>

              <div className="pt-14 pb-8 px-6 text-center">
                 <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                 <p className="text-[#4f008c] font-medium">{user.jobTitle || 'موظف'}</p>
                 
                 <div className="mt-8 space-y-4 text-right">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4f008c] shadow-sm"><Briefcase size={18}/></div>
                       <div>
                          <p className="text-xs text-gray-400">القسم</p>
                          <p className="font-bold text-gray-800 text-sm">{user.department || 'غير محدد'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4f008c] shadow-sm"><Mail size={18}/></div>
                       <div>
                          <p className="text-xs text-gray-400">البريد الإلكتروني</p>
                          <p className="font-bold text-gray-800 text-sm">{user.email || '-'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4f008c] shadow-sm"><Phone size={18}/></div>
                       <div>
                          <p className="text-xs text-gray-400">رقم الهاتف</p>
                          <p className="font-bold text-gray-800 text-sm">{user.phone || '-'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4f008c] shadow-sm"><Calendar size={18}/></div>
                       <div>
                          <p className="text-xs text-gray-400">تاريخ الانضمام</p>
                          <p className="font-bold text-gray-800 text-sm">{user.joinDate || '-'}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};