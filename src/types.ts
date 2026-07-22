export type UserRole = "tutor" | "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  isOnline: boolean;
  lastActiveAt?: string; // ISO string timestamp
  bio?: string;
  subjects?: string[];
  hourlyRate?: string;
  invitedBy?: string;
  joinedAt: string;
  theme?: "light" | "dark";
  e2eeEnabled?: boolean;
  keyFingerprint?: string;
  readReceiptsOn?: boolean;
  studentId?: string;
  language?: "english" | "bengali";
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  teacherNotes?: Record<string, string>; // Only tutors use this, key is studentId
  blockedUserIds?: string[];
  hiddenChatIds?: string[];
  mutedChatIds?: string[];
}

export interface ClassGroup {
  id: string;
  name: string;
  subject: string;
  batch: string;
  level: string;
  tutorId: string;
  tutorName: string;
  memberIds: string[];
  description?: string;
  notes?: string;
  pinnedMessageId?: string;
  mutedStudentIds: string[];
  logoUrl?: string;
  inviteCode?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "pdf" | "doc";
  url: string; // Could be a local upload URL or a base64 string or mock URL
  size: string;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  chatId: string; // Can be a ClassGroup ID or a user-to-user conversation ID (e.g., user1_user2)
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string; // ISO string
  replyToId?: string;
  replyToContent?: string; // Cache the replied message text for easier UI rendering
  reactions: MessageReaction[];
  isPinned?: boolean;
  attachments?: Attachment[];
  isEdited?: boolean;
  readBy: string[]; // List of userIds who read the message
  isEncrypted?: boolean;
  encryptedContent?: string;
}

export interface Homework {
  id: string;
  classGroupId: string;
  classGroupName: string;
  tutorId: string;
  title: string;
  description: string;
  dueDate: string; // ISO string or date string YYYY-MM-DD
  maxPoints: number;
  attachments?: Attachment[];
  createdAt: string;
}

export interface Submission {
  id: string;
  homeworkId: string;
  homeworkTitle: string;
  studentId: string;
  studentName: string;
  content: string;
  attachments?: Attachment[];
  submittedAt: string;
  grade?: string; // e.g., "A", "95/100"
  feedback?: string;
  status: "pending" | "graded";
}

export interface ClassSchedule {
  id: string;
  classGroupId: string;
  classGroupName: string;
  tutorId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  description?: string;
  attendance?: string[]; // userIds who attended
}

export interface CallSession {
  id: string;
  chatId: string; // ClassGroup.id or direct chat id
  hostId: string;
  hostName: string;
  type: "voice" | "video";
  status: "active" | "ended";
  createdAt: string;
  participants: string[]; // List of active userIds in the call
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: "message" | "homework" | "announcement" | "call" | "system";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Announcement {
  id: string;
  classGroupId: string;
  classGroupName: string;
  tutorId: string;
  tutorName: string;
  content: string;
  createdAt: string;
  pinned?: boolean;
}

export interface StudyMaterial {
  id: string;
  classGroupId: string;
  classGroupName: string;
  tutorId: string;
  title: string;
  description?: string;
  attachment: Attachment;
  uploadedAt: string;
}
