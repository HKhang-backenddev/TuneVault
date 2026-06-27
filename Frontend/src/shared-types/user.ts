// Shared User type used across the Frontend.
// Centralised here so that AppHeader, MainLayout, ShareSidebar, and any future
// component can import a single, authoritative shape.

export type User = {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  createdAt?: string;
  isLiked?: boolean;
  // Profile-page fields (optional, present in /User/profile/:username responses)
  location?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  lastUpdatedAt?: string;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  // App-header notification badge
  hasUnreadNotifications?: boolean;
};
