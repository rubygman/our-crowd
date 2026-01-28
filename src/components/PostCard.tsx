import { Post } from '../types';
import { formatRelativeTime } from '../utils';
import './PostCard.css';

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      <div className="post-header">
        <div className="post-author">
          {post.authorPhotoURL ? (
            <img 
              src={post.authorPhotoURL} 
              alt={post.authorName} 
              className="author-avatar"
            />
          ) : (
            <div className="author-avatar-placeholder">
              {post.authorName.charAt(0)}
            </div>
          )}
          <div className="author-info">
            <span className="author-name">{post.authorName}</span>
            <span className="post-time">{formatRelativeTime(post.createdAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
      </div>
      
      {post.imageURL && (
        <div className="post-image">
          <img src={post.imageURL} alt="תמונת פוסט" />
        </div>
      )}
      
      <div className="post-stats">
        <span className="stat-item">
          <span className="stat-icon">❤️</span>
          <span className="stat-count">{post.likeCount}</span>
        </span>
        <span className="stat-item">
          <span className="stat-icon">💬</span>
          <span className="stat-count">{post.commentCount}</span>
        </span>
      </div>
    </article>
  );
}

export default PostCard;
