import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, useToast } from '../hooks';
import { 
  getPost, 
  getPostComments,
  createComment,
  toggleLike,
  checkUserLiked,
  getUserProfile,
  getCommunity,
  createReport
} from '../services';
import { CommentCard, CommentForm, ReportModal, LoadingSpinner } from '../components';
import { Post, Comment, Community, ReportReason, ReportType, UserProfile } from '../types';
import { formatRelativeTime, getFirebaseErrorMessage, extractErrorCode, MESSAGES } from '../utils';
import './PostPage.css';

function PostPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [post, setPost] = useState<Post | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('post');
  const [reportTargetId, setReportTargetId] = useState('');
  const [reportTargetAuthorId, setReportTargetAuthorId] = useState('');
  
  // מניעת שליחות כפולות
  const isSubmittingComment = useRef(false);
  const isSubmittingReport = useRef(false);

  const loadPostData = useCallback(async () => {
    if (!id || !user) return;

    try {
      setLoading(true);
      setError('');

      // טעינת פרופיל המשתמש לקבלת רשימת חסומים
      const userProfile = await getUserProfile(user.uid);
      const userBlockedIds = userProfile?.blockedUserIds || [];
      setBlockedUserIds(userBlockedIds);
      setCurrentUserProfile(userProfile);

      const [postData, commentsData, likedStatus] = await Promise.all([
        getPost(id),
        getPostComments(id),
        checkUserLiked(id, user.uid),
      ]);

      if (!postData) {
        setError('הפוסט לא נמצא');
        return;
      }

      setPost(postData);
      
      // סינון תגובות של משתמשים חסומים
      const filteredComments = commentsData.filter(
        comment => !userBlockedIds.includes(comment.authorId)
      );
      setComments(filteredComments);
      
      setIsLiked(likedStatus);
      setLikeCount(postData.likeCount);

      // טעינת נתוני הקהילה
      const communityData = await getCommunity(postData.communityId);
      setCommunity(communityData);
    } catch (err) {
      const errorCode = extractErrorCode(err);
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadPostData();
  }, [loadPostData]);

  const handleLikeToggle = async () => {
    if (!id || !user || likeLoading) return;

    setLikeLoading(true);
    
    // עדכון אופטימיסטי
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      // מעבירים פרטי משתמש רק אם מוסיפים לייק (לא מסירים)
      // כי רק אז נרצה ליצור התראה
      const userName = !wasLiked 
        ? (currentUserProfile?.displayName || user.email || 'משתמש')
        : undefined;
      const userPhotoURL = !wasLiked ? currentUserProfile?.photoURL : undefined;
      
      const nowLiked = await toggleLike(id, user.uid, userName, userPhotoURL);
      setIsLiked(nowLiked);
    } catch {
      // שחזור במקרה של שגיאה
      setIsLiked(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentSubmit = async (content: string) => {
    if (!id || !user || isSubmittingComment.current) return;
    
    // בדיקת שדות ריקים
    if (!content.trim()) {
      showError(MESSAGES.ERROR.CONTENT_EMPTY);
      return;
    }
    
    isSubmittingComment.current = true;

    try {
      const userProfile = await getUserProfile(user.uid);
      
      await createComment({
        postId: id,
        authorId: user.uid,
        authorName: userProfile?.displayName || user.email || 'משתמש אנונימי',
        authorPhotoURL: userProfile?.photoURL,
        content,
      });

      // רענון התגובות
      const updatedComments = await getPostComments(id);
      // סינון תגובות של משתמשים חסומים
      const filteredComments = updatedComments.filter(
        comment => !blockedUserIds.includes(comment.authorId)
      );
      setComments(filteredComments);
      
      // עדכון מונה התגובות בפוסט
      if (post) {
        setPost({
          ...post,
          commentCount: post.commentCount + 1,
        });
      }
      
      showSuccess(MESSAGES.SUCCESS.COMMENT_ADDED);
    } catch {
      showError(MESSAGES.ERROR.GENERIC);
      throw new Error('Comment failed');
    } finally {
      isSubmittingComment.current = false;
    }
  };

  const handleReportPost = () => {
    if (!post) return;
    setReportType('post');
    setReportTargetId(post.id);
    setReportTargetAuthorId(post.authorId);
    setShowReportModal(true);
  };

  const handleReportComment = (commentId: string, authorId: string) => {
    setReportType('comment');
    setReportTargetId(commentId);
    setReportTargetAuthorId(authorId);
    setShowReportModal(true);
  };

  const handleReportSubmit = async (reason: ReportReason, description: string) => {
    if (!user || isSubmittingReport.current) return;
    
    isSubmittingReport.current = true;
    
    try {
      await createReport({
        type: reportType,
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
      <div className="page post-page">
        <div className="container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="טוען פוסט..." />
          </div>
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="page post-page">
        <div className="container">
          <div className="error-state">
            <p>{error}</p>
            <Link to="/feed" className="back-link">חזרה לפיד</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="page post-page">
      <div className="container">
        <div className="post-navigation">
          <Link to="/feed" className="back-link">← חזרה לפיד</Link>
          {community && (
            <Link to={`/community/${post.communityId}`} className="community-link">
              {community.name}
            </Link>
          )}
        </div>

        <article className="post-full">
          <div className="post-full-header">
            <div className="post-author-section">
              {post.authorPhotoURL ? (
                <img 
                  src={post.authorPhotoURL} 
                  alt={post.authorName} 
                  className="post-author-avatar"
                />
              ) : (
                <div className="post-author-avatar-placeholder">
                  {post.authorName.charAt(0)}
                </div>
              )}
              <div className="post-author-info">
                <span className="post-author-name">{post.authorName}</span>
                <span className="post-time">{formatRelativeTime(post.createdAt)}</span>
              </div>
            </div>
            
            <button 
              type="button"
              className="report-btn"
              onClick={handleReportPost}
            >
              🚩 דווח
            </button>
          </div>

          <div className="post-full-content">
            <p>{post.content}</p>
          </div>

          {post.imageURL && (
            <div className="post-full-image">
              <img src={post.imageURL} alt="תמונת פוסט" />
            </div>
          )}

          <div className="post-full-actions">
            <button
              type="button"
              className={`action-button like-button ${isLiked ? 'liked' : ''}`}
              onClick={handleLikeToggle}
              disabled={likeLoading}
            >
              <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
              <span className="action-text">{likeCount} אהבו</span>
            </button>
            
            <div className="action-button comment-count">
              <span className="action-icon">💬</span>
              <span className="action-text">{comments.length} תגובות</span>
            </div>
          </div>
        </article>

        <section className="comments-section">
          <h2 className="comments-title">תגובות ({comments.length})</h2>
          
          <CommentForm onSubmit={handleCommentSubmit} />
          
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">
                <p>אין עדיין תגובות</p>
                <p>היה הראשון להגיב!</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment-wrapper">
                  <CommentCard comment={comment} />
                  <button
                    type="button"
                    className="comment-report-btn"
                    onClick={() => handleReportComment(comment.id, comment.authorId)}
                  >
                    דווח
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={handleCloseReportModal}
        onSubmit={handleReportSubmit}
        type={reportType}
      />
    </div>
  );
}

export default PostPage;
