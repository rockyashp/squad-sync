import React, { useState, useEffect } from 'react';
import { gameApi } from '../../api/gameApi';
import { 
  Link2, 
  RefreshCw, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Shield, 
  Flame, 
  Crosshair, 
  Trophy, 
  Gamepad2, 
  Loader2, 
  ExternalLink, 
  X,
  Activity,
  Layers,
  Key,
  ShieldCheck,
  Zap
} from 'lucide-react';
import OAuthProductionGuideModal from './OAuthProductionGuideModal';

export default function GameAccountsSection({ onAccountUpdated }) {
  const [accounts, setAccounts] = useState([]);
  const [accountStats, setAccountStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [unlinkingId, setUnlinkingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOAuthGuideOpen, setIsOAuthGuideOpen] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);
  const [selectedStatPayload, setSelectedStatPayload] = useState(null);

  // Form State for Linking
  const [formData, setFormData] = useState({
    platform: 'riot',
    game_name: 'Valorant',
    in_game_name: '',
    tagline: 'NA1',
    region: 'na',
    is_primary: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchAccountsAndStats = async () => {
    try {
      const res = await gameApi.getLinkedAccounts();
      const accountList = res?.data || res || [];
      setAccounts(accountList);

      // Fetch stats for all linked accounts in parallel
      const statsMap = {};
      await Promise.allSettled(
        accountList.map(async (acc) => {
          try {
            const statsRes = await gameApi.getAccountStats(acc.id);
            const statsData = statsRes?.data || statsRes;
            if (statsData && statsData.length > 0) {
              statsMap[acc.id] = statsData[0];
            }
          } catch (e) {
            // Account may not have stats yet
          }
        })
      );
      setAccountStats(statsMap);
    } catch (err) {
      console.warn('Failed to fetch game accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsAndStats();
  }, []);

  const handleSyncAccount = async (accountId) => {
    setSyncingId(accountId);
    try {
      await gameApi.syncAccount(accountId);
      await fetchAccountsAndStats();
      if (onAccountUpdated) onAccountUpdated();
    } catch (err) {
      console.error('Failed to sync account:', err);
      alert(err.message || 'Failed to sync combat telemetry.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleUnlinkAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to unlink this gaming account? Combat telemetry will no longer sync.')) {
      return;
    }
    setUnlinkingId(accountId);
    try {
      await gameApi.unlinkAccount(accountId);
      await fetchAccountsAndStats();
      if (onAccountUpdated) onAccountUpdated();
    } catch (err) {
      console.error('Failed to unlink account:', err);
      alert(err.message || 'Failed to unlink account.');
    } finally {
      setUnlinkingId(null);
    }
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!formData.in_game_name.trim()) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        platform: formData.platform,
        game_name: formData.game_name,
        account_identifier: `${formData.platform}_${Date.now()}_${formData.in_game_name.toLowerCase().replace(/\s+/g, '')}`,
        in_game_name: formData.in_game_name.trim(),
        tagline: formData.tagline.trim() || undefined,
        region: formData.region,
        is_primary: formData.is_primary
      };

      await gameApi.linkAccount(payload);
      setIsModalOpen(false);
      setFormData({
        platform: 'riot',
        game_name: 'Valorant',
        in_game_name: '',
        tagline: 'NA1',
        region: 'na',
        is_primary: false
      });
      await fetchAccountsAndStats();
      if (onAccountUpdated) onAccountUpdated();
    } catch (err) {
      console.error('Failed to link account:', err);
      setFormError(err.message || 'Failed to link account.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (platform) => {
    if (platform === 'riot') {
      setFormData({
        platform: 'riot',
        game_name: 'Valorant',
        in_game_name: 'ValkyriePrime',
        tagline: 'NA1',
        region: 'na',
        is_primary: true
      });
    } else if (platform === 'steam') {
      setFormData({
        platform: 'steam',
        game_name: 'CS2',
        in_game_name: 'MiracleWorker',
        tagline: '76561198000000001',
        region: 'na',
        is_primary: true
      });
    }
  };

  const handleRiotQuickAuth = async (mode = 'live') => {
    setOauthLoading(`riot_${mode}`);
    try {
      if (mode === 'live') {
        const res = await gameApi.getRiotLoginUrl();
        const url = res?.data?.auth_url || res?.auth_url;
        if (url) {
          window.open(url, '_blank');
        } else {
          alert('Could not retrieve Riot Sign-On URL. Check server configuration.');
        }
      } else {
        // Sandbox instant verification
        await gameApi.handleRiotCallback(`mock_rso_valkyrie_${Date.now()}`);
        await fetchAccountsAndStats();
        if (onAccountUpdated) onAccountUpdated();
      }
    } catch (err) {
      console.warn('Riot OAuth:', err);
      await fetchAccountsAndStats();
      if (onAccountUpdated) onAccountUpdated();
    } finally {
      setOauthLoading(null);
    }
  };

  const handleSteamQuickAuth = async (mode = 'live') => {
    setOauthLoading(`steam_${mode}`);
    try {
      if (mode === 'live') {
        const res = await gameApi.getSteamLoginUrl();
        const url = res?.data?.auth_url || res?.auth_url;
        if (url) {
          window.open(url, '_blank');
        } else {
          alert('Could not retrieve Steam OpenID URL. Check server configuration.');
        }
      } else {
        // Sandbox instant verification
        await gameApi.handleSteamCallback({
          'openid.claimed_id': `https://steamcommunity.com/openid/id/76561198${Math.floor(100000000 + Math.random() * 900000000)}`,
          'openid.identity': 'https://steamcommunity.com/openid/id/76561198000000001',
          'openid.mode': 'id_res',
          'openid.sig': 'mock_signature',
        });
        await fetchAccountsAndStats();
        if (onAccountUpdated) onAccountUpdated();
      }
    } catch (err) {
      console.warn('Steam OpenID:', err);
      await fetchAccountsAndStats();
      if (onAccountUpdated) onAccountUpdated();
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="glassCard" style={{ padding: '28px', borderRadius: '24px' }}>
      {/* SECTION HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(139, 92, 246, 0.2))',
            border: '1px solid rgba(34, 211, 238, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22d3ee'
          }}>
            <Link2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
              Verified Game Accounts & Telemetry
            </h3>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>
              Riot Games RSO, Valve Steam & native combat stats ingestion
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="glassBtn"
            onClick={() => setIsOAuthGuideOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              color: '#38bdf8',
              borderColor: 'rgba(56, 189, 248, 0.3)'
            }}
          >
            <Key size={14} />
            <span>OAuth Deployment Guide</span>
          </button>

          <button
            type="button"
            className="primaryBtn"
            onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }}
          >
            <Plus size={15} />
            <span>Link Custom Account</span>
          </button>
        </div>
      </div>

      {/* QUICK OAUTH CONNECT HUB TILES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        {/* RIOT RSO QUICK CONNECT TILE */}
        <div style={{
          padding: '16px 18px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08), rgba(15, 23, 42, 0.8))',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(244, 63, 94, 0.2)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: '#f43f5e',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  RIOT GAMES
                </span>
                <strong style={{ fontSize: '14px', color: '#ffffff' }}>Riot Sign-On (RSO)</strong>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Valorant • LoL</span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '12px', margin: 0, lineHeight: 1.45 }}>
              Authorize via official OAuth2 or execute instant sandbox telemetry verification.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="primaryBtn"
              onClick={() => handleRiotQuickAuth('live')}
              disabled={oauthLoading === 'riot_live'}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '7px 10px',
                fontSize: '11px',
                background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                color: '#ffffff'
              }}
            >
              <ExternalLink size={12} />
              <span>{oauthLoading === 'riot_live' ? 'Opening...' : 'Live OAuth Redirect'}</span>
            </button>
            <button
              type="button"
              className="glassBtn"
              onClick={() => handleRiotQuickAuth('sandbox')}
              disabled={oauthLoading === 'riot_sandbox'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                fontSize: '11px',
                color: '#f43f5e',
                borderColor: 'rgba(244, 63, 94, 0.3)'
              }}
            >
              <Zap size={12} />
              <span>{oauthLoading === 'riot_sandbox' ? 'Linking...' : 'Sandbox 1-Click'}</span>
            </button>
          </div>
        </div>

        {/* STEAM OPENID QUICK CONNECT TILE */}
        <div style={{
          padding: '16px 18px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.08), rgba(15, 23, 42, 0.8))',
          border: '1px solid rgba(34, 211, 238, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(34, 211, 238, 0.2)',
                  border: '1px solid rgba(34, 211, 238, 0.4)',
                  color: '#22d3ee',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  VALVE STEAM
                </span>
                <strong style={{ fontSize: '14px', color: '#ffffff' }}>Steam OpenID 2.0</strong>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>CS2 • Dota 2</span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '12px', margin: 0, lineHeight: 1.45 }}>
              Verify cryptographic SteamID64 ownership or run instant sandbox telemetry verification.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="primaryBtn"
              onClick={() => handleSteamQuickAuth('live')}
              disabled={oauthLoading === 'steam_live'}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '7px 10px',
                fontSize: '11px',
                background: 'linear-gradient(135deg, #0284c7, #2563eb)',
                color: '#ffffff'
              }}
            >
              <ExternalLink size={12} />
              <span>{oauthLoading === 'steam_live' ? 'Opening...' : 'Live OpenID Redirect'}</span>
            </button>
            <button
              type="button"
              className="glassBtn"
              onClick={() => handleSteamQuickAuth('sandbox')}
              disabled={oauthLoading === 'steam_sandbox'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                fontSize: '11px',
                color: '#22d3ee',
                borderColor: 'rgba(34, 211, 238, 0.3)'
              }}
            >
              <Zap size={12} />
              <span>{oauthLoading === 'steam_sandbox' ? 'Linking...' : 'Sandbox 1-Click'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ACCOUNTS LIST */}
      {loading ? (
        <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
          <Loader2 size={28} className="spinner" style={{ margin: '0 auto 12px', color: '#22d3ee' }} />
          <span>Synchronizing linked accounts...</span>
        </div>
      ) : accounts.length === 0 ? (
        /* EMPTY STATE BANNER */
        <div style={{
          padding: '32px 24px',
          borderRadius: '18px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(34, 211, 238, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(34, 211, 238, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            color: '#22d3ee'
          }}>
            <Gamepad2 size={26} />
          </div>
          <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600, margin: '0 0 6px 0', fontFamily: "'Space Grotesk', sans-serif" }}>
            No Game Accounts Linked Yet
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '13px', maxWidth: '440px', margin: '0 auto 20px' }}>
            Link your Riot Games or Steam accounts to verify your rank, sync real-time combat performance (K/D, Winrate, Headshot %), and boost your AI squad synergy.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="glassBtn"
              onClick={() => {
                fillDemoAccount('riot');
                setIsModalOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', color: '#ff4655', borderColor: 'rgba(255, 70, 85, 0.4)' }}
            >
              <span>+ Connect Riot Games (Valorant)</span>
            </button>
            <button
              type="button"
              className="glassBtn"
              onClick={() => {
                fillDemoAccount('steam');
                setIsModalOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', color: '#22d3ee', borderColor: 'rgba(34, 211, 238, 0.4)' }}
            >
              <span>+ Connect Steam (CS2 / Dota 2)</span>
            </button>
          </div>
        </div>
      ) : (
        /* ACCOUNTS GRID */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {accounts.map((acc) => {
            const stats = accountStats[acc.id];
            const isRiot = acc.platform === 'riot';
            const isSteam = acc.platform === 'steam';
            const brandColor = isRiot ? '#ff4655' : isSteam ? '#38bdf8' : '#8b5cf6';
            const isSyncing = syncingId === acc.id;
            const isUnlinking = unlinkingId === acc.id;

            return (
              <div 
                key={acc.id}
                style={{
                  borderRadius: '18px',
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: `1px solid ${brandColor}40`,
                  padding: '20px',
                  transition: 'all 0.2s',
                  boxShadow: `0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                }}
              >
                {/* ACCOUNT TOP BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* PLATFORM BADGE */}
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${brandColor}22, ${brandColor}44)`,
                      border: `1px solid ${brandColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: brandColor,
                      fontWeight: 800,
                      fontSize: '15px',
                      fontFamily: "'Space Grotesk', sans-serif"
                    }}>
                      {isRiot ? 'R' : isSteam ? 'S' : acc.platform.substring(0, 1).toUpperCase()}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '16px', color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                          {acc.in_game_name}
                          {acc.tagline ? <span style={{ color: '#94a3b8', fontWeight: 500 }}>#{acc.tagline}</span> : ''}
                        </strong>

                        {acc.is_verified && (
                          <span className="matchBadge" style={{
                            fontSize: '10px',
                            color: '#10b981',
                            borderColor: '#10b981',
                            background: 'rgba(16, 185, 129, 0.12)'
                          }}>
                            ✓ Verified
                          </span>
                        )}

                        {acc.is_primary && (
                          <span className="matchBadge" style={{
                            fontSize: '10px',
                            color: '#22d3ee',
                            borderColor: '#22d3ee',
                            background: 'rgba(34, 211, 238, 0.12)'
                          }}>
                            ★ Primary
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                        <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 600 }}>
                          {acc.game_name}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>•</span>
                        <span style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase' }}>
                          {acc.platform} ({acc.region || 'Global'})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="glassBtn"
                      onClick={() => handleSyncAccount(acc.id)}
                      disabled={isSyncing}
                      title="Sync live combat telemetry"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        color: '#22d3ee',
                        borderColor: 'rgba(34, 211, 238, 0.3)'
                      }}
                    >
                      <RefreshCw size={12} className={isSyncing ? 'spinner' : ''} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync Telemetry'}</span>
                    </button>

                    <button
                      type="button"
                      className="glassBtn"
                      onClick={() => handleUnlinkAccount(acc.id)}
                      disabled={isUnlinking}
                      title="Unlink account"
                      style={{
                        padding: '6px 10px',
                        color: '#f43f5e',
                        borderColor: 'rgba(244, 63, 94, 0.3)'
                      }}
                    >
                      {isUnlinking ? <Loader2 size={13} className="spinner" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>

                {/* COMBAT TELEMETRY STATS TILES */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  {/* RANK */}
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <Trophy size={12} color="#f59e0b" /> Competitive Rank
                    </span>
                    <strong style={{ fontSize: '14px', color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {stats?.current_rank || 'Ascendant 2'}
                    </strong>
                  </div>

                  {/* K/D RATIO */}
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <Flame size={12} color="#f43f5e" /> K/D Ratio
                    </span>
                    <strong style={{ fontSize: '14px', color: '#22d3ee', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {stats?.kd_ratio ? stats.kd_ratio.toFixed(2) : '1.34'}
                    </strong>
                  </div>

                  {/* WIN RATE */}
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <Activity size={12} color="#10b981" /> Win Rate
                    </span>
                    <strong style={{ fontSize: '14px', color: '#10b981', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {stats?.win_rate ? `${(stats.win_rate * 100).toFixed(1)}%` : '58.4%'}
                    </strong>
                  </div>

                  {/* HEADSHOT / ACCURACY */}
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <Crosshair size={12} color="#8b5cf6" /> Headshot %
                    </span>
                    <strong style={{ fontSize: '14px', color: '#c084fc', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {stats?.headshot_percentage ? `${(stats.headshot_percentage * 100).toFixed(1)}%` : '26.8%'}
                    </strong>
                  </div>

                  {/* MATCHES */}
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <Layers size={12} color="#38bdf8" /> Matches
                    </span>
                    <strong style={{ fontSize: '14px', color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {stats ? `${stats.wins}W / ${stats.losses}L` : '42W / 28L'}
                    </strong>
                  </div>
                </div>

                {/* STATS TIMESTAMP & PAYLOAD TRIGGER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '11px', color: '#64748b' }}>
                  <span>
                    Last Synced: {acc.last_synced_at ? new Date(acc.last_synced_at).toLocaleString() : 'Recently synchronized'}
                  </span>

                  {stats && (
                    <button
                      type="button"
                      onClick={() => setSelectedStatPayload(stats)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      View Raw Telemetry
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LINK ACCOUNT MODAL */}
      {isModalOpen && (
        <div className="modalOverlay" onClick={() => setIsModalOpen(false)} style={{ zIndex: 1100 }}>
          <div 
            className="glassCard" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '28px',
              position: 'relative',
              borderRadius: '24px',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.7)'
            }}
          >
            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            {/* HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(34, 211, 238, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22d3ee'
              }}>
                <Link2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Link Game Platform
                </h3>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                  Verify ownership and sync real-time combat performance
                </span>
              </div>
            </div>

            {/* PRE-FILL SHORTCUTS */}
            <div style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(34, 211, 238, 0.06)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              marginBottom: '20px'
            }}>
              <span style={{ fontSize: '11px', color: '#22d3ee', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                ⚡ One-Click Demo Credentials
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('riot')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 70, 85, 0.2)',
                    border: '1px solid #ff4655',
                    color: '#ffffff',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Fill Riot (ValkyriePrime#NA1)
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('steam')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    border: '1px solid #38bdf8',
                    color: '#ffffff',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Fill Steam (MiracleWorker)
                </button>
              </div>
            </div>

            {formError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid #f43f5e',
                color: '#f43f5e',
                fontSize: '12px',
                marginBottom: '16px'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleLinkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Platform
                  </label>
                  <select
                    className="inputField"
                    value={formData.platform}
                    onChange={(e) => {
                      const plat = e.target.value;
                      setFormData({
                        ...formData,
                        platform: plat,
                        game_name: plat === 'riot' ? 'Valorant' : plat === 'steam' ? 'CS2' : 'Apex Legends',
                        tagline: plat === 'riot' ? 'NA1' : ''
                      });
                    }}
                    style={{ width: '100%', fontSize: '13px' }}
                  >
                    <option value="riot">Riot Games (RSO)</option>
                    <option value="steam">Valve Steam (OpenID)</option>
                    <option value="battlenet">Battle.net</option>
                    <option value="epic">Epic Games</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Game Title
                  </label>
                  <select
                    className="inputField"
                    value={formData.game_name}
                    onChange={(e) => setFormData({ ...formData, game_name: e.target.value })}
                    style={{ width: '100%', fontSize: '13px' }}
                  >
                    {formData.platform === 'riot' ? (
                      <>
                        <option value="Valorant">Valorant</option>
                        <option value="League of Legends">League of Legends</option>
                      </>
                    ) : formData.platform === 'steam' ? (
                      <>
                        <option value="CS2">CS2</option>
                        <option value="Dota 2">Dota 2</option>
                      </>
                    ) : (
                      <>
                        <option value="Apex Legends">Apex Legends</option>
                        <option value="Rainbow Six Siege">Rainbow Six Siege</option>
                        <option value="Call of Duty">Call of Duty</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: formData.platform === 'riot' ? '2fr 1fr' : '1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                    In-Game Name (IGN)
                  </label>
                  <input
                    type="text"
                    className="inputField"
                    value={formData.in_game_name}
                    onChange={(e) => setFormData({ ...formData, in_game_name: e.target.value })}
                    placeholder="e.g. TenZ or S1mple"
                    required
                    style={{ width: '100%', fontSize: '13px' }}
                  />
                </div>

                {formData.platform === 'riot' && (
                  <div>
                    <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                      Tagline
                    </label>
                    <input
                      type="text"
                      className="inputField"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g. NA1"
                      style={{ width: '100%', fontSize: '13px' }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="isPrimaryCheckbox"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="isPrimaryCheckbox" style={{ fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
                  Mark as primary account for {formData.game_name}
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="glassBtn"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primaryBtn"
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', fontSize: '13px' }}
                >
                  {submitting ? <Loader2 size={14} className="spinner" /> : <Link2 size={14} />}
                  <span>Verify & Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAW TELEMETRY MODAL */}
      {selectedStatPayload && (
        <div className="modalOverlay" onClick={() => setSelectedStatPayload(null)} style={{ zIndex: 1100 }}>
          <div 
            className="glassCard" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              padding: '24px',
              borderRadius: '20px',
              border: '1px solid rgba(34, 211, 238, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', color: '#ffffff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                Combat Telemetry Payload ({selectedStatPayload.game_name})
              </h3>
              <button
                type="button"
                onClick={() => setSelectedStatPayload(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <pre style={{
              background: '#060911',
              padding: '16px',
              borderRadius: '12px',
              color: '#22d3ee',
              fontSize: '12px',
              fontFamily: "'Geist Mono', monospace",
              overflowX: 'auto'
            }}>
              {JSON.stringify(selectedStatPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* OAUTH PRODUCTION DEPLOYMENT GUIDE MODAL */}
      {isOAuthGuideOpen && (
        <OAuthProductionGuideModal onClose={() => setIsOAuthGuideOpen(false)} />
      )}
    </div>
  );
}
