import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Key, 
  ShieldCheck, 
  Check, 
  Copy, 
  Terminal, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function OAuthProductionGuideModal({ onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, keyName) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const riotEnvTemplate = `# Riot Games Developer Portal Credentials
# Register at: https://developer.riotgames.com
RIOT_API_KEY=RGAPI-your-live-riot-api-key
RIOT_CLIENT_ID=your-registered-rso-client-id
RIOT_CLIENT_SECRET=your-registered-rso-client-secret
RIOT_REDIRECT_URI=http://localhost:8000/api/v1/games/riot/callback
RIOT_RSO_AUTH_URL=https://auth.riotgames.com/authorize
RIOT_RSO_TOKEN_URL=https://auth.riotgames.com/token
RIOT_RSO_USERINFO_URL=https://auth.riotgames.com/userinfo`;

  const steamEnvTemplate = `# Valve Steam Web API & OpenID 2.0 Credentials
# Register at: https://steamcommunity.com/dev/apikey
STEAM_API_KEY=your-32-char-steam-web-api-key
STEAM_OPENID_URL=https://steamcommunity.com/openid/login
STEAM_REALM=http://localhost:8000
STEAM_RETURN_URL=http://localhost:8000/api/v1/games/steam/callback`;

  return (
    <div className="modalOverlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="glassCard" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          borderRadius: '24px',
          border: '1px solid rgba(34, 211, 238, 0.35)',
          background: 'linear-gradient(135deg, rgba(6, 9, 17, 0.96), rgba(15, 23, 42, 0.98))',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(34, 211, 238, 0.12)'
        }}
      >
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(34, 211, 238, 0.12)',
              border: '1px solid rgba(34, 211, 238, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22d3ee'
            }}>
              <Key size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                Live OAuth2 & OpenID 2.0 Production Guide
              </h3>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                Connecting official Riot Games & Valve Steam credentials for single-click authorization
              </span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ARCHITECTURE NOTICE */}
        <div style={{
          padding: '16px 18px',
          borderRadius: '14px',
          background: 'rgba(34, 211, 238, 0.06)',
          border: '1px solid rgba(34, 211, 238, 0.25)',
          marginBottom: '22px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldCheck size={16} color="#22d3ee" />
            <strong style={{ fontSize: '13px', color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Dual-Mode Architecture (Sandbox Simulator + Production Redirect)
            </strong>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0, lineHeight: 1.55 }}>
            SquadSync is architected to support <strong>both</strong> official third-party OAuth2 redirects and 
            isolated developer sandbox simulations. When live API keys are not supplied in <code>backend/.env</code>, 
            the backend seamlessly falls back to authentic mock telemetry generators so reviewers, evaluators, and teammates can test the complete account synchronization without waiting weeks for commercial publisher approvals.
          </p>
        </div>

        {/* 1. RIOT GAMES SIGN-ON (RSO) SECTION */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f43f5e',
                fontSize: '11px',
                fontWeight: 700
              }}>
                RIOT GAMES
              </span>
              <h4 style={{ fontSize: '15px', color: '#ffffff', margin: 0, fontWeight: 600 }}>
                Riot Sign-On (RSO) OAuth2 Flow
              </h4>
            </div>

            <a
              href="https://developer.riotgames.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                color: '#22d3ee',
                textDecoration: 'none'
              }}
            >
              <span>developer.riotgames.com</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <ol style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6, paddingLeft: '20px', margin: '0 0 14px 0' }}>
            <li>Log into the <strong>Riot Developer Portal</strong> and create a new Application.</li>
            <li>Request <strong>Riot Sign-On (RSO)</strong> product access for the scopes: <code>openid</code> and <code>cpid</code>.</li>
            <li>Add your callback redirect URI: <code>http://localhost:8000/api/v1/games/riot/callback</code>.</li>
            <li>Copy your <code>Client ID</code> and <code>Client Secret</code> into <code>backend/.env</code>:</li>
          </ol>

          <div style={{ position: 'relative' }}>
            <pre style={{
              background: '#060911',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#38bdf8',
              fontSize: '11px',
              fontFamily: "'Geist Mono', monospace",
              overflowX: 'auto',
              margin: 0
            }}>
              {riotEnvTemplate}
            </pre>
            <button
              type="button"
              onClick={() => copyToClipboard(riotEnvTemplate, 'riot')}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                color: copiedKey === 'riot' ? '#10b981' : '#ffffff',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copiedKey === 'riot' ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedKey === 'riot' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* 2. VALVE STEAM OPENID SECTION */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                fontSize: '11px',
                fontWeight: 700
              }}>
                VALVE STEAM
              </span>
              <h4 style={{ fontSize: '15px', color: '#ffffff', margin: 0, fontWeight: 600 }}>
                Steam OpenID 2.0 & Web API Flow
              </h4>
            </div>

            <a
              href="https://steamcommunity.com/dev/apikey"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                color: '#22d3ee',
                textDecoration: 'none'
              }}
            >
              <span>steamcommunity.com/dev/apikey</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <ol style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6, paddingLeft: '20px', margin: '0 0 14px 0' }}>
            <li>Generate a <strong>Steam Web API Key</strong> associated with your Steam Community domain.</li>
            <li>Configure OpenID 2.0 return URL: <code>http://localhost:8000/api/v1/games/steam/callback</code>.</li>
            <li>Save your <code>STEAM_API_KEY</code> into <code>backend/.env</code>:</li>
          </ol>

          <div style={{ position: 'relative' }}>
            <pre style={{
              background: '#060911',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#38bdf8',
              fontSize: '11px',
              fontFamily: "'Geist Mono', monospace",
              overflowX: 'auto',
              margin: 0
            }}>
              {steamEnvTemplate}
            </pre>
            <button
              type="button"
              onClick={() => copyToClipboard(steamEnvTemplate, 'steam')}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                color: copiedKey === 'steam' ? '#10b981' : '#ffffff',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copiedKey === 'steam' ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedKey === 'steam' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            className="primaryBtn"
            onClick={onClose}
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
}
