// קהילה
export interface Community {
  id: string;
  name: string;
  description: string;
  teamId?: string;
  imageURL?: string;
  memberCount: number;
  createdAt: Date;
}

// חבר בקהילה
export interface CommunityMember {
  uid: string;
  joinedAt: Date;
  role: 'member' | 'moderator' | 'admin';
}
