import type { Challenge } from '../types';

export type EditorialDifficulty = 'EASY'|'MEDIUM'|'HARD';
const words=(value:string)=>value.toLowerCase().match(/[a-z0-9]+/g)??[];
export const normaliseEditorialText=(value:string)=>words(value).join(' ');
const promotedDifficulty=(category:string):EditorialDifficulty => {
  if(/sport|food|television|broadcast|music|tourism|tradition|british cities|natural history|wales|scotland|northern ireland/i.test(category))return 'EASY';
  if(/constitution|parliament|ancient|archaeology|architecture|engineering|science|medicine|social reform|royal history/i.test(category))return 'HARD';
  return 'MEDIUM';
};

export function inferredDifficulty(challenge:Challenge):EditorialDifficulty {
  switch(challenge.roundType){
    case 'TOP_10': return challenge.items.some(item=>item.rarityMultiplier>=1.6)?'HARD':'MEDIUM';
    case 'PUT_UP_OR_SHUT_UP':case 'THE_LIST': return challenge.validAnswers.length>=18?'EASY':challenge.validAnswers.length<=9?'HARD':'MEDIUM';
    case 'WHERE_IN_BRITAIN': return /castle|cathedral|university/i.test(challenge.prompt)?'MEDIUM':'HARD';
    case 'CLOSEST_WINS': return challenge.toleranceScale>=35?'EASY':challenge.toleranceScale<=15?'HARD':'MEDIUM';
    case 'RANK_IT': return challenge.items.length<=4?'EASY':challenge.items.length>=7?'HARD':'MEDIUM';
    case 'IMAGE_REVEAL': return challenge.visualHint.length>80?'EASY':'MEDIUM';
    case 'STOP_THE_SCORE': return 'MEDIUM';
    case 'MISFILED_RECORDS': case 'REDACTED_RECORDS': case 'COMMON_DOSSIER': case 'MISSING_MINUTES':
    case 'PUBLIC_ENQUIRY': case 'CHAIN_OF_COMMAND': case 'COMPLAINTS_DESK': case 'SEATING_COMMITTEE':
    case 'DISPATCH_BOX': return promotedDifficulty(challenge.category);
  }
}

/** Finds exact answer phrases exposed in prompts. Single generic words are
 * ignored to avoid false alarms such as UK, river or castle. */
export function exposedAnswers(challenge:Challenge):string[] {
  const prompt=` ${words(challenge.prompt).join(' ')} `;let answers:string[]=[];
  if(challenge.roundType==='TOP_10')answers=challenge.items.map(item=>item.name);
  if(challenge.roundType==='PUT_UP_OR_SHUT_UP'||challenge.roundType==='THE_LIST')answers=challenge.validAnswers.map(item=>item.name);
  if(challenge.roundType==='IMAGE_REVEAL'||challenge.roundType==='REDACTED_RECORDS')answers=[challenge.subjectName];
  if(challenge.roundType==='COMMON_DOSSIER')answers=[challenge.connection];
  if(challenge.roundType==='MISSING_MINUTES')answers=[challenge.entries[challenge.missingEntryIndex]];
  if(challenge.roundType==='STOP_THE_SCORE')answers=[challenge.options[challenge.correctIndex]];
  return answers.filter(answer=>{const normal=words(answer).join(' ');return normal.split(' ').length>1&&prompt.includes(` ${normal} `);});
}

export interface AutomatedEditorialIssue {
  challengeId: string;
  kind: 'ANSWER_EXPOSED'|'AMBIGUOUS_ALIAS'|'DUPLICATE_PROMPT'|'PLACEHOLDER_COPY';
  detail: string;
}

/** Mechanical preflight only. Passing this does not establish factual
 * correctness and must never be treated as independent editorial approval. */
export function automatedEditorialIssues(challenges:Challenge[]):AutomatedEditorialIssue[]{
  const issues:AutomatedEditorialIssue[]=[];
  const promptOwners=new Map<string,string[]>();
  const promptDefinesChallenge=new Set(['TOP_10','PUT_UP_OR_SHUT_UP','THE_LIST','WHERE_IN_BRITAIN','CLOSEST_WINS','RANK_IT','IMAGE_REVEAL','STOP_THE_SCORE']);
  for(const challenge of challenges){
    const promptKey=normaliseEditorialText(challenge.prompt);
    if(promptDefinesChallenge.has(challenge.roundType))promptOwners.set(promptKey,[...(promptOwners.get(promptKey)??[]),challenge.id]);
    for(const answer of exposedAnswers(challenge))issues.push({challengeId:challenge.id,kind:'ANSWER_EXPOSED',detail:`Prompt contains accepted answer “${answer}”.`});
    if(/\b(?:todo|tbc|placeholder|lorem ipsum)\b|\{\{|\}\}|\[\[|\]\]/i.test(challenge.prompt))issues.push({challengeId:challenge.id,kind:'PLACEHOLDER_COPY',detail:'Prompt contains unfinished placeholder copy.'});
    const answerGroups=challenge.roundType==='TOP_10'?challenge.items:challenge.roundType==='PUT_UP_OR_SHUT_UP'||challenge.roundType==='THE_LIST'?challenge.validAnswers:[];
    const variants=new Map<string,Set<string>>();
    for(const answer of answerGroups){
      for(const variant of [answer.name,...answer.aliases]){
        const key=normaliseEditorialText(variant);
        if(!key)continue;
        const owners=variants.get(key)??new Set<string>();owners.add(answer.name);variants.set(key,owners);
      }
    }
    for(const [variant,owners] of variants)if(owners.size>1)issues.push({challengeId:challenge.id,kind:'AMBIGUOUS_ALIAS',detail:`“${variant}” resolves to ${[...owners].join(' or ')}.`});
  }
  for(const [prompt,owners] of promptOwners)if(prompt&&owners.length>1)for(const challengeId of owners)issues.push({challengeId,kind:'DUPLICATE_PROMPT',detail:`Prompt duplicates ${owners.filter(id=>id!==challengeId).join(', ')}.`});
  return issues;
}

export function difficultyDistribution(challenges:Challenge[]){return challenges.reduce<Record<EditorialDifficulty,number>>((counts,challenge)=>{counts[inferredDifficulty(challenge)]+=1;return counts;},{EASY:0,MEDIUM:0,HARD:0});}

export function difficultyForRound(index:number,total:number):EditorialDifficulty {
  const progress=(index+.5)/Math.max(1,total);
  return progress<=.3?'EASY':progress>=.72?'HARD':'MEDIUM';
}
