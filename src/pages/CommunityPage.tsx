import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, useToast } from '../hooks';
import { 
  getCommunity, 
  getCommunityPosts,
  checkMembership,
  joinCommunity,
  leaveCommunity,
  createPost,
  getUserProfile
} from '../services';
import { PostCard, CreatePostModal, LoadingSpinner, ErrorMessage } from '../components';
import { Community, Post } from '../types';
import { getFirebaseErrorMessage, extractErrorCode, MESSAGES } from '../utils';
import './CommunityPage.css';

function CommunityPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // מניעת שליחות כפולות
  const isSubmittingPost = useRef(false);

  const loadCommunityData = useCallback(async () => {
    if (!id || !user) return;

    try {
      setLoading(true);
      setError('');

      const [communityData, postsData, membershipStatus] = await Promise.all([
        getCommunity(id),
        getCommunityPosts(id),
        checkMembership(id, user.uid),
      ]);

      if (!communityData) {
        setError('הקהילה לא נמצאה');
        return;
      }

      setCommunity(communityData);
      setPosts(postsData);
      setIsMember(membershipStatus);
    } catch (err) {
      const errorCode = extractErrorCode(err);
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadCommunityData();
  }, [loadCommunityData]);

  const handleJoin = async () => {
    if (!id || !user || membershipLoading) return;

    setMembershipLoading(true);
    try {
      // שימוש בפונקציה החדשה שמעדכנת גם את users/{uid}.joinedCommunityIds
      await joinCommunity(user.uid, id);
      
      // עדכון state מקומי
      setIsMember(true);
      if (community) {
        setCommunity({
          ...community,
          memberCount: community.memberCount + 1,
        });
      }
      showSuccess(MESSAGES.SUCCESS.JOINED_COMMUNITY);
    } catch (err) {
      const errorCode = extractErrorCode(err);
      showError(getFirebaseErrorMessage(errorCode));
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!id || !user || membershipLoading) return;

    setMembershipLoading(true);
    try {
      // שימוש בפונקציה החדשה שמעדכנת גם את users/{uid}.joinedCommunityIds
      await leaveCommunity(user.uid, id);
      
      // עדכון state מקומי
      setIsMember(false);
      if (community) {
        setCommunity({
          ...community,
          memberCount: Math.max(0, community.memberCount - 1),
        });
      }
      showSuccess(MESSAGES.SUCCESS.LEFT_COMMUNITY);
    } catch (err) {
      const errorCode = extractErrorCode(err);
      showError(getFirebaseErrorMessage(errorCode));
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreatePost = async (content: string) => {
    if (!id || !user || isSubmittingPost.current) return;
    
    // בדיקת שדות ריקים
    if (!content.trim()) {
      showError(MESSAGES.ERROR.CONTENT_EMPTY);
      return;
    }
    
    isSubmittingPost.current = true;

    try {
      const userProfile = await getUserProfile(user.uid);
      
      await createPost({
        communityId: id,
        authorId: user.uid,
        authorName: userProfile?.displayName || user.email || 'משתמש אנונימי',
        authorPhotoURL: userProfile?.photoURL,
        content,
      });

      // רענון הפוסטים
      const updatedPosts = await getCommunityPosts(id);
      setPosts(updatedPosts);
      
      showSuccess(MESSAGES.SUCCESS.POST_CREATED);
    } catch {
      showError(MESSAGES.ERROR.GENERIC);
      throw new Error('Post creation failed');
    } finally {
      isSubmittingPost.current = false;
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="טוען קהילה..." />
          </div>
        </div>
      </div>
    );
  }

  if (error && !community) {
    return (
      <div className="page">
        <div className="container">
          <ErrorMessage message={error} onRetry={loadCommunityData} />
        </div>
      </div>
    );
  }

  if (!community) {
    return null;
  }

  return (
    <div className="page community-page">
      <div className="container">
        <div className="community-header-card">
          {community.imageURL && (
            <div className="community-cover">
              <img src={community.imageURL} alt={community.name} />
            </div>
          )}
          
          <div className="community-info">
            <h1 className="community-name">{community.name}</h1>
            {community.description && (
              <p className="community-description">{community.description}</p>
            )}
            <div className="community-stats">
              <span className="member-count">{community.memberCount} חברים</span>
            </div>
          </div>

          <div className="community-actions">
            {isMember ? (
              <button 
                type="button"
                className="btn-leave"
                onClick={handleLeave}
                disabled={membershipLoading}
              >
                {membershipLoading ? 'מעבד...' : 'עזוב קהילה'}
              </button>
            ) : (
              <button 
                type="button"
                className="btn-join"
                onClick={handleJoin}
                disabled={membershipLoading}
              >
                {membershipLoading ? 'מעבד...' : 'הצטרף לקהילה'}
              </button>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isMember && (
          <div className="create-post-section">
            <button 
              type="button"
              className="btn-create-post"
              onClick={handleOpenCreateModal}
            >
              ✍️ כתוב פוסט חדש
            </button>
          </div>
        )}

        <div className="posts-section">
          <h2 className="section-title">פוסטים</h2>
          
          {posts.length === 0 ? (
            <div className="empty-posts">
              <p>אין עדיין פוסטים בקהילה זו</p>
              {isMember && <p>היה הראשון לכתוב!</p>}
            </div>
          ) : (
            <div className="posts-list">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreatePost}
        communityName={community.name}
      />
    </div>
  );
}

export default CommunityPage;
