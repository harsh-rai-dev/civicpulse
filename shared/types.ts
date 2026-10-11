export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'citizen' | 'admin';
  block_division?: string;
  reset_token?: string;
  reset_token_expires?: string;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
  portal: 'citizen' | 'official';
}

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
  status: 'Pending' | 'In Progress' | 'Resolved';
  admin_reply?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  complaint_id: string;
  user_id: string;
  created_at: string;
}