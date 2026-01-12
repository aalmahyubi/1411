import { User, LeaveRequest, UserRole, LeaveStatus, LeaveType } from '../types';

const USERS_KEY = 'eijaza_users';
const LEAVES_KEY = 'eijaza_leaves';

// Initialize with default data if empty
const initData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const defaultUsers: User[] = [
      {
        id: '1',
        name: 'المدير العام',
        username: 'admin',
        password: '123',
        role: UserRole.ADMIN,
        balance: 30,
        jobTitle: 'مدير النظام',
        email: 'admin@company.com',
        joinDate: '2020-01-01'
      },
      {
        id: '2',
        name: 'أحمد محمد',
        username: 'ahmed',
        password: '123',
        role: UserRole.EMPLOYEE,
        department: 'تقنية المعلومات',
        balance: 21,
        jobTitle: 'مطور برمجيات',
        email: 'ahmed@company.com',
        phone: '0501234567',
        joinDate: '2022-03-15',
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(LEAVES_KEY)) {
    const defaultLeaves: LeaveRequest[] = [
      {
        id: '101',
        userId: '2',
        userName: 'أحمد محمد',
        type: LeaveType.SICK,
        startDate: '2023-11-01',
        endDate: '2023-11-02',
        reason: 'زكام شديد',
        status: LeaveStatus.APPROVED,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(LEAVES_KEY, JSON.stringify(defaultLeaves));
  }
};

initData();

export const storageService = {
  getUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  addUser: (user: User): void => {
    const users = storageService.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getLeaves: (): LeaveRequest[] => {
    return JSON.parse(localStorage.getItem(LEAVES_KEY) || '[]');
  },

  addLeave: (leave: LeaveRequest): void => {
    const leaves = storageService.getLeaves();
    leaves.unshift(leave); // Add to top
    localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));
  },

  updateLeaveStatus: (id: string, status: LeaveStatus): void => {
    const leaves = storageService.getLeaves();
    const index = leaves.findIndex(l => l.id === id);
    if (index !== -1) {
      leaves[index].status = status;
      localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));
      
      // If approved and annual, deduct balance (simplified logic)
      if (status === LeaveStatus.APPROVED) {
        // In a real app, calculate days difference
        const users = storageService.getUsers();
        const userIdx = users.findIndex(u => u.id === leaves[index].userId);
        if (userIdx !== -1) {
             // Logic to deduct balance would go here
             // keeping it simple for UI demo
        }
      }
    }
  },

  login: (username: string, password: string): User | undefined => {
    const users = storageService.getUsers();
    return users.find(u => u.username === username && u.password === password);
  }
};