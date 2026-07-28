export type ContentType = "text" | "image" | "video" | "url";

export type DetectionModule =
  | "ai_generation"
  | "deepfake"
  | "enhancement"
  | "metadata";

export type ScanResult =
  | "human"
  | "ai_generated"
  | "ai_edited"
  | "ai_enhanced"
  | "deepfake"
  | "mixed"
  | "inconclusive";

export type ProcessingStatus =
  | "queued"
  | "uploading"
  | "validating"
  | "extracting_metadata"
  | "preparing"
  | "analyzing"
  | "generating_report"
  | "completed"
  | "failed"
  | "canceled";

export type BatchStatus =
  | "queued"
  | "uploading"
  | "validating"
  | "processing"
  | "completed"
  | "failed"
  | "canceled";

export type UserRole = "owner" | "admin" | "analyst" | "reviewer" | "viewer";

export interface ScanFile {
  id: string;
  name: string;
  type: ContentType;
  size: number;
  url?: string;
  mimeType?: string;
}

export interface TextSignal {
  name: string;
  description: string;
  score: number;
  confidence: number;
  passages?: Array<{ start: number; end: number; text: string; likelihood: number }>;
}

export interface ImageSignal {
  name: string;
  description: string;
  score: number;
  confidence: number;
  regions?: Array<{ x: number; y: number; width: number; height: number; severity: number }>;
}

export interface VideoSignal {
  name: string;
  description: string;
  score: number;
  confidence: number;
  timestamps?: Array<{ start: number; end: number; severity: number }>;
}

export interface MetadataField {
  label: string;
  value: string | null;
  warning?: string;
}

export interface ScanMetadata {
  fileName?: string;
  fileType?: string;
  dimensions?: { width: number; height: number };
  fileSize?: number;
  createdAt?: string;
  modifiedAt?: string;
  camera?: string;
  software?: string;
  colorProfile?: string;
  hasGPS?: boolean;
  compressionHistory?: string;
  integrityWarnings?: string[];
  rawExif?: Record<string, unknown>;
}

export interface ScanReport {
  id: string;
  scanId: string;
  userId?: string;
  contentName: string;
  contentType: ContentType;
  status: ProcessingStatus;
  result: ScanResult;
  overallScore: number;
  confidenceScore: number;
  evidenceStrength: "strong" | "moderate" | "weak" | "insufficient";
  modules: DetectionModule[];
  textSignals?: TextSignal[];
  imageSignals?: ImageSignal[];
  videoSignals?: VideoSignal[];
  metadata?: ScanMetadata;
  fileHash?: string;
  modelVersion: string;
  limitations: string[];
  recommendations: string[];
  createdAt: string;
  completedAt?: string;
  shareToken?: string;
  shareExpiresAt?: string;
  tags?: string[];
  notes?: string;
}

export interface BatchItem {
  id: string;
  batchId: string;
  file: ScanFile;
  status: ProcessingStatus;
  result?: ScanResult;
  confidenceScore?: number;
  scanId?: string;
  error?: string;
  progress: number;
}

export interface BatchJob {
  id: string;
  userId: string;
  name: string;
  status: BatchStatus;
  items: BatchItem[];
  totalItems: number;
  completedItems: number;
  failedItems: number;
  modules: DetectionModule[];
  createdAt: string;
  completedAt?: string;
  reportUrl?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  joinedAt: string;
  lastActiveAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  members: TeamMember[];
  memberLimit: number;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt?: string;
  requestCount: number;
  rateLimit: number;
  createdAt: string;
  revokedAt?: string;
  isActive: boolean;
}

export interface ApiActivity {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  ip?: string;
}

export interface DashboardStats {
  totalScans: number;
  textScans: number;
  imageScans: number;
  videoScans: number;
  likelyAiGenerated: number;
  likelyHuman: number;
  enhanced: number;
  inconclusive: number;
  scansOverTime: Array<{ date: string; scans: number }>;
  contentTypeDistribution: Array<{ type: string; count: number }>;
  resultDistribution: Array<{ result: string; count: number }>;
  avgConfidenceByType: Array<{ type: string; confidence: number }>;
}

export interface Notification {
  id: string;
  type: "scan_complete" | "batch_complete" | "share_accessed" | "team_invite" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface PlatformConfig {
  maxBatchFiles: number;
  maxBatchSizeMb: number;
  maxVideoMinutes: number;
  maxConcurrentJobs: number;
  maxApiKeysPerUser: number;
  maxWorkspaceMembers: number;
  guestScanLimit: number;
  retentionDays: number;
}

export const PLATFORM_CONFIG: PlatformConfig = {
  maxBatchFiles: 50,
  maxBatchSizeMb: 500,
  maxVideoMinutes: 30,
  maxConcurrentJobs: 3,
  maxApiKeysPerUser: 10,
  maxWorkspaceMembers: 25,
  guestScanLimit: 1,
  retentionDays: 30,
};

export const DISCLAIMER =
  "AI SHEILD provides a probability-based analysis. Results may contain false positives or false negatives and should not be treated as definitive proof that content was generated or modified by AI.";

export const RESULT_LABELS: Record<ScanResult, string> = {
  human: "Likely Human-Created",
  ai_generated: "Likely AI-Generated",
  ai_edited: "Likely AI-Edited",
  ai_enhanced: "Likely AI-Enhanced",
  deepfake: "Likely Deepfake",
  mixed: "Mixed or Partially Synthetic",
  inconclusive: "Inconclusive",
};

export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
export const SUPPORTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"];
export const SUPPORTED_TEXT_TYPES = ["text/plain", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export const MAX_IMAGE_SIZE_MB = 50;
export const MAX_VIDEO_SIZE_MB = 2048;
export const MAX_TEXT_SIZE_MB = 10;
