import { Comment } from '../types';
import { formatRelativeTime } from '../utils';
import './CommentCard.css';

interface CommentCardProps {
  comment: Comment;
}

function CommentCard({ comment }: CommentCardProps) {
  return (
    <div className="comment-card">
      <div className="comment-avatar">
        {comment.authorPhotoURL ? (
          <img 
            src={comment.authorPhotoURL} 
            alt={comment.authorName} 
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            {comment.authorName.charAt(0)}
          </div>
        )}
      </div>
      
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{comment.authorName}</span>
          <span className="comment-time">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <div className="comment-content">
          <p>{comment.content}</p>
        </div>
      </div>
    </div>
  );
}

export default CommentCard;
