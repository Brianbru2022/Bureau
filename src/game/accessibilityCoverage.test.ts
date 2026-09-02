import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8');
const roundDirectory = join(process.cwd(), 'src/components/rounds');
const playableRoundSources = readdirSync(roundDirectory)
  .filter(file => file.endsWith('Round.tsx'))
  .map(file => ({ file, contents: readFileSync(join(roundDirectory, file), 'utf8') }));

describe('input and accessibility release gate', () => {
  it('keeps pointer interaction on native controls except for the keyboard-enabled map', () => {
    const appSource = source('src/App.tsx');
    const roundSources = playableRoundSources.map(round => round.contents).join('\n');
    expect(appSource).not.toMatch(/<(?:div|span|li|img|section)[^>]*onClick/);
    expect(roundSources).not.toMatch(/<(?:div|span|li|img|section)[^>]*onClick/);
    expect(playableRoundSources.filter(round => round.contents.includes('onPointerDown')).map(round => round.file).sort()).toEqual(['FinalCaseRound.tsx', 'WhereInBritainRound.tsx']);
    expect(roundSources).toContain('aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Enter Space"');
    expect(roundSources).toContain('Move ${item.label} up');
    expect(roundSources).toContain('Move ${official} left');
  });

  it('restores focus through shared modal and phase infrastructure', () => {
    expect(source('src/components/common/AssetDrawer.tsx')).toContain('useModalFocus');
    expect(source('src/components/rounds/BureauReviewModal.tsx')).toContain('useModalFocus');
    expect(source('src/components/screens/TitleScreen.tsx')).toContain('useModalFocus');
    expect(source('src/App.tsx')).toContain('data-bureau-focus-target');
    expect(source('src/components/common/CommentaryPlaque.tsx')).toContain('previousFocus?.focus()');
  });

  it('announces score, timer, life and ordering changes without image-only state', () => {
    expect(source('src/App.tsx')).toContain('<MatchStatusAnnouncer');
    expect(source('src/components/common/TurnTimer.tsx')).toContain('[10, 5, 0]');
    expect(source('src/components/rounds/Top10Round.tsx')).toContain('aria-live="assertive"');
    expect(source('src/components/rounds/RankItRound.tsx')).toContain('moveAnnouncement');
    expect(source('src/components/rounds/SeatingCommitteeRound.tsx')).toContain('moveAnnouncement');
    const frame=source('src/components/common/ApparatusFrame.tsx');
    expect(frame).toContain('Active control');
    expect(frame).toContain('role="status"');
    expect(frame).toContain('Entry accepted and certified');
    expect(frame).toContain('Entry rejected by the register');
  });

  it('retains visible focus, 44-pixel controls and reduced-motion input feedback', () => {
    const css = source('src/index.css');
    expect(css).toContain('outline: 4px solid #1f7a8c');
    expect(css).toMatch(/\.bureau-button\s*\{[\s\S]*?min-height:\s*44px/);
    expect(css).toContain('.bureau-button:hover,.bureau-button:active { transform:none !important; }');
    expect(source('src/components/common/BureauRoomBackdrop.tsx')).toContain('lg:overflow-hidden');
  });

  it('conceals private handovers behind a named, keyboard-contained modal', () => {
    const curtain = source('src/components/common/PrivacyCurtain.tsx');
    expect(curtain).toContain('role="dialog"');
    expect(curtain).toContain('aria-modal="true"');
    expect(curtain).toContain('confirmRef.current?.focus()');
    expect(curtain).toContain("event.key === 'Tab'");
    expect(curtain).toContain("document.body.style.overflow = 'hidden'");
    for (const component of ['ClosestWinsRound.tsx', 'PublicEnquiryRound.tsx']) {
      expect(source(`src/components/rounds/${component}`)).toContain('<PrivacyCurtain');
    }
    for (const component of ['SecretDirectivesScreen.tsx', 'CommitteeWindow.tsx']) {
      expect(source(`src/components/screens/${component}`)).toContain('<PrivacyCurtain');
    }
  });
});
