import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { User, Complaint, Vote } from '../../shared/types';

interface Data {
  users: User[];
  complaints: Complaint[];
  votes: Vote[];
}

const dataFile = path.resolve(process.env.DB_PATH || './data.json');

class StorageClass {
  private data: Data = { users: [], complaints: [], votes: [] };

  constructor() {
    this.load();
    this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = 'admin@civicpulse.gov.in';
    const existing = this.data.users.find(u => u.email === adminEmail);
    if (!existing) {
      const admin: User = {
        id: uuidv4(),
        name: 'Municipal Administrator',
        email: adminEmail,
        password_hash: '$2b$10$rUYNoKN0GlE9FdK64BFk8ueMCS0ISQovh8eUf9/gKwr.VMsY84Lha', // Admin@1234
        role: 'admin',
        created_at: new Date().toISOString(),
      };
      this.data.users.push(admin);
      this.save();
    }
  }

  private load() {
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, 'utf-8');
      this.data = JSON.parse(raw);
    }
  }

  private save() {
    fs.writeFileSync(dataFile, JSON.stringify(this.data, null, 2));
  }

  // User methods
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.data.users.find(u => u.id === id);
  }

  async setResetToken(email: string, token: string, expires: string): Promise<boolean> {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return false;
    user.reset_token = token;
    user.reset_token_expires = expires;
    this.save();
    return true;
  }

  async updateUserPassword(email: string, newPasswordHash: string): Promise<boolean> {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return false;
    user.password_hash = newPasswordHash;
    delete user.reset_token;
    delete user.reset_token_expires;
    this.save();
    return true;
  }

  async addUser({ name, email, passwordHash, role, block_division }: { name: string; email: string; passwordHash: string; role: 'citizen' | 'admin', block_division?: string }): Promise<User> {
    const user: User = {
      id: uuidv4(),
      name,
      email,
      password_hash: passwordHash,
      role,
      block_division,
      created_at: new Date().toISOString(),
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Complaint methods
  async addComplaint(data: { 
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
  }): Promise<Complaint> {
    const now = new Date().toISOString();
    const complaint: Complaint = {
      id: uuidv4(),
      user_id: data.user_id,
      zone: data.zone,
      block_division: data.block_division,
      landmark: data.landmark,
      category: data.category,
      description: data.description,
      image_path: data.image_path,
      is_emergency: data.is_emergency,
      priority_score: data.priority_score,
      priority_level: data.priority_level,
      severity_terms: data.severity_terms,
      status: 'Pending',
      created_at: now,
      updated_at: now,
    };
    this.data.complaints.push(complaint);
    this.save();
    return complaint;
  }

  async getComplaintById(id: string): Promise<Complaint | undefined> {
    return this.data.complaints.find(c => c.id === id);
  }

  async listComplaints(filters: { search?: string; zone?: string; block_division?: string; category?: string; status?: string; priority?: string; sort?: 'newest' | 'oldest' | 'priorityAsc' | 'priorityDesc' }): Promise<Complaint[]> {
    let result = this.data.complaints.slice();
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(c => c.description.toLowerCase().includes(s) || c.landmark.toLowerCase().includes(s) || c.category.toLowerCase().includes(s));
    }
    if (filters.zone) result = result.filter(c => c.zone === filters.zone);
    if (filters.block_division) result = result.filter(c => c.block_division === filters.block_division);
    if (filters.category) result = result.filter(c => c.category === filters.category);
    if (filters.status) result = result.filter(c => c.status === filters.status);
    if (filters.priority) result = result.filter(c => c.priority_level === filters.priority);
    if (filters.sort) {
      switch (filters.sort) {
        case 'newest': result.sort((a, b) => b.created_at.localeCompare(a.created_at)); break;
        case 'oldest': result.sort((a, b) => a.created_at.localeCompare(b.created_at)); break;
        case 'priorityAsc': result.sort((a, b) => a.priority_score - b.priority_score); break;
        case 'priorityDesc': result.sort((a, b) => b.priority_score - a.priority_score); break;
      }
    }
    return result;
  }

  async updateComplaintStatus(id: string, status: 'Pending' | 'In Progress' | 'Resolved'): Promise<void> {
    const complaint = this.data.complaints.find(c => c.id === id);
    if (complaint) {
      complaint.status = status;
      complaint.updated_at = new Date().toISOString();
      this.save();
    }
  }

  async adjustPriority(id: string, delta: number, newLevel: string): Promise<void> {
    const complaint = this.data.complaints.find(c => c.id === id);
    if (complaint) {
      complaint.priority_score += delta;
      complaint.priority_level = newLevel;
      complaint.updated_at = new Date().toISOString();
      this.save();
    }
  }

  async deleteComplaint(id: string): Promise<boolean> {
    const idx = this.data.complaints.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.complaints.splice(idx, 1);
    this.data.votes = this.data.votes.filter(v => v.complaint_id !== id);
    this.save();
    return true;
  }

  async setComplaintResolution(id: string, reply: string): Promise<void> {
    const complaint = this.data.complaints.find(c => c.id === id);
    if (complaint) {
      complaint.admin_reply = reply;
      complaint.resolved_at = new Date().toISOString();
      complaint.updated_at = new Date().toISOString();
      this.save();
    }
  }

  // Vote methods
  async addVote(user_id: string, complaint_id: string): Promise<Vote> {
    const vote: Vote = {
      id: uuidv4(),
      user_id,
      complaint_id,
      created_at: new Date().toISOString(),
    };
    this.data.votes.push(vote);
    this.save();
    return vote;
  }

  async hasUserVoted(user_id: string, complaint_id: string): Promise<boolean> {
    return this.data.votes.some(v => v.user_id === user_id && v.complaint_id === complaint_id);
  }

  async getVoteCount(complaint_id: string): Promise<number> {
    return this.data.votes.filter(v => v.complaint_id === complaint_id).length;
  }
}

export const Storage = new StorageClass();
