export type UserRole = 'citizen' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  block_division?: string;
  created_at: string;
}

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface Complaint {
  id: string;
  user_id: string;
  zone: string;
  block_division: string;
  landmark: string;
  category: string;
  description: string;
  image_path?: string;
  is_emergency: boolean;
  priority_score: number;
  priority_level: string;
  severity_terms?: string[];
  status: ComplaintStatus;
  admin_reply?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  hasVoted?: boolean;
  voteCount?: number;
}

export interface Vote {
  id: string;
  complaint_id: string;
  user_id: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AdminStats {
  total: number;
  critical: number;
  high: number;
  pending: number;
  inProgress: number;
  resolved: number;
}
