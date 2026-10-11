import { Storage } from '../storage';

export async function addVote(userId: string, complaintId: string): Promise<void> {
  await Storage.addVote(userId, complaintId);
  // Increase priority score by 1 (example weight)
  const complaint = await Storage.getComplaintById(complaintId);
  if (complaint) {
    const newScore = complaint.priority_score + 1;
    const newLevel = require('../services/priority').getPriorityLevel(newScore);
    await Storage.adjustPriority(complaintId, 1, newLevel);
  }
}

export async function hasUserVoted(userId: string, complaintId: string): Promise<boolean> {
  return Storage.hasUserVoted(userId, complaintId);
}

export async function getVoteCount(complaintId: string): Promise<number> {
  return Storage.getVoteCount(complaintId);
}
