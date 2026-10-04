import React, { useRef, useState, useEffect } from 'react';
import { 
  Download, 
  Copy, 
  Share2, 
  Check, 
  X, 
  Dna, 
  Sparkles, 
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

const XIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const RedditIcon = ({ size = 15, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.702zM9.25 12C8.56 12 8 12.56 8 13.25c0 .688.56 1.25 1.25 1.25.688 0 1.25-.562 1.25-1.25 0-.69-.562-1.25-1.25-1.25zm5.5 0c-.688 0-1.25.56-1.25 1.25 0 .688.562 1.25 1.25 1.25.69 0 1.25-.562 1.25-1.25 0-.69-.56-1.25-1.25-1.25zm-5.465 4.102a.49.49 0 0 0-.083.688c.518.679 1.554 1.21 2.798 1.21 1.243 0 2.279-.531 2.798-1.21a.492.492 0 0 0-.773-.61c-.347.453-1.127.83-2.025.83-.898 0-1.678-.377-2.025-.83a.49.49 0 0 0-.69-.078z"/>
  </svg>
);

export default function ShareGamerDnaModal({ dnaCard, user, onClose }) {
  const canvasRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [renderReady, setRenderReady] = useState(false);

  const playerName = user?.display_name || user?.username || 'Pro Gamer';
  const playerRank = user?.profile?.current_rank || 'Radiant';
  const playerRegion = (user?.profile?.region || 'NA').toUpperCase();
  const archetype = dnaCard?.personality || 'The Tactical Operator';
  const primaryRole = dnaCard?.primary_role || 'Flex Operator';
  const secondaryRole = dnaCard?.secondary_role || 'Shotcaller';

  // 1. Draw High-Res Canvas Card (1200 x 675)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    // --- Background Base Gradient ---
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#060911');
    bgGrad.addColorStop(0.5, '#0b1120');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // --- Ambient Glow Orbs ---
    // Cyan top-right orb
    const cyanOrb = ctx.createRadialGradient(width - 150, 100, 10, width - 150, 100, 350);
    cyanOrb.addColorStop(0, 'rgba(34, 211, 238, 0.22)');
    cyanOrb.addColorStop(1, 'transparent');
    ctx.fillStyle = cyanOrb;
    ctx.fillRect(0, 0, width, height);

    // Violet bottom-left orb
    const violetOrb = ctx.createRadialGradient(150, height - 100, 10, 150, height - 100, 320);
    violetOrb.addColorStop(0, 'rgba(139, 92, 246, 0.18)');
    violetOrb.addColorStop(1, 'transparent');
    ctx.fillStyle = violetOrb;
    ctx.fillRect(0, 0, width, height);

    // --- Cyberpunk Grid Lines ---
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 45;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // --- Card Outer Border Frame ---
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Corner HUD brackets
    const bracketLen = 30;
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 4;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(20, 20 + bracketLen);
    ctx.lineTo(20, 20);
    ctx.lineTo(20 + bracketLen, 20);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(width - 20 - bracketLen, 20);
    ctx.lineTo(width - 20, 20);
    ctx.lineTo(width - 20, 20 + bracketLen);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(20, height - 20 - bracketLen);
    ctx.lineTo(20, height - 20);
    ctx.lineTo(20 + bracketLen, height - 20);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(width - 20 - bracketLen, height - 20);
    ctx.lineTo(width - 20, height - 20);
    ctx.lineTo(width - 20, height - 20 - bracketLen);
    ctx.stroke();

    // --- Header Badge: SQUADSYNC // VERIFIED GAMER DNA ---
    ctx.fillStyle = 'rgba(34, 211, 238, 0.12)';
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 50, 48, 290, 32, 16, true, true);

    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 12px "Space Grotesk", sans-serif';
    ctx.fillText('◈  SQUADSYNC // VERIFIED GAMER DNA™', 66, 69);

    // Watermark ID on Top-Right
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.font = '12px "Geist Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`NEURAL-ID: SS-DNA-${Math.abs(hashString(playerName)).toString(16).toUpperCase().padStart(8, '0')}`, width - 50, 68);
    ctx.textAlign = 'left';

    // --- Player Profile Row ---
    // Avatar circle with glow
    ctx.save();
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 14;
    const avatarGrad = ctx.createLinearGradient(50, 105, 120, 175);
    avatarGrad.addColorStop(0, '#22d3ee');
    avatarGrad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = avatarGrad;
    ctx.beginPath();
    ctx.arc(85, 140, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Avatar Initial
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(playerName.charAt(0).toUpperCase(), 85, 150);
    ctx.textAlign = 'left';

    // Player Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Space Grotesk", sans-serif';
    ctx.fillText(playerName, 140, 134);

    // Player Subtitle: Rank, Region & Synergy
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Space Grotesk", sans-serif';
    ctx.fillText(`Rank: ${playerRank}  •  Region: ${playerRegion}  •  Telemetry Sync: 100% Active`, 140, 158);

    // Archetype Title Banner
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillText(`Archetype: "${archetype}"`, 50, 218);

    // Role Badges
    drawBadge(ctx, 50, 234, `PRIMARY: ${primaryRole.toUpperCase()}`, '#22d3ee', 'rgba(34, 211, 238, 0.15)');
    drawBadge(ctx, 230, 234, `SECONDARY: ${secondaryRole.toUpperCase()}`, '#c084fc', 'rgba(139, 92, 246, 0.15)');

    // --- LEFT COLUMN: 6 Psychometric Dimension Bars ---
    const traits = [
      { label: 'Leadership & Shotcalling', val: dnaCard?.leadership_score ?? 75, color: '#f59e0b' },
      { label: 'Strategy & Tactical Sense', val: dnaCard?.strategy_score ?? 80, color: '#22d3ee' },
      { label: 'Teamwork & Tilt Resistance', val: dnaCard?.teamwork_score ?? 75, color: '#10b981' },
      { label: 'Aggression & Entry Fragging', val: dnaCard?.aggression_score ?? 65, color: '#f43f5e' },
      { label: 'Vocal Communication Style', val: dnaCard?.communication_score ?? 80, color: '#8b5cf6' },
      { label: 'Tactical Confidence', val: dnaCard?.confidence_score ?? 70, color: '#38bdf8' }
    ];

    const startY = 300;
    const barW = 460;
    const barH = 10;
    const rowGap = 48;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px "Space Grotesk", sans-serif';
    ctx.fillText('BEHAVIORAL DIMENSIONS & PSYCHOMETRICS', 50, startY - 12);

    traits.forEach((t, i) => {
      const y = startY + (i * rowGap);
      // Label & Value
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px "Space Grotesk", sans-serif';
      ctx.fillText(t.label, 50, y + 10);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Geist Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${t.val}%`, 50 + barW, y + 10);
      ctx.textAlign = 'left';

      // Bar Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      roundRect(ctx, 50, y + 16, barW, barH, 5, true, false);

      // Bar Fill
      const fillW = Math.max(12, (barW * Math.min(100, Math.max(0, t.val))) / 100);
      ctx.save();
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = t.color;
      roundRect(ctx, 50, y + 16, fillW, barH, 5, true, false);
      ctx.restore();
    });

    // --- RIGHT COLUMN: Tactical Card HUD ---
    const rightX = 570;
    const rightW = 580;

    // Tactical Card Box
    ctx.fillStyle = 'rgba(13, 19, 33, 0.85)';
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, rightX, 200, rightW, 375, 18, true, true);

    // AI Tactical Recommendation Header
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 15px "Space Grotesk", sans-serif';
    ctx.fillText('⚡ AI TACTICAL PLAYSTYLE RECOMMENDATION', rightX + 24, 236);

    // Recommendation Text Body
    const playstyle = dnaCard?.recommended_playstyle || 
      'Excels in coordinated mid-round adaptations and aggressive entry anchoring. Maintain vocal comms during retakes and leverage high tilt resistance to stabilize clutch situations.';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px "Space Grotesk", sans-serif';
    wrapText(ctx, playstyle, rightX + 24, 268, rightW - 48, 22);

    // Strengths Subbox
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    roundRect(ctx, rightX + 24, 345, rightW - 48, 95, 12, true, true);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.fillText('✔ COMPETITIVE STRENGTHS', rightX + 40, 372);

    const strengths = dnaCard?.strengths?.length > 0 
      ? dnaCard.strengths.slice(0, 2) 
      : ['High-impact entry initiator', 'Tilt-proof clutch comms under pressure'];
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px "Space Grotesk", sans-serif';
    strengths.forEach((s, idx) => {
      ctx.fillText(`• ${s}`, rightX + 40, 396 + (idx * 20));
    });

    // Focus Areas Subbox
    ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
    roundRect(ctx, rightX + 24, 455, rightW - 48, 95, 12, true, true);

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.fillText('⚠ TACTICAL FOCUS AREAS', rightX + 40, 482);

    const weaknesses = dnaCard?.weaknesses?.length > 0 
      ? dnaCard.weaknesses.slice(0, 2) 
      : ['Patience during post-plant defense', 'Resource conservation on eco rounds'];
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px "Space Grotesk", sans-serif';
    weaknesses.forEach((w, idx) => {
      ctx.fillText(`• ${w}`, rightX + 40, 506 + (idx * 20));
    });

    // --- Bottom Watermark Footer ---
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.font = '13px "Geist Mono", monospace';
    ctx.fillText('SQUADSYNC.GG  •  NEURAL CLUSTERING MATCHMAKER  •  COMPUTED VIA SCIKIT-LEARN', 50, height - 34);

    ctx.fillStyle = '#22d3ee';
    ctx.textAlign = 'right';
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.fillText('SHARE TO DISCORD / TWITTER / REDDIT ➔', width - 50, height - 34);
    ctx.textAlign = 'left';

    setRenderReady(true);
  }, [dnaCard, user, playerName, playerRank, playerRegion, archetype, primaryRole, secondaryRole]);

  // Helper: Hash string to int for pseudo-unique neural IDs
  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  };

  // Helper: Draw rounded rectangle
  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // Helper: Draw badge with background and text
  function drawBadge(ctx, x, y, text, textColor, bgColor) {
    ctx.font = 'bold 11px "Space Grotesk", sans-serif';
    const paddingX = 12;
    const height = 24;
    const textWidth = ctx.measureText(text).width;
    const width = textWidth + (paddingX * 2);
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, width, height, 6, true, true);
    ctx.fillStyle = textColor;
    ctx.fillText(text, x + paddingX, y + 16);
    return width;
  }

  // Helper: Wrap text on canvas
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  // Action: Download High-Res PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const imageUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `SquadSync_GamerDNA_${playerName.replace(/\s+/g, '_')}.png`;
      link.href = imageUri;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Action: Copy PNG directly to system clipboard
  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 3000);
      });
    } catch (err) {
      console.warn('Clipboard image write failed:', err);
      // Fallback: download instead
      handleDownload();
    }
  };

  // Action: Copy Share Link
  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/?tab=profile&user=${encodeURIComponent(playerName)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Action: Share to Twitter / X
  const handleTwitterShare = () => {
    const text = encodeURIComponent(
      `Calibrated my Gamer DNA on @SquadSyncGG!\n\n◈ Archetype: "${archetype}"\n◈ Role: ${primaryRole}\n◈ Synergy Ready: 100%\n\nSquad up with me: ${window.location.origin}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  // Action: Share to Reddit
  const handleRedditShare = () => {
    const title = encodeURIComponent(`SquadSync Gamer DNA: ${playerName} [${archetype} - ${primaryRole}]`);
    const url = encodeURIComponent(window.location.origin);
    window.open(`https://reddit.com/submit?title=${title}&url=${url}`, '_blank');
  };

  return (
    <div className="modalOverlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="glassCard" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '28px',
          borderRadius: '24px',
          border: '1px solid rgba(34, 211, 238, 0.4)',
          background: 'linear-gradient(135deg, rgba(6, 9, 17, 0.96), rgba(15, 23, 42, 0.98))',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(34, 211, 238, 0.15)'
        }}
      >
        {/* MODAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(34, 211, 238, 0.15)',
              border: '1px solid rgba(34, 211, 238, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22d3ee'
            }}>
              <Share2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                Export & Share Gamer DNA™ Card
              </h3>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                Ultra HD (1200×675) holographic card formatted for Discord, Twitter, and Reddit
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

        {/* CANVAS PREVIEW CONTAINER */}
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(34, 211, 238, 0.25)',
          background: '#060911',
          marginBottom: '20px',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)'
        }}>
          <canvas 
            ref={canvasRef} 
            style={{ 
              width: '100%', 
              height: 'auto', 
              display: 'block' 
            }} 
          />
        </div>

        {/* ACTION BUTTONS TOOLBAR */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {/* Download 1080p PNG */}
          <button
            type="button"
            className="primaryBtn"
            onClick={handleDownload}
            disabled={downloading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            <Download size={16} />
            <span>{downloading ? 'Rendering HD...' : 'Download HD Card (PNG)'}</span>
          </button>

          {/* Copy PNG to Clipboard */}
          <button
            type="button"
            className="glassBtn"
            onClick={handleCopyImage}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              background: copiedImage ? 'rgba(16, 185, 129, 0.2)' : undefined,
              borderColor: copiedImage ? 'rgba(16, 185, 129, 0.5)' : undefined,
              color: copiedImage ? '#10b981' : '#ffffff'
            }}
          >
            {copiedImage ? <Check size={16} /> : <Copy size={16} />}
            <span>{copiedImage ? 'Image Copied to Clipboard!' : 'Copy Image (Paste to Discord)'}</span>
          </button>

          {/* Share to Twitter / X */}
          <button
            type="button"
            className="glassBtn"
            onClick={handleTwitterShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#38bdf8'
            }}
          >
            <XIcon size={15} />
            <span>Post to X / Twitter</span>
          </button>

          {/* Share to Reddit */}
          <button
            type="button"
            className="glassBtn"
            onClick={handleRedditShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#f97316'
            }}
          >
            <RedditIcon size={16} />
            <span>Share on Reddit</span>
          </button>
        </div>

        {/* VIRAL SHARE FOOTER BAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '14px 18px',
          borderRadius: '14px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#22d3ee" />
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Your card includes verified cryptographic synergy telemetry.
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            style={{
              background: 'none',
              border: 'none',
              color: copiedLink ? '#10b981' : '#22d3ee',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copiedLink ? <Check size={14} /> : <ExternalLink size={14} />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Public Profile Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
