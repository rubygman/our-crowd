import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentSnapshot } from 'firebase/firestore';
import { useAuth, useToast } from '../hooks';
import { 
  getUserProfile, 
  getFeedPosts, 
  likePost, 
  unlikePost,
  checkUserLikedPosts,
  createReport
} from '../services';
import { FeedPostCard, ReportModal, LoadingSpinner, EmptyState } from '../components';
import { Post, ReportReason, UserProfile } from '../types';
import { getFirebaseErrorMessage, extractErrorCode, MESSAGES } from '../utils';
import './FeedPage.css';

function FeedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [communityIds, setCommunityIds] = useState<string[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetId, setReportTargetId] = useState('');
  const [reportTargetAuthorId, setReportTargetAuthorId] = useState('');
  
  // מניעת שליחות כפולות
  const isSubmittingReport = useRef(false);

  const loadUserCommunities = useCallback(async () => {
    if (!user) return;

    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setCommunityIds(profile.joinedCommunityIds);
        setBlockedUserIds(profile.blockedUserIds || []);
        setUserProfile(profile);
        return { 
          communityIds: profile.joinedCommunityIds,
          blockedUserIds: profile.blockedUserIds || []
        };
      }
      return { communityIds: [], blockedUserIds: [] };
    } catch (err) {
      const errorCode = extractErrorCode(err);
      setError(getFirebaseErrorMessage(errorCode));
      return { communityIds: [], blockedUserIds: [] };
    }
  }, [user]);

  const loadFeed = useCallback(async (
    userCommunityIds: string[], 
    userBlockedIds: string[]
  ) => {
    if (!user || userCommunityIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await getFeedPosts(userCommunityIds);
      
      // סינון פוסטים של משתמשים חסומים
      const filteredPosts = result.posts.filter(
        post => !userBlockedIds.includes(post.authorId)
      );
      
      setPosts(filteredPosts);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);

      // בדיקת לייקים
      if (filteredPosts.length > 0) {
        const postIds = filteredPosts.map(p => p.id);
        const likedStatus = await checkUserLikedPosts(postIds, user.uid);
        setLikedPosts(likedStatus);
      }
    } catch (err) {
      const errorCode = extractErrorCode(err);
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const initFeed = async () => {
      const userData = await loadUserCommunities();
      if (userData && userData.communityIds.length > 0) {
        await loadFeed(userData.communityIds, userData.blockedUserIds);
      } else {
        setLoading(false);
      }
    };

    initFeed();
  }, [loadUserCommunities, loadFeed]);

  const handleLoadMore = async () => {
    if (!user || loadingMore || !hasMore || communityIds.length === 0) return;

    setLoadingMore(true);
    try {
      const result = await getFeedPosts(communityIds, lastDoc);
      
      // סינון פוסטים של משתמשים חסומים
      const filteredPosts = result.posts.filter(
        post => !blockedUserIds.includes(post.authorId)
      );
      
      setPosts(prev => [...prev, ...filteredPosts]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);

      // בדיקת לייקים לפוסטים החדשים
      if (filteredPosts.length > 0) {
        const postIds = filteredPosts.map(p => p.id);
        const likedStatus = await checkUserLikedPosts(postIds, user.uid);
        setLikedPosts(prev => ({ ...prev, ...likedStatus }));
      }
    } catch (err) {
      const errorCode = extractErrorCode(err);
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    // מעבירים פרטי משתמש ליצירת התראה
    await likePost(
      postId, 
      user.uid, 
      userProfile?.displayName || user.email || 'משתמש',
      userProfile?.photoURL
    );
  };

  const handleUnlike = async (postId: string) => {
    if (!user) return;
    // לא מעבירים פרטי משתמש - לא רוצים התראה על unlike
    await unlikePost(postId, user.uid);
  };

  const handleCommentsClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleReportClick = (postId: string, authorId: string) => {
    setReportTargetId(postId);
    setReportTargetAuthorId(authorId);
    setShowReportModal(true);
  };

  const handleReportSubmit = async (reason: ReportReason, description: string) => {
    if (!user || isSubmittingReport.current) return;
    
    isSubmittingReport.current = true;
    
    try {
      await createReport({
        type: 'post',
        targetId: reportTargetId,
        targetAuthorId: reportTargetAuthorId,
        reporterId: user.uid,
        reason,
        description,
      });
      showSuccess(MESSAGES.SUCCESS.REPORT_SENT);
    } catch {
      showError(MESSAGES.ERROR.GENERIC);
      throw new Error('Report failed');
    } finally {
      isSubmittingReport.current = false;
    }
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportTargetId('');
    setReportTargetAuthorId('');
  };

  if (loading) {
    return (
      <div className="page feed-page">
        <div className="container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="טוען את הפיד שלך..." />
          </div>
        </div>
      </div>
    );
  }

  if (communityIds.length === 0) {
    return (
      <div className="page feed-page">
        <div className="container">
          <EmptyState
            icon="⚽"
            title="עדיין לא הצטרפת לקהילות"
            description="הצטרף לקהילות של הקבוצות האהובות עליך כדי לראות פוסטים בפיד"
            actionLabel="חפש קהילות"
            onAction={() => navigate('/search')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page feed-page">
      <div className="container">
        <div className="feed-header">
          <h1 className="feed-title">הפיד שלי</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {posts.length === 0 ? (
          <div className="empty-posts-state">
            <p>אין עדיין פוסטים בקהילות שלך</p>
            <p>היה הראשון לכתוב!</p>
          </div>
        ) : (
          <div className="feed-posts">
            {posts.map(post => (
              <FeedPostCard
                key={post.id}
                post={post}
                isLiked={likedPosts[post.id] || false}
                onLike={handleLike}
                onUnlike={handleUnlike}
                onCommentsClick={handleCommentsClick}
                onReportClick={handleReportClick}
              />
            ))}
          </div>
        )}

        {hasMore && posts.length > 0 && (
          <div className="load-more-section">
            <button
              type="button"
              className="btn-load-more"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <span className="loading-spinner-small"></span>
                  טוען...
                </>
              ) : (
                'טען עוד פוסטים'
              )}
            </button>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="end-of-feed">
            <p>הגעת לסוף הפיד 🏆</p>
          </div>
        )}
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        onSubmit={handleReportSubmit}
        type="post"
      />
    </div>
  );
}

export default FeedPage;
