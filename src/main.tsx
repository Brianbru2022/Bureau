import {lazy, StrictMode, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import {initialiseDesktopStorage} from './game/storageSnapshot';

const isVisualGallery = import.meta.env.DEV && window.location.pathname === '/dev/gallery';
const isRoundLab = import.meta.env.DEV && window.location.pathname === '/dev/round-lab';
const isPostAssessmentLab = import.meta.env.DEV && window.location.pathname === '/dev/post-assessment';
const RootView = isVisualGallery
  ? lazy(() => import('./components/dev/VisualStateGallery'))
  : isRoundLab
    ? lazy(() => import('./components/dev/RoundInteractionLab'))
    : isPostAssessmentLab
      ? lazy(() => import('./components/dev/PostAssessmentLab'))
      : lazy(() => import('./App'));

const start = async () => {
  await initialiseDesktopStorage();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Suspense fallback={<div className="grid min-h-dvh place-items-center bg-[#efe3be] font-['Courier_Prime'] text-sm font-bold uppercase text-[#5f4936]">Opening Bureau file…</div>}>
        <RootView />
      </Suspense>
    </StrictMode>,
  );
};

void start();
