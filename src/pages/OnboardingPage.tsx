import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { 
  getAllTeams, 
  updateUserProfile, 
  joinCommunity,
  getTeamCommunityId 
} from '../services';
import { Team } from '../types';
import { getFirebaseErrorMessage, extractErrorCode } from '../utils';
import './OnboardingPage.css';

const MAX_TEAMS = 3;
const MIN_TEAMS = 1;
const MIN_DISPLAY_NAME_LENGTH = 2;
const MAX_DISPLAY_NAME_LENGTH = 40;

function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await getAllTeams();
      setTeams(teamsData);
    } catch (err) {
      const errorCode = extractErrorCode(err);
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) {
      return teams;
    }
    const query = searchQuery.toLowerCase();
    return teams.filter(team => 
      team.name.toLowerCase().includes(query) ||
      (team.league && team.league.toLowerCase().includes(query))
    );
  }, [teams, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayName(value);
    
    // ולידציה בזמן אמת
    if (value.trim().length === 0) {
      setDisplayNameError('');
    } else if (value.trim().length < MIN_DISPLAY_NAME_LENGTH) {
      setDisplayNameError(`שם התצוגה חייב להכיל לפחות ${MIN_DISPLAY_NAME_LENGTH} תווים`);
    } else if (value.trim().length > MAX_DISPLAY_NAME_LENGTH) {
      setDisplayNameError(`שם התצוגה יכול להכיל עד ${MAX_DISPLAY_NAME_LENGTH} תווים`);
    } else {
      setDisplayNameError('');
    }
  };

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeamIds(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(id => id !== teamId);
      }
      if (prev.length >= MAX_TEAMS) {
        return prev;
      }
      return [...prev, teamId];
    });
  };

  const isTeamSelected = (teamId: string): boolean => {
    return selectedTeamIds.includes(teamId);
  };

  const canSelectMore = (): boolean => {
    return selectedTeamIds.length < MAX_TEAMS;
  };

  const isDisplayNameValid = (): boolean => {
    const trimmed = displayName.trim();
    return trimmed.length >= MIN_DISPLAY_NAME_LENGTH && 
           trimmed.length <= MAX_DISPLAY_NAME_LENGTH;
  };

  const canSave = (): boolean => {
    return selectedTeamIds.length >= MIN_TEAMS && isDisplayNameValid();
  };

  const handleSave = async () => {
    if (!user || !canSave()) return;

    // ולידציה נוספת לפני שמירה
    if (!isDisplayNameValid()) {
      setDisplayNameError('יש להזין שם תצוגה תקין');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // עדכון קבוצות אהובות ושם תצוגה בפרופיל
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        favoriteTeamIds: selectedTeamIds,
      });

      // הצטרפות לכל הקהילות - עם טיפול שגיאות מפורט
      // אם אחת נכשלת, מציגים שגיאה ולא ממשיכים לפיד
      const joinedCommunities: string[] = [];
      
      for (const teamId of selectedTeamIds) {
        const communityId = getTeamCommunityId(teamId);
        try {
          await joinCommunity(user.uid, communityId);
          joinedCommunities.push(communityId);
        } catch (joinError) {
          // שגיאה בהצטרפות - מציגים הודעה ועוצרים
          console.error(`Failed to join community ${communityId}:`, joinError);
          const errorCode = extractErrorCode(joinError);
          setError(`שגיאה בהצטרפות לקהילה. נסה שוב. (${getFirebaseErrorMessage(errorCode)})`);
          setSaving(false);
          return; // לא ממשיכים לפיד
        }
      }

      // רק אם כל ההצטרפויות הצליחו - מפנים לפיד
      navigate('/feed');
    } catch (err) {
      const errorCode = extractErrorCode(err);
      setError(getFirebaseErrorMessage(errorCode));
    } finally {
      setSaving(false);
    }
  };

  const getSelectedTeamsNames = (): string => {
    return selectedTeamIds
      .map(id => teams.find(t => t.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>טוען קבוצות...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1 className="onboarding-title">ברוך הבא להקהל שלנו!</h1>
          <p className="onboarding-subtitle">
            הזן את שמך ובחר את הקבוצות האהובות עליך
          </p>
        </div>

        <div className="display-name-section">
          <label htmlFor="displayName" className="field-label">
            שם תצוגה <span className="required">*</span>
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={handleDisplayNameChange}
            placeholder="איך לקרוא לך?"
            className={`display-name-input ${displayNameError ? 'has-error' : ''}`}
            maxLength={MAX_DISPLAY_NAME_LENGTH}
          />
          {displayNameError && (
            <p className="field-error">{displayNameError}</p>
          )}
          <p className="field-hint">
            {displayName.trim().length}/{MAX_DISPLAY_NAME_LENGTH} תווים
          </p>
        </div>

        <div className="teams-section-header">
          <h2 className="teams-section-title">
            בחר קבוצות (עד {MAX_TEAMS}) <span className="required">*</span>
          </h2>
        </div>

        <div className="search-box">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="חפש קבוצה..."
            className="search-input"
          />
        </div>

        <div className="selection-status">
          <span className="selected-count">
            נבחרו: {selectedTeamIds.length}/{MAX_TEAMS}
          </span>
          {selectedTeamIds.length > 0 && (
            <span className="selected-names">{getSelectedTeamsNames()}</span>
          )}
        </div>

        <div className="teams-list">
          {filteredTeams.length === 0 ? (
            <div className="no-results">
              לא נמצאו קבוצות תואמות
            </div>
          ) : (
            filteredTeams.map(team => (
              <button
                key={team.id}
                type="button"
                className={`team-item ${isTeamSelected(team.id) ? 'selected' : ''}`}
                onClick={() => handleTeamToggle(team.id)}
                disabled={!isTeamSelected(team.id) && !canSelectMore()}
              >
                <div className="team-info">
                  {team.logo && (
                    <img src={team.logo} alt={team.name} className="team-logo" />
                  )}
                  <div className="team-details">
                    <span className="team-name">{team.name}</span>
                    {team.league && (
                      <span className="team-league">{team.league}</span>
                    )}
                  </div>
                </div>
                <div className="team-checkbox">
                  {isTeamSelected(team.id) ? '✓' : ''}
                </div>
              </button>
            ))
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="onboarding-actions">
          <button
            type="button"
            className="save-btn"
            onClick={handleSave}
            disabled={!canSave() || saving}
          >
            {saving ? 'שומר...' : 'המשך לפיד'}
          </button>
          {!canSave() && (
            <p className="hint-text">
              {!isDisplayNameValid() && 'יש להזין שם תצוגה. '}
              {selectedTeamIds.length < MIN_TEAMS && 'יש לבחור לפחות קבוצה אחת.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
