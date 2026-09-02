import { writeFileSync } from 'node:fs';
import { QUESTION_PACK_MANIFEST } from '../src/data/questionPackManifest';

writeFileSync('QUESTION-SOURCES.json', `${JSON.stringify(QUESTION_PACK_MANIFEST, null, 2)}\n`, 'utf8');
console.log(`Exported ${QUESTION_PACK_MANIFEST.challengeCount} question-source records.`);
