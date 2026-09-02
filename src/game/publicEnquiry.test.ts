import { describe, expect, it } from 'vitest';
import { scorePublicEnquiryJuror, scorePublicEnquiryWitness } from './publicEnquiry';

describe('Public Enquiry continuous scoring', () => {
  it('scores jurors continuously from calibrated probability', () => {
    expect(scorePublicEnquiryJuror(50, true)).toBe(0);
    expect(scorePublicEnquiryJuror(73, true)).toBe(497);
    expect(scorePublicEnquiryJuror(100, true)).toBe(1000);
    expect(scorePublicEnquiryJuror(0, true)).toBe(0);
    expect(scorePublicEnquiryJuror(27, false)).toBe(497);
    expect(scorePublicEnquiryJuror(49, true)).toBe(0);
  });

  it('scores the witness from the exact mean jury belief', () => {
    expect(scorePublicEnquiryWitness([30, 55, 91])).toBe(587);
    expect(scorePublicEnquiryWitness([])).toBe(0);
  });
});
