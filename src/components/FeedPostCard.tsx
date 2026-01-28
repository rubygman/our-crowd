import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { formatRelativeTime } from '../utils';
import './FeedPostCard.css';

interface FeedPostCardProps {
  post: Post;
  isLiked: boolean;
  onLike: (postId: string) => Promise<void>;
  onUnlike: (postId: string) => Promise<void>;
  onCommentsClick: (postId: string) => void;
  onReportClick: (postId: string, authorId: string) => void;
}

function FeedPostCard({ 
  post, 
  isLiked, 
  onLike, 
  onUnlike, 
  onCommentsClick,
  onReportClick
}: FeedPostCardProps) {
  const [likeLoading, setLikeLoading] = useState(false);
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);
  const [showMenu, setShowMenu] = useState(false);

  const handleLikeClick = async () => {
    if (likeLoading) return;

    setLikeLoading(true);
    try {
      if (localLiked) {
        setLocalLiked(false);
        setLocalLikeCount(prev => Math.max(0, prev - 1));
        await onUnlike(post.id);
      } else {
        setLocalLiked(true);
        setLocalLikeCount(prev => prev + 1);
        await onLike(post.id);
      }
    } catch {
      // שחזור במקרה של שגיאה
      setLocalLiked(isLiked);
      setLocalLikeCount(post.likeCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCommentsClick = () => {
    onCommentsClick(post.id);
  };

  const handleMenuToggle = () => {
    setShowMenu(prev => !prev);
  };

  const handleReportClick = () => {
    setShowMenu(false);
    onReportClick(post.id, post.authorId);
  };

  return (
    <article className="feed-post-card">
      <div className="feed-post-header">
        <div className="feed-post-author">
          {post.authorPhotoURL ? (
            <img 
              src={post.authorPhotoURL} 
              alt={post.authorName} 
              className="feed-author-avatar"
            />
          ) : (
            <div className="feed-author-avatar-placeholder">
              {post.authorName.charAt(0)}
            </div>
          )}
          <div className="feed-author-info">
            <span className="feed-author-name">{post.authorName}</span>
            <div className="feed-post-meta">
              <span className="feed-post-time">{formatRelativeTime(post.createdAt)}</span>
              <span className="feed-post-separator">•</span>
              <Link 
                to={`/community/${post.communityId}`} 
                className="feed-community-link"
              >
                קהילה
              </Link>
            </div>
          </div>
        </div>
        
        <div className="post-menu-container">
          <button 
            type="button" 
            className="post-menu-btn"
            onClick={handleMenuToggle}
          >
            ⋮
          </button>
          {showMenu && (
            <div className="post-menu-dropdown">
              <button 
                type="button" 
                className="menu-item report-item"
                onClick={handleReportClick}
              >
                🚩 דווח
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Link to={`/post/${post.id}`} className="feed-post-content-link">
        <div className="feed-post-content">
          <p>{post.content}</p>
        </div>
        
        {post.imageURL && (
          <div className="feed-post-image">
            <img src={post.imageURL} alt="תמונת פוסט" />
          </div>
        )}
      </Link>
      
      <div className="feed-post-actions">
        <button 
          type="button"
          className={`action-btn like-btn ${localLiked ? 'liked' : ''}`}
          onClick={handleLikeClick}
          disabled={likeLoading}
        >
          <span className="action-icon">{localLiked ? '❤️' : '🤍'}</span>
          <span className="action-count">{localLikeCount}</span>
          <span className="action-label">אהבתי</span>
        </button>
        
        <button 
          type="button"
          className="action-btn comments-btn"
          onClick={handleCommentsClick}
        >
          <span className="action-icon">💬</span>
          <span className="action-count">{post.commentCount}</span>
          <span className="action-label">תגובות</span>
        </button>
      </div>
    </article>
  );
}

export default FeedPostCard;
