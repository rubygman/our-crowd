import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useToast } from '../hooks';
import { getAllTeams, getUserProfile, joinCommunity, getTeamCommunityId } from '../services';
import { LoadingSpinner, EmptyState } from '../components';
import { Team } from '../types';
import { getFirebaseErrorMessage, extractErrorCode, MESSAGES } from '../utils';
import './SearchPage.css';

function SearchPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [teamsData, profile] = await Promise.all([
        getAllTeams(),
        getUserProfile(user.uid),
      ]);
      setTeams(teamsData);
      setFilteredTeams(teamsData);
      setJoinedCommunityIds(profile?.joinedCommunityIds || []);
    } catch (err) {
      const errorCode = extractErrorCode(err);
      showError(getFirebaseErrorMessage(errorCode));
    } finally {
      setLoading(false);
    }
  }, [user, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTeams(teams);
      return;
    }

    const query = searchQuery.trim().toLowerCase();
    const filtered = teams.filter(
      team =>
        team.name.toLowerCase().includes(query) ||
        team.league?.toLowerCase().includes(query)
    );
    setFilteredTeams(filtered);
  }, [searchQuery, teams]);

  const handleJoinCommunity = async (teamId: string) => {
    if (!user || joiningId) return;

    const communityId = getTeamCommunityId(teamId);
    
    // בדיקה אם כבר חבר
    if (joinedCommunityIds.includes(communityId)) {
      return;
    }

    setJoiningId(teamId);
    try {
      // שימוש בפונקציה החדשה שמעדכנת גם את users/{uid}.joinedCommunityIds
      await joinCommunity(user.uid, communityId);
      
      // עדכון state מקומי
      setJoinedCommunityIds(prev => [...prev, communityId]);
      showSuccess(MESSAGES.SUCCESS.JOINED_COMMUNITY);
    } catch (err) {
      const errorCode = extractErrorCode(err);
      showError(getFirebaseErrorMessage(errorCode));
    } finally {
      setJoiningId(null);
    }
  };

  const isMemberOfTeam = (teamId: string): boolean => {
    const communityId = getTeamCommunityId(teamId);
    return joinedCommunityIds.includes(communityId);
  };

  if (loading) {
    return (
      <div className="page search-page">
        <div className="container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="טוען קהילות..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page search-page">
      <div className="container">
        <h1 className="page-title">חיפוש קהילות</h1>
        
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="חפש לפי שם קבוצה או ליגה..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredTeams.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={MESSAGES.INFO.NO_RESULTS}
            description="נסה לחפש במילות מפתח אחרות"
          />
        ) : (
          <div className="teams-grid">
            {filteredTeams.map(team => {
              const isMember = isMemberOfTeam(team.id);
              const communityId = getTeamCommunityId(team.id);
              
              return (
                <div key={team.id} className="team-card">
                  <div className="team-info">
                    {team.logo && (
                      <img src={team.logo} alt={team.name} className="team-logo" />
                    )}
                    <div className="team-details">
                      <h3 className="team-name">{team.name}</h3>
                      {team.league && <span className="team-league">{team.league}</span>}
                    </div>
                  </div>
                  
                  <div className="team-actions">
                    {isMember ? (
                      <Link to={`/community/${communityId}`} className="btn-view">
                        צפה בקהילה
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="btn-join"
                        onClick={() => handleJoinCommunity(team.id)}
                        disabled={joiningId === team.id}
                      >
                        {joiningId === team.id ? 'מצטרף...' : 'הצטרף'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
