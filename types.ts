export enum UserRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum LeaveType {
  ANNUAL = 'سنوية',
  SICK = 'مرضية',
  EMERGENCY = 'طارئة',
  UNPAID = 'بدون راتب'
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string; // In a real app, this would be hashed
  role: UserRole;
  department?: string;
  balance: number; // Annual leave balance
  // New Fields
  imageUrl?: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  joinDate?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}