import type { RoundType } from '../../types';
import { MECHANIC_IDENTITIES, type MechanicIdentity } from '../../game/mechanicIdentity';

const MechanicDiagram = ({ type }: { type: MechanicIdentity['diagram'] }) => {
  switch (type) {
    case 'FREE_SORT': return <><i/><i/><i/><b aria-hidden="true">↕</b></>;
    case 'ADJACENT_SWAP': return <><i/><i/><i/><b aria-hidden="true">↔</b></>;
    case 'BRANCH_ROUTE': return <><i/><i/><i/><span/><b aria-hidden="true">⌁</b></>;
    case 'OPTICAL': return <><span className="bureau-doctrine-iris"/><b aria-hidden="true">◉</b></>;
    case 'DISCLOSURE': return <><i/><i/><i/><b aria-hidden="true">▰</b></>;
    case 'MEMORY': return <><i/><i/><i className="bureau-doctrine-missing"/><b aria-hidden="true">?</b></>;
    case 'LIVES': return <><i/><i/><i/><b aria-hidden="true">♥</b></>;
    case 'AUCTION': return <><i/><i/><i/><b aria-hidden="true">↑</b></>;
    case 'BANK': return <><span className="bureau-doctrine-gauge"/><b aria-hidden="true">◆</b></>;
  }
};

export const MechanicIdentityPlate = ({ roundType, controlLabel }: { roundType: RoundType; controlLabel: string }) => {
  const identity = MECHANIC_IDENTITIES[roundType];
  if (!identity) return null;

  return (
    <aside
      className="bureau-control-legend bureau-mechanic-identity"
      data-mechanic-family={identity.family.toLowerCase()}
      data-mechanic-doctrine={identity.doctrine.toLowerCase().replaceAll(' ', '-')}
      aria-label={`${identity.doctrine} rules`}
    >
      <span className="sr-only">Active control: {controlLabel}.</span>
      <div className="bureau-mechanic-diagram" data-diagram={identity.diagram.toLowerCase()} aria-hidden="true">
        <MechanicDiagram type={identity.diagram}/>
      </div>
      <strong>{identity.doctrine}</strong>
      <dl>
        <div><dt>Action</dt><dd>{identity.action}</dd></div>
        <div><dt>Pressure</dt><dd>{identity.pressure}</dd></div>
        <div><dt>Finish</dt><dd>{identity.finish}</dd></div>
      </dl>
    </aside>
  );
};
