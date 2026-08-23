import { FinalCase } from '../types';

export const FINAL_CASES: FinalCase[] = [
  {
    id: 'case-bletchley-enigma',
    title: 'THE ENIGMA OF STATION X',
    subtitle: 'Ultra Secret Cryptographic Dossier #1941',
    introduction: 'A classified wartime interception requires full bureaucratic reconstruction. You must analyse photographic surveillance, locate the clandestine facility, date the cryptographic breakthrough, and deduce the operative.',
    verdictPrompt: 'Based on the assembled intelligence dossier, who was the mathematician and father of modern computer science who led the Hut 8 naval Enigma decryption?',
    options: ['Alan Turing', 'Tommy Flowers', 'Gordon Welchman', 'Hugh Alexander'],
    correctOptionIndex: 0,
    finalVerdictText: 'Alan Turing. His development of the electromechanical Bombe machine cracked the Naval Enigma ciphers, shortening the Second World War by an estimated two to four years and laying the conceptual foundation for all digital computation.',
    stages: [
      {
        stageNumber: 1,
        stageName: 'Visual Evidence Analysis',
        room: 'The Darkroom Archive',
        prompt: 'Identify the electro-mechanical cipher machine used by the Axis powers that Station X was tasked with cracking:',
        imageHint: 'A portable wooden box with 3 to 4 brass rotors and a plugboard (Steckerbrett).',
        options: ['Enigma Machine', 'Lorenz SZ42', 'Typex Mark II', 'Sigaba'],
        correctIndex: 0,
        clueUnlocked: 'CLUE 1: The cryptographic device was the German ENIGMA cipher machine.'
      },
      {
        stageNumber: 2,
        stageName: 'Geographical Coordinates',
        room: 'The Imperial Atlas Room',
        prompt: 'Pinpoint the location of Bletchley Park (Station X) in Buckinghamshire (between Oxford and Cambridge):',
        targetLocation: { name: 'Bletchley Park, Milton Keynes', mapX: 56.2, mapY: 64.5 },
        clueUnlocked: 'CLUE 2: The Victorian mansion headquarters was situated precisely at BLETCHLEY, Buckinghamshire.'
      },
      {
        stageNumber: 3,
        stageName: 'Chronological Interrogation',
        room: 'The Hall of Records',
        prompt: 'In what year was the first operational prototype "Bombe" machine (named Victory) installed at Bletchley Park?',
        correctYear: 1940,
        tolerance: 3,
        clueUnlocked: 'CLUE 3: The initial British Bombe achieved operational status in the pivotal year 1940.'
      }
    ],
    explanation: 'The Government Code and Cypher School at Bletchley Park decrypted over two million German messages. Churchill described the codebreakers as "the geese that laid the golden eggs and never cackled."'
  },
  {
    id: 'case-sutton-hoo',
    title: 'THE SUTTON HOO SHIP BURIAL',
    subtitle: 'Anglo-Saxon Royal Necropolis Dossier #625',
    introduction: 'Archaeological treasures of immense splendor were unearthed on a Suffolk estate on the eve of war in 1939. Unravel the visual iconography, geography, and chronology of early medieval Britain.',
    verdictPrompt: 'Who is widely believed by medieval historians to have been the 7th-century King of East Anglia buried in the magnificent Sutton Hoo ship?',
    options: ['King Rædwald', 'King Offa of Mercia', 'King Alfred the Great', 'King Athelstan'],
    correctOptionIndex: 0,
    finalVerdictText: 'King Rædwald of East Anglia (d. c. 624/625). Described by the Venerable Bede as Bretwalda (overlord of Britain), his burial contained Byzantine silver, Sri Lankan garnets, and Scandinavian warrior regalia.',
    stages: [
      {
        stageNumber: 1,
        stageName: 'Visual Evidence Analysis',
        room: 'The Darkroom Archive',
        prompt: 'Identify the iconic iron and tinned-bronze visage discovered shattered inside the burial chamber:',
        imageHint: 'A decorated iron helmet featuring a dragon crest whose wings form eyebrow garnets.',
        options: ['The Sutton Hoo Crested Helmet', 'The Battersea Shield', 'The Lewis Chessman King', 'The Alfred Jewel'],
        correctIndex: 0,
        clueUnlocked: 'CLUE 1: The centerpiece artifact was the ceremonial SUTTON HOO HELMET.'
      },
      {
        stageNumber: 2,
        stageName: 'Geographical Coordinates',
        room: 'The Imperial Atlas Room',
        prompt: 'Pinpoint the location of the Sutton Hoo burial mounds near Woodbridge in Suffolk:',
        targetLocation: { name: 'Sutton Hoo, Suffolk', mapX: 68.5, mapY: 64.0 },
        clueUnlocked: 'CLUE 2: The royal cemetery overlooked the River Deben in SUFFOLK.'
      },
      {
        stageNumber: 3,
        stageName: 'Chronological Interrogation',
        room: 'The Hall of Records',
        prompt: 'In what year did landowner Edith Pretty hire self-taught archaeologist Basil Brown to excavate the mounds?',
        correctYear: 1939,
        tolerance: 2,
        clueUnlocked: 'CLUE 3: The historic excavation took place in the summer of 1939.'
      }
    ],
    explanation: 'The discovery shattered Victorian notions that the "Dark Ages" were illiterate and primitive, revealing an Anglo-Saxon court with global trade links and unmatched goldsmithing artistry.'
  }
];
