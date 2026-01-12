import React, { useState, useEffect } from 'react';
import { User, LeaveRequest, LeaveStatus, UserRole, LeaveType } from '../types';
import { storageService } from '../services/storage';
import { Button } from './Button';
import { Check, X, UserPlus, Users, ClipboardList, CalendarPlus, LogOut, Search, Upload, Mail, Phone, Calendar, Briefcase, Eye } from 'lucide-react';

interface Props {
  user: User;
  onLogout: () => void;
}

export const AdminView: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // New User Form State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newJoinDate, setNewJoinDate] = useState('');
  const [newImage, setNewImage] = useState<string>('');

  // Modals State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Manual Leave State
  const [manualLeaveType, setManualLeaveType] = useState<LeaveType>(LeaveType.ANNUAL);
  const [manualStartDate, setManualStartDate] = useState('');
  const [manualEndDate, setManualEndDate] = useState('');

  const refreshData = () => {
    setRequests(storageService.getLeaves());
    setEmployees(storageService.getUsers().filter(u => u.role === UserRole.EMPLOYEE));
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const handleStatusChange = (id: string, status: LeaveStatus) => {
    storageService.updateLeaveStatus(id, status);
    refreshData();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Date.now().toString(),
      name: newName,
      username: newUsername,
      password: newPassword,
      role: UserRole.EMPLOYEE,
      department: newDept,
      jobTitle: newJobTitle,
      email: newEmail,
      phone: newPhone,
      joinDate: newJoinDate,
      imageUrl: newImage,
      balance: 30
    };
    storageService.addUser(newUser);
    // Reset Form
    setNewName(''); setNewUsername(''); setNewPassword(''); setNewDept('');
    setNewJobTitle(''); setNewEmail(''); setNewPhone(''); setNewJoinDate(''); setNewImage('');
    setIsAddUserOpen(false);
    alert('تم إضافة الموظف بنجاح');
    refreshData();
  };

  const openLeaveModal = (user: User) => {
    setSelectedUser(user);
    setManualLeaveType(LeaveType.ANNUAL);
    setManualStartDate('');
    setManualEndDate('');
    setIsLeaveModalOpen(true);
  };

  const openUserDetailModal = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
  };

  const handleManualLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (new Date(manualEndDate) < new Date(manualStartDate)) {
      alert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
      return;
    }

    const newLeave: LeaveRequest = {
      id: Date.now().toString(),
      userId: selectedUser.id,
      userName: selectedUser.name,
      type: manualLeaveType,
      startDate: manualStartDate,
      endDate: manualEndDate,
      reason: 'تم تسجيلها بواسطة الإدارة',
      status: LeaveStatus.APPROVED, // Auto approved by admin
      createdAt: new Date().toISOString()
    };

    storageService.addLeave(newLeave);
    setIsLeaveModalOpen(false);
    refreshData();
    alert('تم تسجيل الإجازة بنجاح');
  };

  // Filter Logic
  const filteredEmployees = employees.filter(emp => 
    emp.name.includes(searchQuery) || 
    emp.username.includes(searchQuery) ||
    emp.department?.includes(searchQuery)
  );

  const pendingRequests = requests.filter(r => r.status === LeaveStatus.PENDING);
  const historyRequests = requests.filter(r => r.status !== LeaveStatus.PENDING);

  return (
    <div className="min-h-screen pb-20 relative bg-[#f8f9fa]">
      <header className="bg-[#4f008c] text-white p-6 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">لوحة الإدارة</h1>
            <p className="text-xs text-purple-200">إدارة الموظفين والطلبات</p>
          </div>
          <button onClick={onLogout} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors flex items-center gap-1">
             <LogOut size={14} /> خروج
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex p-4 gap-3">
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'requests' ? 'bg-[#4f008c] text-white shadow-lg shadow-purple-200' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          <ClipboardList size={18} />
          الطلبات
          {pendingRequests.length > 0 && <span className="bg-[#ff375e] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{pendingRequests.length}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeTab === 'users' ? 'bg-[#4f008c] text-white shadow-lg shadow-purple-200' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
        >
          <Users size={18} />
          الموظفين
        </button>
      </div>

      <div className="px-4 space-y-4">
        {activeTab === 'requests' && (
          <>
            {/* Pending Requests */}
            <h3 className="font-bold text-gray-800 text-lg mt-2 px-1">طلبات قيد الانتظار</h3>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8 bg-white rounded-3xl border border-dashed border-gray-200">لا توجد طلبات جديدة</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{req.userName}</h4>
                        <span className="text-xs bg-purple-50 text-[#4f008c] px-2 py-1 rounded-lg mt-1 inline-block font-medium">{req.type}</span>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-gray-700">{req.startDate}</div>
                        <div className="text-xs text-gray-400">إلى {req.endDate}</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 mb-4 border-none">
                      "{req.reason}"
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        variant="primary" 
                        className="flex-1 !py-2.5 !bg-green-600 hover:!bg-green-700 !shadow-none"
                        onClick={() => handleStatusChange(req.id, LeaveStatus.APPROVED)}
                      >
                        <Check size={18} className="ml-1" /> موافقة
                      </Button>
                      <Button 
                        variant="danger" 
                        className="flex-1 !py-2.5"
                        onClick={() => handleStatusChange(req.id, LeaveStatus.REJECTED)}
                      >
                        <X size={18} className="ml-1" /> رفض
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <h3 className="font-bold text-gray-800 text-lg mt-6 mb-2 px-1">السجل السابق</h3>
            <div className="space-y-2 opacity-80">
              {historyRequests.slice(0, 5).map(req => (
                <div key={req.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                  <span className="text-sm font-bold text-gray-700">{req.userName}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${req.status === LeaveStatus.APPROVED ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {req.status === LeaveStatus.APPROVED ? 'مقبول' : 'مرفوض'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="بحث عن موظف..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-gray-100 text-sm focus:ring-2 focus:ring-[#4f008c]/20 outline-none shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <button 
                onClick={() => setIsAddUserOpen(!isAddUserOpen)}
                className="bg-[#4f008c] text-white p-3 rounded-2xl shadow-lg shadow-[#4f008c]/30 hover:bg-[#3d006e]"
              >
                <UserPlus size={20} />
              </button>
            </div>

            {/* Add User Form (Collapsible) */}
            {isAddUserOpen && (
              <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100 animate-in slide-in-from-top-4">
                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">بيانات الموظف الجديد</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                  
                  {/* Image Upload */}
                  <div className="flex justify-center mb-4">
                    <div className="relative group">
                       <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                         {newImage ? <img src={newImage} alt="Preview" className="w-full h-full object-cover" /> : <Upload className="text-gray-400" />}
                       </div>
                       <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                       <div className="text-xs text-center text-gray-400 mt-1">اضغط لرفع صورة</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <input type="text" placeholder="الاسم الكامل *" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#4f008c]/20 outline-none" />
                    <input type="text" placeholder="المسمى الوظيفي" value={newJobTitle} onChange={e => setNewJobTitle(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#4f008c]/20 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="القسم" value={newDept} onChange={e => setNewDept(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#4f008c]/20 outline-none" />
                    <input type="date" placeholder="تاريخ الانضمام" value={newJoinDate} onChange={e => setNewJoinDate(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#4f008c]/20 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input type="email" placeholder="البريد الإلكتروني" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#4f008c]/20 outline-none" />
                    <input type="tel" placeholder="رقم الهاتف" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#4f008c]/20 outline-none" />
                  </div>

                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                    <p className="text-xs text-[#4f008c] font-bold mb-2">بيانات الدخول</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="اسم المستخدم *" required value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full p-3 bg-white rounded-xl border-none text-sm focus:ring-2 focus:ring-[#4f008c]/20 outline-none" />
                      <input type="password" placeholder="كلمة المرور *" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 bg-white rounded-xl border-none text-sm focus:ring-2 focus:ring-[#4f008c]/20 outline-none" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => setIsAddUserOpen(false)} className="flex-1">إلغاء</Button>
                    <Button type="submit" className="flex-1 !bg-[#4f008c] !shadow-[#4f008c]/30">حفظ الموظف</Button>
                  </div>
                </form>
              </div>
            )}

            {/* Employee List */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 px-1">قائمة الموظفين ({filteredEmployees.length})</h3>
              <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 min-h-[300px]">
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">لا يوجد نتائج للبحث</div>
                ) : (
                  filteredEmployees.map((emp, idx) => (
                    <div key={emp.id} className={`p-4 ${idx !== filteredEmployees.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3" onClick={() => openUserDetailModal(emp)}>
                          <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                            {emp.imageUrl ? (
                              <img src={emp.imageUrl} alt={emp.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                <Users size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 flex items-center gap-1">
                                {emp.name}
                                <Eye size={12} className="text-gray-400" />
                            </div>
                            <div className="text-xs text-gray-400 font-medium">@{emp.username} • {emp.jobTitle || emp.department || 'موظف'}</div>
                          </div>
                        </div>
                        <div className="text-center bg-purple-50 px-3 py-1.5 rounded-xl">
                          <div className="text-[10px] text-gray-500 font-bold">الرصيد</div>
                          <div className="font-bold text-[#4f008c] text-lg">{emp.balance}</div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                         <button 
                           onClick={() => openLeaveModal(emp)}
                           className="flex items-center gap-1.5 text-xs font-bold text-[#4f008c] bg-[#4f008c]/5 px-3 py-2 rounded-lg hover:bg-[#4f008c]/10 transition-colors"
                         >
                           <CalendarPlus size={14} />
                           تسجيل إجازة
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-[#4f008c]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl scale-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">تسجيل إجازة للموظف</h3>
            <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl">للموظف: <span className="font-bold text-[#4f008c]">{selectedUser?.name}</span></p>
            
            <form onSubmit={handleManualLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نوع الإجازة</label>
                <select 
                  value={manualLeaveType}
                  onChange={(e) => setManualLeaveType(e.target.value as LeaveType)}
                  className="w-full p-3.5 rounded-xl bg-gray-50 border-none text-sm outline-none focus:ring-2 focus:ring-[#4f008c]/20"
                >
                  {Object.values(LeaveType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">من</label>
                   <input type="date" required value={manualStartDate} onChange={e => setManualStartDate(e.target.value)} className="w-full p-3 rounded-xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-[#4f008c]/20 outline-none" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1">إلى</label>
                   <input type="date" required value={manualEndDate} onChange={e => setManualEndDate(e.target.value)} className="w-full p-3 rounded-xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-[#4f008c]/20 outline-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={() => setIsLeaveModalOpen(false)} className="flex-1 !py-3.5 !rounded-xl">إلغاء</Button>
                <Button type="submit" className="flex-1 !py-3.5 !rounded-xl !shadow-[#ff375e]/30">تسجيل</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {isUserDetailOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-0 shadow-2xl scale-100 overflow-hidden relative">
              <button onClick={() => setIsUserDetailOpen(false)} className="absolute top-4 left-4 p-2 bg-black/20 text-white rounded-full z-10 hover:bg-black/40"><X size={20}/></button>
              
              {/* Cover/Header */}
              <div className="bg-[#4f008c] h-32 relative">
                 <div className="absolute -bottom-12 right-0 left-0 flex justify-center">
                    <div className="w-28 h-28 rounded-full bg-white p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden">
                        {selectedUser.imageUrl ? (
                          <img src={selectedUser.imageUrl} alt={selectedUser.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><Users size={40} /></div>
                        )}
                      </div>
                    </div>
                 </div>
              </div>

              <div className="pt-14 pb-8 px-6 text-center">
                 <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                 <p className="text-[#4f008c] font-medium">{selectedUser.jobTitle || 'موظف'}</p>
                 <p className="text-gray-400 text-sm">@{selectedUser.username}</p>

                 <div className="mt-8 space-y-4 text-right">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4f008c] shadow-sm"><Briefcase size={18}/></div>
                       <div>
                          <p className="text-xs text-gray-400">القسم</p>
                          <p className="font-bold text-gray-800 text-sm">{selectedUser.department || 'غير محدد'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4f008c] shadow-sm"><Mail size={18}/></div>
                       <div>
                          <p className="text-xs text-gray-400">البريد الإلكتروني</p>
                          <p className="font-bold text-gray-800 text-sm">{selectedUser.email || '-'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4f008c] shadow-sm"><Phone size={18}/></div>
                       <div>
                          <p className="text-xs text-gray-400">رقم الهاتف</p>
                          <p className="font-bold text-gray-800 text-sm">{selectedUser.phone || '-'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4f008c] shadow-sm"><Calendar size={18}/></div>
                       <div>
                          <p className="text-xs text-gray-400">تاريخ الانضمام</p>
                          <p className="font-bold text-gray-800 text-sm">{selectedUser.joinDate || '-'}</p>
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