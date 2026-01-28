import { useState, useEffect, useCallback } from 'react';
import { useAuth, useToast } from '../hooks';
import { getUserProfile, updateUserProfile, unblockUser } from '../services';
import { LoadingSpinner, ErrorMessage } from '../components';
import { UserProfile } from '../types';
import { getFirebaseErrorMessage, extractErrorCode, MESSAGES } from '../utils';
import './ProfilePage.css';

const MIN_DISPLAY_NAME_LENGTH = 2;
const MAX_DISPLAY_NAME_LENGTH = 40;

function ProfilePage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // מצב עריכת שם תצוגה
  const [isEditingName, setIsEditingName] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [savingName, setSavingName] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const profileData = await getUserProfile(user.uid);
      setProfile(profileData);
    } catch (err) {
      const errorCode = extractErrorCode(err);
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUnblockUser = async (userIdToUnblock: string) => {
    if (!user || !profile) return;

    try {
      await unblockUser(user.uid, userIdToUnblock);
      setProfile({
        ...profile,
        blockedUserIds: profile.blockedUserIds.filter(id => id !== userIdToUnblock),
      });
      showSuccess(MESSAGES.SUCCESS.USER_UNBLOCKED);
    } catch (err) {
      const errorCode = extractErrorCode(err);
      showError(getFirebaseErrorMessage(errorCode));
    }
  };

  const startEditingName = () => {
    setEditDisplayName(profile?.displayName || '');
    setDisplayNameError('');
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setEditDisplayName('');
    setDisplayNameError('');
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditDisplayName(value);
    
    if (value.trim().length === 0) {
      setDisplayNameError('שם תצוגה הוא שדה חובה');
    } else if (value.trim().length < MIN_DISPLAY_NAME_LENGTH) {
      setDisplayNameError(`שם התצוגה חייב להכיל לפחות ${MIN_DISPLAY_NAME_LENGTH} תווים`);
    } else if (value.trim().length > MAX_DISPLAY_NAME_LENGTH) {
      setDisplayNameError(`שם התצוגה יכול להכיל עד ${MAX_DISPLAY_NAME_LENGTH} תווים`);
    } else {
      setDisplayNameError('');
    }
  };

  const saveDisplayName = async () => {
    if (!user || !profile) return;
    
    const trimmed = editDisplayName.trim();
    if (trimmed.length < MIN_DISPLAY_NAME_LENGTH || trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
      setDisplayNameError('יש להזין שם תצוגה תקין');
      return;
    }

    setSavingName(true);
    try {
      await updateUserProfile(user.uid, { displayName: trimmed });
      setProfile({ ...profile, displayName: trimmed });
      setIsEditingName(false);
      showSuccess('שם התצוגה עודכן בהצלחה');
    } catch (err) {
      const errorCode = extractErrorCode(err);
      showError(getFirebaseErrorMessage(errorCode));
    } finally {
      setSavingName(false);
    }
  };

  if (loading) {
    return (
      <div className="page profile-page">
        <div className="container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="טוען פרופיל..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page profile-page">
        <div className="container">
          <ErrorMessage message={error} onRetry={loadProfile} />
        </div>
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <div className="container">
        <h1 className="page-title">הפרופיל שלי</h1>
        
        {error && <div className="error-message">{error}</div>}

        <div className="profile-card">
          <div className="profile-header">
            {profile?.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt={profile.displayName} 
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {profile?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </div>
            )}
            <div className="profile-info">
              {isEditingName ? (
                <div className="edit-name-form">
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={handleDisplayNameChange}
                    placeholder="שם תצוגה"
                    className={`edit-name-input ${displayNameError ? 'has-error' : ''}`}
                    maxLength={MAX_DISPLAY_NAME_LENGTH}
                    autoFocus
                  />
                  {displayNameError && (
                    <p className="edit-name-error">{displayNameError}</p>
                  )}
                  <div className="edit-name-actions">
                    <button
                      type="button"
                      className="btn-save-name"
                      onClick={saveDisplayName}
                      disabled={savingName || !!displayNameError}
                    >
                      {savingName ? 'שומר...' : 'שמור'}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel-edit"
                      onClick={cancelEditingName}
                      disabled={savingName}
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="name-row">
                    <h2 className="profile-name">
                      {profile?.displayName || 'משתמש ללא שם'}
                    </h2>
                    <button
                      type="button"
                      className="btn-edit-name"
                      onClick={startEditingName}
                      title="ערוך שם תצוגה"
                    >
                      ✏️
                    </button>
                  </div>
                  <p className="profile-email">{user?.email}</p>
                </>
              )}
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{profile?.joinedCommunityIds?.length || 0}</span>
              <span className="stat-label">קהילות</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{profile?.favoriteTeamIds?.length || 0}</span>
              <span className="stat-label">קבוצות אהובות</span>
            </div>
          </div>
        </div>

        {profile && profile.blockedUserIds && profile.blockedUserIds.length > 0 && (
          <div className="blocked-users-section">
            <h3 className="section-title">משתמשים חסומים ({profile.blockedUserIds.length})</h3>
            <div className="blocked-users-list">
              {profile.blockedUserIds.map(blockedId => (
                <div key={blockedId} className="blocked-user-item">
                  <span className="blocked-user-id">משתמש {blockedId.slice(0, 8)}...</span>
                  <button
                    type="button"
                    className="btn-unblock"
                    onClick={() => handleUnblockUser(blockedId)}
                  >
                    בטל חסימה
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
