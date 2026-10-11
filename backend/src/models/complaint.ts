import { Storage } from '../storage';
import { Complaint } from '../../../shared/types';
import { calculatePriority, getPriorityLevel } from '../services/priority';

export async function createComplaint(data: {
  user_id: string;
  zone: string;
  block_division?: string;
  landmark: string;
  category: string;
  description: string;
  image_path?: string;
  is_emergency?: boolean;
}): Promise<Complaint> {
  const { user_id, zone, block_division, landmark, category, description, image_path, is_emergency } = data;
  const { score, level, terms } = calculatePriority(description, is_emergency);
  return Storage.addComplaint({ 
    user_id, 
    zone, 
    block_division: block_division || 'Block A', 
    landmark, 
    category, 
    description, 
    image_path, 
    is_emergency: is_emergency || false,
    priority_score: score, 
    priority_level: level,
    severity_terms: terms
  });
}

export async function getComplaintById(id: string): Promise<Complaint | undefined> {
  return Storage.getComplaintById(id);
}

export async function listComplaints(filters: {
  search?: string;
  zone?: string;
  block_division?: string;
  category?: string;
  status?: string;
  priority?: string;
  sort?: 'newest' | 'oldest' | 'priorityAsc' | 'priorityDesc';
}): Promise<Complaint[]> {
  return Storage.listComplaints(filters);
}

export async function updateComplaintStatus(id: string, status: 'Pending' | 'In Progress' | 'Resolved'): Promise<void> {
  await Storage.updateComplaintStatus(id, status);
}

export async function incrementPriorityScore(id: string, delta: number): Promise<void> {
  const complaint = await Storage.getComplaintById(id);
  if (!complaint) return;
  const newScore = complaint.priority_score + delta;
  const newLevel = getPriorityLevel(newScore);
  await Storage.adjustPriority(id, delta, newLevel);
}

export async function deleteComplaint(id: string): Promise<boolean> {
  return Storage.deleteComplaint(id);
}
