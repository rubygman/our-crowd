export {
  auth,
  db,
  storage,
  signUp,
  signIn,
  signOut,
  onAuthStateChanged,
} from './firebase';

export {
  checkUserProfileExists,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  updateLastActive,
  blockUser,
  unblockUser,
  isUserBlocked,
  getBlockedUsers,
} from './userService';

export {
  getAllTeams,
} from './teamService';

export {
  getCommunity,
  checkMembership,
  joinCommunity,
  leaveCommunity,
  addMemberToCommunity,
  removeMemberFromCommunity,
  getTeamCommunityId,
} from './communityService';

export {
  getPost,
  getCommunityPosts,
  getFeedPosts,
  createPost,
  toggleLike,
  likePost,
  unlikePost,
  checkUserLiked,
  checkUserLikedPosts,
} from './postService';

export type { FeedResult } from './postService';

export {
  getPostComments,
  createComment,
} from './commentService';

export {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  createNotification,
  createCommentNotification,
  createLikeNotification,
} from './notificationService';

export type { CreateNotificationData } from './notificationService';

export {
  createReport,
} from './reportService';
