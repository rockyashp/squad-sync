import React, { useState } from 'react';
import { 
  Dna, 
  Shield, 
  Zap, 
  Target, 
  MessageSquare, 
  RotateCcw, 
  Flame, 
  Award,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Share2
} from 'lucide-react';
import ShareGamerDnaModal from './ShareGamerDnaModal';

export default function GamerDnaCardView({ dnaCard, user, onRetakeSurvey, loading }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  if (loading) {
    return (
      <div className="glassCard" style={{ padding: '36px', textAlign: 'center' }}>
        <Dna size={36} className="spinner" color="#22d3ee" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ color: '#ffffff', fontSize: '18px', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
          Decoding Gamer DNA™...
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
          Synthesizing behavioral metrics, leadership index, and tactical synergies.
        </p>
      </div>
    );
  }

  if (!dnaCard) {
    return (
      <div className="glassCard" style={{
        padding: '36px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(13, 19, 33, 0.8), rgba(34, 211, 238, 0.05))',
        border: '1px dashed rgba(34, 211, 238, 0.3)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(34, 211, 238, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: '#22d3ee'
        }}>
          <Dna size={28} />
        </div>
        <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
          No Gamer DNA™ Profile Generated Yet
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '440px', margin: '8px auto 20px' }}>
          Complete the 10-point behavioral questionnaire to classify your tactical role, analyze aggression and communication metrics, and unlock AI squad matchmaking.
        </p>
        <button
          type="button"
          className="primaryBtn"
          onClick={onRetakeSurvey}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
        >
          <Dna size={16} />
          <span>Launch Gamer DNA™ Survey</span>
        </button>
      </div>
    );
  }

  // Trait bars config
  const traits = [
    { label: 'Leadership & Shotcalling', value: dnaCard.leadership_score ?? 75, icon: Award, color: '#f59e0b' },
    { label: 'Strategy & Tactical Sense', value: dnaCard.strategy_score ?? 80, icon: Target, color: '#22d3ee' },
    { label: 'Teamwork & Tilt Resistance', value: dnaCard.teamwork_score ?? 75, icon: Shield, color: '#10b981' },
    { label: 'Aggression & Entry Fragging', value: dnaCard.aggression_score ?? 65, icon: Flame, color: '#f43f5e' },
    { label: 'Vocal Communication Style', value: dnaCard.communication_score ?? 80, icon: MessageSquare, color: '#8b5cf6' },
    { label: 'Tactical Confidence', value: dnaCard.confidence_score ?? 70, icon: Zap, color: '#38bdf8' }
  ];

  return (
    <div className="glassCard" style={{
      position: 'relative',
      overflow: 'hidden',
      padding: '28px',
      borderRadius: '24px',
      border: '1px solid rgba(34, 211, 238, 0.25)',
      background: 'linear-gradient(135deg, rgba(13, 19, 33, 0.9), rgba(15, 23, 42, 0.95))',
      boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }}>
      {/* AMBIENT GLOW ELEMENT */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15), transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* TOP HEADER: ARCHETYPE & ROLES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(34, 211, 238, 0.12)',
              border: '1px solid rgba(34, 211, 238, 0.3)',
              color: '#22d3ee',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              <Dna size={12} />
              Verified Gamer DNA™
            </span>
            <span style={{ color: '#64748b', fontSize: '12px' }}>• Neural Fingerprint</span>
          </div>

          <h3 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 6px 0',
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '-0.3px'
          }}>
            {dnaCard.personality || 'The Tactical Operator'}
          </h3>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '4px 12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(59, 130, 246, 0.2))',
              border: '1px solid rgba(34, 211, 238, 0.4)',
              color: '#22d3ee',
              fontSize: '12px',
              fontWeight: 600
            }}>
              Primary: {dnaCard.primary_role || 'Flex'}
            </span>

            {dnaCard.secondary_role && (
              <span style={{
                padding: '4px 12px',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                color: '#c084fc',
                fontSize: '12px',
                fontWeight: 600
              }}>
                Secondary: {dnaCard.secondary_role}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="primaryBtn"
            onClick={() => setIsShareModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 15px',
              fontSize: '12px',
              background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
              border: 'none',
              color: '#060911',
              fontWeight: 700,
              boxShadow: '0 0 16px rgba(34, 211, 238, 0.35)',
              cursor: 'pointer'
            }}
          >
            <Share2 size={13} />
            <span>Export & Share Card</span>
          </button>

          {onRetakeSurvey && (
            <button
              type="button"
              className="glassBtn"
              onClick={onRetakeSurvey}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '12px',
                color: '#94a3b8'
              }}
            >
              <RotateCcw size={13} />
              <span>Recalibrate DNA</span>
            </button>
          )}
        </div>
      </div>

      {/* PSYCHOMETRIC TRAIT METRICS */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        marginBottom: '24px'
      }}>
        <h4 style={{
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: '#cbd5e1',
          margin: '0 0 16px 0',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Compass size={14} color="#22d3ee" />
          Behavioral Dimension Scores
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px 24px' }}>
          {traits.map((trait) => {
            const Icon = trait.icon;
            return (
              <div key={trait.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={14} color={trait.color} />
                    {trait.label}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {trait.value}%
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '9999px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, trait.value))}%`,
                    background: `linear-gradient(90deg, ${trait.color}88, ${trait.color})`,
                    borderRadius: '9999px',
                    boxShadow: `0 0 8px ${trait.color}66`,
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECOMMENDED PLAYSTYLE & ANALYSIS */}
      {dnaCard.recommended_playstyle && (
        <div style={{
          padding: '16px 18px',
          borderRadius: '14px',
          background: 'rgba(34, 211, 238, 0.06)',
          border: '1px solid rgba(34, 211, 238, 0.2)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Target size={15} color="#22d3ee" />
            <strong style={{ fontSize: '13px', color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AI Tactical Recommendation
            </strong>
          </div>
          <p style={{ color: '#e2e8f0', fontSize: '13px', margin: 0, lineHeight: 1.55 }}>
            {dnaCard.recommended_playstyle}
          </p>
        </div>
      )}

      {/* STRENGTHS & TACTICAL WATCHOUTS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* STRENGTHS */}
        {dnaCard.strengths?.length > 0 && (
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <h5 style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#10b981',
              margin: '0 0 10px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={14} /> Competitive Strengths
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {dnaCard.strengths.map((str, idx) => (
                <div key={idx} style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>•</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WEAKNESSES / IMPROVEMENTS */}
        {dnaCard.weaknesses?.length > 0 && (
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(244, 63, 94, 0.05)',
            border: '1px solid rgba(244, 63, 94, 0.2)'
          }}>
            <h5 style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#f43f5e',
              margin: '0 0 10px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <AlertTriangle size={14} /> Tactical Focus Areas
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {dnaCard.weaknesses.map((weak, idx) => (
                <div key={idx} style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>•</span>
                  <span>{weak}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EXPORT & VIRAL SOCIAL SHARE MODAL */}
      {isShareModalOpen && (
        <ShareGamerDnaModal
          dnaCard={dnaCard}
          user={user}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
}
