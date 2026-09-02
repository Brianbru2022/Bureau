import {
  Top10Challenge,
  PutUpOrShutUpChallenge,
  TheListChallenge,
  WhereInBritainChallenge,
  ClosestWinsChallenge,
  RankItChallenge,
  ImageRevealChallenge,
  StopTheScoreChallenge,
  Challenge
} from '../types';
import { supplementalChallenges } from './supplementalQuestions';
import { expansionChallenges } from './expansionQuestions';
import { chainOfCommandChallenges, commonDossierChallenges, complaintsDeskChallenges, dispatchBoxChallenges, misfiledRecordsChallenges, missingMinutesChallenges, publicEnquiryChallenges, redactedRecordsChallenges, seatingCommitteeChallenges } from './prototypeQuestions';

/* ==========================================================================
   1. TOP 10 CHALLENGES (Physical Records Board)
   ========================================================================== */
export const top10Challenges: Top10Challenge[] = [
  {
    id: 'top10-attractions',
    roundType: 'TOP_10',
    category: 'British Tourism & Culture',
    prompt: 'Top 10 Most Visited UK Paid/Ticketed Visitor Attractions',
    items: [
      { rank: 1, name: 'Tower of London', aliases: ['tower', 'the tower', 'tower london'], detail: '2.8m visitors / yr', rarityMultiplier: 1.0 },
      { rank: 2, name: 'Kew Gardens', aliases: ['royal botanic gardens kew', 'kew'], detail: '1.9m visitors / yr', rarityMultiplier: 1.1 },
      { rank: 3, name: 'Chester Zoo', aliases: ['chester'], detail: '1.8m visitors / yr', rarityMultiplier: 1.2 },
      { rank: 4, name: 'Windsor Castle', aliases: ['windsor'], detail: '1.6m visitors / yr', rarityMultiplier: 1.2 },
      { rank: 5, name: 'Edinburgh Castle', aliases: ['edinburgh'], detail: '1.5m visitors / yr', rarityMultiplier: 1.3 },
      { rank: 6, name: 'Westminster Abbey', aliases: ['westminster'], detail: '1.4m visitors / yr', rarityMultiplier: 1.4 },
      { rank: 7, name: 'Stonehenge', aliases: ['stone henge'], detail: '1.3m visitors / yr', rarityMultiplier: 1.3 },
      { rank: 8, name: 'St Paul\'s Cathedral', aliases: ['st pauls', 'st paul', 'saint pauls'], detail: '1.2m visitors / yr', rarityMultiplier: 1.5 },
      { rank: 9, name: 'Roman Baths Bath', aliases: ['roman baths', 'the baths', 'bath baths'], detail: '1.1m visitors / yr', rarityMultiplier: 1.6 },
      { rank: 10, name: 'Eden Project', aliases: ['eden', 'eden cornwall'], detail: '1.0m visitors / yr', rarityMultiplier: 1.7 },
    ],
    explanation: 'The British Museum and Tate Modern are technically free (barring aggressive donation boxes), leaving the Tower of London to comfortably exploit tourists wishing to see where monarchs historically chopped each other’s heads off.',
    source: 'ALVA (Association of Leading Visitor Attractions) Official Figures'
  },
  {
    id: 'top10-longest-rivers',
    roundType: 'TOP_10',
    category: 'UK Physical Geography',
    prompt: 'Top 10 Longest Rivers in the United Kingdom',
    items: [
      { rank: 1, name: 'River Severn', aliases: ['severn'], detail: '220 miles (354 km)', rarityMultiplier: 1.0 },
      { rank: 2, name: 'River Thames', aliases: ['thames'], detail: '215 miles (346 km)', rarityMultiplier: 1.0 },
      { rank: 3, name: 'River Trent', aliases: ['trent'], detail: '185 miles (297 km)', rarityMultiplier: 1.2 },
      { rank: 4, name: 'River Great Ouse', aliases: ['great ouse', 'ouse'], detail: '143 miles (230 km)', rarityMultiplier: 1.4 },
      { rank: 5, name: 'River Wye', aliases: ['wye', 'afon gwy'], detail: '135 miles (217 km)', rarityMultiplier: 1.4 },
      { rank: 6, name: 'River Tay', aliases: ['tay'], detail: '119 miles (193 km)', rarityMultiplier: 1.5 },
      { rank: 7, name: 'River Spey', aliases: ['spey'], detail: '107 miles (172 km)', rarityMultiplier: 1.6 },
      { rank: 8, name: 'River Clyde', aliases: ['clyde'], detail: '106 miles (171 km)', rarityMultiplier: 1.6 },
      { rank: 9, name: 'River Nene', aliases: ['nene'], detail: '100 miles (161 km)', rarityMultiplier: 1.8 },
      { rank: 10, name: 'River Tweed', aliases: ['tweed'], detail: '97 miles (156 km)', rarityMultiplier: 1.7 },
    ],
    explanation: 'Londoners routinely assume the Thames is the longest. The Severn, rising in the Cambrian Mountains, quietly exceeds it by 5 miles, entirely without fanfare or royal pageantry.',
    source: 'UK Centre for Ecology & Hydrology'
  },
  {
    id: 'top10-peaks',
    roundType: 'TOP_10',
    category: 'Scottish & UK Mountains',
    prompt: 'Top 10 Highest Mountain Peaks in the United Kingdom',
    items: [
      { rank: 1, name: 'Ben Nevis', aliases: ['nevis', 'beinn nibheis'], detail: '1,345 m', rarityMultiplier: 1.0 },
      { rank: 2, name: 'Ben Macdui', aliases: ['macdui', 'beinn macduibh'], detail: '1,309 m', rarityMultiplier: 1.3 },
      { rank: 3, name: 'Braeriach', aliases: ['am braeriach'], detail: '1,296 m', rarityMultiplier: 1.6 },
      { rank: 4, name: 'Cairn Toul', aliases: ['cairntoul', 'carn an t-sabhal'], detail: '1,291 m', rarityMultiplier: 1.7 },
      { rank: 5, name: 'Sgor an Lochain Uaine', aliases: ['angel\'s peak', 'angels peak', 'sgor an lochain'], detail: '1,258 m', rarityMultiplier: 1.9 },
      { rank: 6, name: 'Cairn Gorm', aliases: ['cairngorm'], detail: '1,245 m', rarityMultiplier: 1.3 },
      { rank: 7, name: 'Aonach Beag', aliases: ['aonach beag nevis'], detail: '1,234 m', rarityMultiplier: 1.7 },
      { rank: 8, name: 'Aonach Mor', aliases: ['aonach mor'], detail: '1,221 m', rarityMultiplier: 1.7 },
      { rank: 9, name: 'Carn Mor Dearg', aliases: ['cmd', 'carn mor dearg'], detail: '1,220 m', rarityMultiplier: 1.8 },
      { rank: 10, name: 'Ben Lawers', aliases: ['lawers'], detail: '1,214 m', rarityMultiplier: 1.6 },
    ],
    explanation: 'All top 10 peaks are Munros in Scotland. Anyone attempting to locate Snowdon or Scafell Pike on this list has sorely underestimated the rugged stubbornness of the Scottish Highlands.',
    source: 'Ordnance Survey MasterMap Topography'
  },
  {
    id: 'top10-populous-cities',
    roundType: 'TOP_10',
    category: 'Demographics & Urban Geography',
    prompt: 'Top 10 Most Populous UK Cities / Major Settlement Areas',
    items: [
      { rank: 1, name: 'London', aliases: ['greater london'], detail: '8.9m population', rarityMultiplier: 1.0 },
      { rank: 2, name: 'Birmingham', aliases: ['brum'], detail: '1.15m population', rarityMultiplier: 1.1 },
      { rank: 3, name: 'Glasgow', aliases: ['glaschu'], detail: '635,000 population', rarityMultiplier: 1.2 },
      { rank: 4, name: 'Manchester', aliases: ['greater manchester'], detail: '560,000 population', rarityMultiplier: 1.2 },
      { rank: 5, name: 'Liverpool', aliases: ['scouse'], detail: '500,000 population', rarityMultiplier: 1.3 },
      { rank: 6, name: 'Edinburgh', aliases: ['dun eideann'], detail: '490,000 population', rarityMultiplier: 1.3 },
      { rank: 7, name: 'Sheffield', aliases: ['steel city'], detail: '485,000 population', rarityMultiplier: 1.4 },
      { rank: 8, name: 'Leeds', aliases: ['west yorkshire leeds'], detail: '475,000 population', rarityMultiplier: 1.4 },
      { rank: 9, name: 'Bristol', aliases: ['city of bristol'], detail: '470,000 population', rarityMultiplier: 1.4 },
      { rank: 10, name: 'Leicester', aliases: ['city of leicester'], detail: '400,000 population', rarityMultiplier: 1.6 },
    ],
    explanation: 'Administrative boundary quirks mean Leeds as a metropolitan district is huge, but as a discrete core urban area, Birmingham remains Britain’s undisputed second city.',
    source: 'Office for National Statistics (ONS) Census Data'
  },
  {
    id: 'top10-surnames',
    roundType: 'TOP_10',
    category: 'British Society & Genealogy',
    prompt: 'Top 10 Most Common Surnames in the United Kingdom',
    items: [
      { rank: 1, name: 'Smith', aliases: ['smyth'], detail: 'approx. 550,000 people', rarityMultiplier: 1.0 },
      { rank: 2, name: 'Jones', aliases: ['johns'], detail: 'approx. 430,000 people', rarityMultiplier: 1.1 },
      { rank: 3, name: 'Taylor', aliases: ['tayler'], detail: 'approx. 300,000 people', rarityMultiplier: 1.2 },
      { rank: 4, name: 'Brown', aliases: ['browne'], detail: 'approx. 260,000 people', rarityMultiplier: 1.2 },
      { rank: 5, name: 'Williams', aliases: ['william'], detail: 'approx. 245,000 people', rarityMultiplier: 1.3 },
      { rank: 6, name: 'Wilson', aliases: ['wilsone'], detail: 'approx. 190,000 people', rarityMultiplier: 1.4 },
      { rank: 7, name: 'Johnson', aliases: ['johnsen'], detail: 'approx. 175,000 people', rarityMultiplier: 1.4 },
      { rank: 8, name: 'Davies', aliases: ['davis'], detail: 'approx. 170,000 people', rarityMultiplier: 1.4 },
      { rank: 9, name: 'Patel', aliases: ['patell'], detail: 'approx. 165,000 people', rarityMultiplier: 1.5 },
      { rank: 10, name: 'Robinson', aliases: ['robinsonne'], detail: 'approx. 150,000 people', rarityMultiplier: 1.6 },
    ],
    explanation: 'Centuries of occupational medieval naming guarantee that blacksmiths (Smith) and Welsh patronymics (Jones, Williams, Davies) dominate British telephone directories in perpetuity.',
    source: 'General Register Office & ONS Database'
  },
  {
    id: 'top10-english-counties-size',
    roundType: 'TOP_10',
    category: 'UK Ceremonial Counties',
    prompt: 'Top 10 Largest English Ceremonial Counties by Land Area',
    items: [
      { rank: 1, name: 'North Yorkshire', aliases: ['north yorks', 'n yorkshire'], detail: '8,654 km²', rarityMultiplier: 1.0 },
      { rank: 2, name: 'Lincolnshire', aliases: ['lincs'], detail: '6,977 km²', rarityMultiplier: 1.2 },
      { rank: 3, name: 'Cumbria', aliases: ['lake district county'], detail: '6,768 km²', rarityMultiplier: 1.2 },
      { rank: 4, name: 'Devon', aliases: ['devonshire'], detail: '6,707 km²', rarityMultiplier: 1.3 },
      { rank: 5, name: 'Norfolk', aliases: ['norfolk county'], detail: '5,384 km²', rarityMultiplier: 1.4 },
      { rank: 6, name: 'Northumberland', aliases: ['northumbria'], detail: '5,013 km²', rarityMultiplier: 1.4 },
      { rank: 7, name: 'Somerset', aliases: ['somersetshire'], detail: '4,171 km²', rarityMultiplier: 1.5 },
      { rank: 8, name: 'Hampshire', aliases: ['hants'], detail: '3,769 km²', rarityMultiplier: 1.6 },
      { rank: 9, name: 'Kent', aliases: ['garden of england'], detail: '3,736 km²', rarityMultiplier: 1.6 },
      { rank: 10, name: 'Suffolk', aliases: ['east anglia suffolk'], detail: '3,801 km²', rarityMultiplier: 1.6 },
    ],
    explanation: 'North Yorkshire is larger than several sovereign nations, mostly populated by dry stone walls, sheep, and people politely explaining why God\'s Own Country is superior.',
    source: 'Lieutenancies Act & Ordnance Survey'
  }
];

/* ==========================================================================
   2. PUT UP OR SHUT UP (Bidding & Verification)
   ========================================================================== */
export const putUpOrShutUpChallenges: PutUpOrShutUpChallenge[] = [
  {
    id: 'bid-pms-postwar',
    roundType: 'PUT_UP_OR_SHUT_UP',
    category: 'British Political History',
    prompt: 'How many UK Prime Ministers since 1945 can you name?',
    targetUnit: 'Post-war Prime Ministers',
    validAnswers: [
      { name: 'Clement Attlee', aliases: ['attlee'] },
      { name: 'Winston Churchill', aliases: ['churchill'] },
      { name: 'Anthony Eden', aliases: ['eden'] },
      { name: 'Harold Macmillan', aliases: ['macmillan', 'supermac'] },
      { name: 'Alec Douglas-Home', aliases: ['douglas home', 'home', 'douglas-home'] },
      { name: 'Harold Wilson', aliases: ['wilson'] },
      { name: 'Edward Heath', aliases: ['heath', 'ted heath'] },
      { name: 'James Callaghan', aliases: ['callaghan', 'sunny jim'] },
      { name: 'Margaret Thatcher', aliases: ['thatcher', 'iron lady'] },
      { name: 'John Major', aliases: ['major'] },
      { name: 'Tony Blair', aliases: ['blair'] },
      { name: 'Gordon Brown', aliases: ['brown'] },
      { name: 'David Cameron', aliases: ['cameron'] },
      { name: 'Theresa May', aliases: ['may'] },
      { name: 'Boris Johnson', aliases: ['johnson', 'boris'] },
      { name: 'Liz Truss', aliases: ['truss', 'lettuce'] },
      { name: 'Rishi Sunak', aliases: ['sunak'] },
      { name: 'Keir Starmer', aliases: ['starmer'] },
    ],
    explanation: 'There have been 18 Prime Ministers since Clement Attlee took power in July 1945. Liz Truss served for 49 days, outlasted by a supermarket iceberg lettuce.',
    source: 'Number 10 Downing Street Official Archives'
  },
  {
    id: 'bid-tube-lines',
    roundType: 'PUT_UP_OR_SHUT_UP',
    category: 'London Transport',
    prompt: 'How many standard London Underground Lines can you name?',
    targetUnit: 'Underground Lines',
    validAnswers: [
      { name: 'Bakerloo Line', aliases: ['bakerloo'] },
      { name: 'Central Line', aliases: ['central'] },
      { name: 'Circle Line', aliases: ['circle'] },
      { name: 'District Line', aliases: ['district'] },
      { name: 'Hammersmith & City Line', aliases: ['hammersmith', 'hammersmith and city', 'hammersmith & city'] },
      { name: 'Jubilee Line', aliases: ['jubilee'] },
      { name: 'Metropolitan Line', aliases: ['metropolitan', 'met'] },
      { name: 'Northern Line', aliases: ['northern'] },
      { name: 'Piccadilly Line', aliases: ['piccadilly'] },
      { name: 'Victoria Line', aliases: ['victoria'] },
      { name: 'Waterloo & City Line', aliases: ['waterloo and city', 'waterloo & city', 'the drain'] },
      { name: 'Elizabeth Line', aliases: ['elizabeth', 'crossrail'] },
    ],
    explanation: 'There are 11 official Underground tube lines (plus the Elizabeth Line and Overground network). Harry Beck’s iconic 1931 electrical-circuit schematic map remains one of Britain’s proudest design exports.',
    source: 'Transport for London (TfL)'
  },
  {
    id: 'bid-national-parks',
    roundType: 'PUT_UP_OR_SHUT_UP',
    category: 'British Landscapes & Parks',
    prompt: 'How many of the 15 National Parks in the UK can you name?',
    targetUnit: 'UK National Parks',
    validAnswers: [
      { name: 'Peak District', aliases: ['peak district', 'the peaks'] },
      { name: 'Lake District', aliases: ['lake district', 'the lakes'] },
      { name: 'Dartmoor', aliases: ['dartmoor'] },
      { name: 'North York Moors', aliases: ['north york moors', 'north yorkshire moors'] },
      { name: 'Yorkshire Dales', aliases: ['yorkshire dales', 'the dales'] },
      { name: 'Exmoor', aliases: ['exmoor'] },
      { name: 'Northumberland', aliases: ['northumberland'] },
      { name: 'Brecon Beacons / Bannau Brycheiniog', aliases: ['brecon beacons', 'bannau brycheiniog', 'brecon'] },
      { name: 'Snowdonia / Eryri', aliases: ['snowdonia', 'eryri'] },
      { name: 'Pembrokeshire Coast', aliases: ['pembrokeshire', 'pembrokeshire coast'] },
      { name: 'Broads', aliases: ['the broads', 'norfolk broads'] },
      { name: 'New Forest', aliases: ['new forest'] },
      { name: 'South Downs', aliases: ['south downs'] },
      { name: 'Loch Lomond and The Trossachs', aliases: ['loch lomond', 'the trossachs', 'trossachs'] },
      { name: 'Cairngorms', aliases: ['cairngorms', 'cairngorm'] },
    ],
    explanation: '10 in England, 3 in Wales, and 2 in Scotland. The Peak District was the first designated in 1951 following the 1932 mass trespass on Kinder Scout.',
    source: 'National Parks UK'
  },
  {
    id: 'bid-cathedral-cities',
    roundType: 'PUT_UP_OR_SHUT_UP',
    category: 'British Architecture & Religion',
    prompt: 'How many UK cities with medieval/Anglican cathedrals can you name?',
    targetUnit: 'Cathedral Cities',
    validAnswers: [
      { name: 'Canterbury', aliases: ['canterbury'] },
      { name: 'York', aliases: ['york minster', 'york'] },
      { name: 'Salisbury', aliases: ['salisbury'] },
      { name: 'Durham', aliases: ['durham'] },
      { name: 'Winchester', aliases: ['winchester'] },
      { name: 'Ely', aliases: ['ely'] },
      { name: 'Lincoln', aliases: ['lincoln'] },
      { name: 'Wells', aliases: ['wells'] },
      { name: 'Gloucester', aliases: ['gloucester'] },
      { name: 'Peterborough', aliases: ['peterborough'] },
      { name: 'Norwich', aliases: ['norwich'] },
      { name: 'Chester', aliases: ['chester'] },
      { name: 'Exeter', aliases: ['exeter'] },
      { name: 'Ripon', aliases: ['ripon'] },
      { name: 'St Albans', aliases: ['st albans', 'saint albans'] },
      { name: 'Coventry', aliases: ['coventry'] },
      { name: 'Chichester', aliases: ['chichester'] },
      { name: 'Carlisle', aliases: ['carlisle'] },
      { name: 'Hereford', aliases: ['hereford'] },
      { name: 'Worcester', aliases: ['worcester'] },
      { name: 'St Davids', aliases: ['st davids', 'tyddewi'] },
    ],
    explanation: 'England and Wales house magnificent medieval cathedral foundations. St Davids in Pembrokeshire has a population of just 1,800, making it Britain\'s smallest cathedral city.',
    source: 'Association of English Cathedrals'
  }
];

/* ==========================================================================
   3. THE LIST (Push Your Luck Chain)
   ========================================================================== */
export const theListChallenges: TheListChallenge[] = [
  {
    id: 'list-counties-shire',
    roundType: 'THE_LIST',
    category: 'British Geography & Administration',
    prompt: 'Name English ceremonial counties that officially end in "-shire"',
    validAnswers: [
      { name: 'Bedfordshire', aliases: ['bedfordshire', 'beds'] },
      { name: 'Berkshire', aliases: ['berkshire', 'berks'] },
      { name: 'Buckinghamshire', aliases: ['buckinghamshire', 'bucks'] },
      { name: 'Cambridgeshire', aliases: ['cambridgeshire', 'cambs'] },
      { name: 'Cheshire', aliases: ['cheshire'] },
      { name: 'Derbyshire', aliases: ['derbyshire'] },
      { name: 'Devonshire (Devon)', aliases: ['devonshire', 'devon'] },
      { name: 'Gloucestershire', aliases: ['gloucestershire', 'glos'] },
      { name: 'Hampshire', aliases: ['hampshire', 'hants'] },
      { name: 'Herefordshire', aliases: ['herefordshire'] },
      { name: 'Hertfordshire', aliases: ['hertfordshire', 'herts'] },
      { name: 'Lancashire', aliases: ['lancashire', 'lancs'] },
      { name: 'Leicestershire', aliases: ['leicestershire', 'leics'] },
      { name: 'Lincolnshire', aliases: ['lincolnshire', 'lincs'] },
      { name: 'Northamptonshire', aliases: ['northamptonshire', 'northants'] },
      { name: 'Nottinghamshire', aliases: ['nottinghamshire', 'notts'] },
      { name: 'Oxfordshire', aliases: ['oxfordshire', 'oxon'] },
      { name: 'Shropshire', aliases: ['shropshire', 'salop'] },
      { name: 'Staffordshire', aliases: ['staffordshire', 'staffs'] },
      { name: 'Warwickshire', aliases: ['warwickshire', 'warks'] },
      { name: 'Wiltshire', aliases: ['wiltshire', 'wilts'] },
      { name: 'Worcestershire', aliases: ['worcestershire', 'worcs'] },
      { name: 'Yorkshire (North/South/West/East)', aliases: ['yorkshire', 'north yorkshire', 'south yorkshire', 'west yorkshire'] },
    ],
    explanation: 'The Anglo-Saxon "scir" designated an administrative district overseen by an ealdorman and a shire-reeve (sheriff). Cornwall, Kent, and Essex stubbornly refused the suffix.',
    source: 'Ordnance Survey & Lieutenancies Act 1997'
  },
  {
    id: 'list-monarchs-long',
    roundType: 'THE_LIST',
    category: 'British Royal Lineage',
    prompt: 'Name English or British Monarchs who reigned for at least 20 continuous years',
    validAnswers: [
      { name: 'Elizabeth II', aliases: ['elizabeth ii', 'queen elizabeth ii', 'elizabeth 2'] },
      { name: 'Victoria', aliases: ['queen victoria', 'victoria'] },
      { name: 'George III', aliases: ['george iii', 'king george iii', 'george 3'] },
      { name: 'James VI and I', aliases: ['james i', 'james vi', 'king james i'] },
      { name: 'Henry III', aliases: ['henry iii', 'king henry iii', 'henry 3'] },
      { name: 'Edward III', aliases: ['edward iii', 'king edward iii', 'edward 3'] },
      { name: 'Elizabeth I', aliases: ['elizabeth i', 'queen elizabeth i', 'gloriana'] },
      { name: 'Henry VI', aliases: ['henry vi', 'king henry vi'] },
      { name: 'Henry VIII', aliases: ['henry viii', 'king henry viii', 'henry 8'] },
      { name: 'Charles II', aliases: ['charles ii', 'king charles ii'] },
      { name: 'George II', aliases: ['george ii', 'king george ii'] },
      { name: 'George V', aliases: ['george v', 'king george v'] },
      { name: 'Henry II', aliases: ['henry ii', 'king henry ii'] },
      { name: 'Edward I', aliases: ['edward i', 'king edward i', 'longshanks'] },
      { name: 'Henry VII', aliases: ['henry vii', 'king henry vii'] },
      { name: 'Charles I', aliases: ['charles i', 'king charles i'] },
    ],
    explanation: 'Queen Elizabeth II topped the chart at 70 years and 214 days. Reaching 20 years in the Middle Ages was generally considered an astonishing medical miracle and military achievement.',
    source: 'Royal Household Archives (Buckingham Palace)'
  },
  {
    id: 'list-premier-league-winners',
    roundType: 'THE_LIST',
    category: 'British Football & Sport',
    prompt: 'Name the clubs that have won the English Premier League (since 1992)',
    validAnswers: [
      { name: 'Manchester United', aliases: ['man united', 'man utd', 'united'] },
      { name: 'Manchester City', aliases: ['man city', 'city'] },
      { name: 'Chelsea', aliases: ['chelsea fc', 'the blues'] },
      { name: 'Arsenal', aliases: ['arsenal fc', 'the gunners'] },
      { name: 'Liverpool', aliases: ['liverpool fc', 'the reds'] },
      { name: 'Blackburn Rovers', aliases: ['blackburn', 'rovers'] },
      { name: 'Leicester City', aliases: ['leicester', 'the foxes'] },
    ],
    explanation: 'In over 30 seasons of Premier League football, only 7 distinct clubs have lifted the trophy. Leicester City’s 5000-1 title victory in 2016 remains the most mathematically insolent upset in sporting history.',
    source: 'The Premier League Official Statistics'
  }
];

/* ==========================================================================
   4. WHERE IN BRITAIN? (Interactive Pin-Drop Map)
   ========================================================================== */
export const whereInBritainChallenges: WhereInBritainChallenge[] = [
  {
    id: 'map-whitby',
    roundType: 'WHERE_IN_BRITAIN',
    category: 'Historic Coastal Towns',
    prompt: 'Locate Whitby (famed for its cliff-top abbey, Dracula lore, and jet jewellery)',
    targetName: 'Whitby, North Yorkshire',
    region: 'England',
    lat: 54.4863,
    lng: -0.6133,
    mapX: 63.8, // Percentage on UK SVG map
    mapY: 41.5,
    explanation: 'Whitby Abbey stands on the East Cliff overlooking the North Sea. Bram Stoker stayed at the Royal Hotel in 1890, where he watched a Russian schooner run aground and promptly invented Count Dracula’s English landfall.',
    source: 'English Heritage & Ordnance Survey'
  },
  {
    id: 'map-ludlow',
    roundType: 'WHERE_IN_BRITAIN',
    category: 'Marches & Castles',
    prompt: 'Locate Ludlow (historic medieval market town and castle on the Welsh Marches)',
    targetName: 'Ludlow, Shropshire',
    region: 'England',
    lat: 52.3678,
    lng: -2.7188,
    mapX: 47.6,
    mapY: 60.2,
    explanation: 'Ludlow Castle was the seat of the Council of the Marches for over two centuries. Prince Arthur, Henry VIII\'s elder brother, died here in 1502, unwittingly triggering six subsequent marriages and the English Reformation.',
    source: 'Historic England'
  },
  {
    id: 'map-standrews',
    roundType: 'WHERE_IN_BRITAIN',
    category: 'Scotland & Academic Foundations',
    prompt: 'Locate St Andrews (home to Scotland’s oldest university and the Old Course)',
    targetName: 'St Andrews, Fife',
    region: 'Scotland',
    lat: 56.3398,
    lng: -2.7967,
    mapX: 49.8,
    mapY: 26.5,
    explanation: 'St Andrews in Fife has been the spiritual home of golf since the 15th century and Scotland\'s premier seat of academic severity since 1413.',
    source: 'Royal and Ancient Golf Club / Historic Environment Scotland'
  },
  {
    id: 'map-chatsworth',
    roundType: 'WHERE_IN_BRITAIN',
    category: 'Stately Homes & Peak District',
    prompt: 'Locate Chatsworth House (seat of the Duke of Devonshire in the Peak District)',
    targetName: 'Chatsworth House, Derbyshire',
    region: 'England',
    lat: 53.2275,
    lng: -1.6114,
    mapX: 55.4,
    mapY: 52.8,
    explanation: 'Often cited as the inspiration for Pemberley in Jane Austen’s Pride and Prejudice. The 1st Duke transformed it in 1687 into one of Europe’s grandest private baroque palaces.',
    source: 'Chatsworth House Trust'
  },
  {
    id: 'map-bosworth',
    roundType: 'WHERE_IN_BRITAIN',
    category: 'Battlefields & Plantagenets',
    prompt: 'Locate the Battle of Bosworth Field (where Richard III lost his crown to Henry Tudor)',
    targetName: 'Bosworth Field, Leicestershire',
    region: 'England',
    lat: 52.5975,
    lng: -1.4111,
    mapX: 57.2,
    mapY: 58.4,
    explanation: 'On 22 August 1485, Richard III became the last English monarch to die in battle. He spent the next 527 years beneath a council car park in Leicester until historians dug him up in 2012.',
    source: 'Battlefields Trust & University of Leicester'
  },
  {
    id: 'map-snowdon',
    roundType: 'WHERE_IN_BRITAIN',
    category: 'Welsh Mountains',
    prompt: 'Locate Yr Wyddfa / Mount Snowdon (the highest peak in Wales)',
    targetName: 'Yr Wyddfa (Snowdon), Gwynedd',
    region: 'Wales',
    lat: 53.0685,
    lng: -4.0763,
    mapX: 38.5,
    mapY: 53.5,
    explanation: 'Standing at 1,085 metres, Yr Wyddfa is the highest peak in the British Isles south of the Scottish Highlands. It features a Victorian rack-and-pinion railway for tourists averse to cardiovascular effort.',
    source: 'Eryri National Park Authority'
  },
  {
    id: 'map-bamburgh',
    roundType: 'WHERE_IN_BRITAIN',
    category: 'Castles & Northumbria',
    prompt: 'Locate Bamburgh Castle (towering coastal fortress of Northumbrian kings)',
    targetName: 'Bamburgh Castle, Northumberland',
    region: 'England',
    lat: 55.6090,
    lng: -1.7099,
    mapX: 56.5,
    mapY: 31.8,
    explanation: 'Perched on a basalt crag of the Whin Sill, Bamburgh was the capital of the Anglo-Saxon Kingdom of Bernicia. In 1464 during the Wars of the Roses, it became the first castle in England defeated by artillery.',
    source: 'Bamburgh Castle Archives'
  },
  {
    id: 'map-arran',
    roundType: 'WHERE_IN_BRITAIN',
    category: 'Scottish Islands',
    prompt: 'Locate the Isle of Arran ("Scotland in Miniature" in the Firth of Clyde)',
    targetName: 'Isle of Arran, North Ayrshire',
    region: 'Scotland',
    lat: 55.5800,
    lng: -5.2100,
    mapX: 34.2,
    mapY: 32.5,
    explanation: 'Divided into rugged mountainous Highlands in the north and rolling pasture Lowlands in the south by the Highland Boundary Fault, Arran is Britain’s ultimate geological microcosm.',
    source: 'VisitScotland'
  },
  {
    id: 'map-giants-causeway',
    roundType: 'WHERE_IN_BRITAIN',
    category: 'Northern Ireland & Geology',
    prompt: 'Locate the Giant’s Causeway (40,000 interlocking basalt columns in County Antrim)',
    targetName: 'Giant’s Causeway, County Antrim',
    region: 'Northern Ireland',
    lat: 55.2408,
    lng: -6.5116,
    mapX: 25.2,
    mapY: 34.8,
    explanation: 'Formed 60 million years ago by intense volcanic fissure eruptions. Mythological accounts insist the giant Fionn mac Cumhaill built it to walk across to Scotland to fight Benandonner.',
    source: 'National Trust Northern Ireland'
  },
  {
    id: 'map-stonehenge',
    roundType: 'WHERE_IN_BRITAIN',
    category: 'Prehistoric Monuments',
    prompt: 'Locate Stonehenge (prehistoric megalithic monument on Salisbury Plain)',
    targetName: 'Stonehenge, Wiltshire',
    region: 'England',
    lat: 51.1789,
    lng: -1.8262,
    mapX: 52.8,
    mapY: 71.2,
    explanation: 'Constructed from 3000 BC to 2000 BC, the sarsen stones weigh up to 25 tonnes while the bluestones were transported over 140 miles from the Preseli Hills in Wales without the benefit of diesel forklifts.',
    source: 'English Heritage'
  }
];

/* ==========================================================================
   5. CLOSEST WINS / NUMERICAL ESTIMATE
   ========================================================================== */
export const closestWinsChallenges: ClosestWinsChallenge[] = [
  {
    id: 'est-blackpool-tower',
    roundType: 'CLOSEST_WINS',
    category: 'British Landmarks & Victorian Engineering',
    prompt: 'How tall is the Blackpool Tower in metres (from ground to flagpole)?',
    correctValue: 158,
    unit: 'metres',
    unitSuffix: ' m',
    toleranceScale: 80,
    explanation: 'Blackpool Tower stands at exactly 158.1 metres (518 ft 9 in). Opened in 1894, it was inspired by the Eiffel Tower after the Mayor of Blackpool, John Bickerstaffe, visited Paris and decided Lancashire deserved its own giant iron colossus.',
    source: 'Blackpool Council Architecture Records'
  },
  {
    id: 'est-thames-length',
    roundType: 'CLOSEST_WINS',
    category: 'UK Physical Geography',
    prompt: 'What is the total length of the River Thames in miles (from source to sea)?',
    correctValue: 215,
    unit: 'miles',
    unitSuffix: ' miles',
    toleranceScale: 100,
    explanation: 'The River Thames runs for 215 miles (346 km) from Thames Head in Gloucestershire to the Thames Estuary at Southend-on-Sea, passing through 45 lock systems along the way.',
    source: 'Port of London Authority & Environment Agency'
  },
  {
    id: 'est-buckingham-palace-rooms',
    roundType: 'CLOSEST_WINS',
    category: 'Royal Palaces & Architecture',
    prompt: 'How many rooms are there inside Buckingham Palace?',
    correctValue: 775,
    unit: 'rooms',
    unitSuffix: ' rooms',
    toleranceScale: 350,
    explanation: 'Buckingham Palace contains 775 rooms: including 19 State rooms, 52 Principal bedrooms, 188 staff bedrooms, 92 offices, and 78 bathrooms. Vacuuming the corridors requires heroic institutional stamina.',
    source: 'The Royal Collection Trust'
  },
  {
    id: 'est-forth-bridge-year',
    roundType: 'CLOSEST_WINS',
    category: 'Scottish Industrial Heritage',
    prompt: 'In what year was the cantilever railway Forth Bridge officially opened?',
    correctValue: 1890,
    unit: 'year',
    toleranceScale: 30,
    explanation: 'The Forth Railway Bridge opened on 4 March 1890 by the Prince of Wales. Its 53,000 tonnes of Siemens-Martin steel spanned the Firth of Forth with unprecedented cantilever strength.',
    source: 'Network Rail & UNESCO World Heritage'
  },
  {
    id: 'est-big-ben-bell-weight',
    roundType: 'CLOSEST_WINS',
    category: 'Westminster Clock Tower',
    prompt: 'How much does the Great Bell ("Big Ben") in the Elizabeth Tower weigh, in metric tonnes?',
    correctValue: 13.7,
    unit: 'tonnes',
    unitSuffix: ' tonnes',
    toleranceScale: 10,
    explanation: 'Cast at the Whitechapel Bell Foundry in 1858, Big Ben weighs 13.76 tonnes (13,760 kg). It cracked shortly after installation because the hammer was excessively heavy, creating its signature distinctive tonal imperfection.',
    source: 'UK Parliament Estates Archives'
  },
  {
    id: 'est-hadrians-wall-length',
    roundType: 'CLOSEST_WINS',
    category: 'Roman Britain',
    prompt: 'How long is Hadrian\'s Wall in Roman miles (or statute miles)?',
    correctValue: 73,
    unit: 'statute miles',
    unitSuffix: ' miles (80 Roman miles)',
    toleranceScale: 35,
    explanation: 'Hadrian’s Wall ran 73 modern miles (80 Roman miles / 117 km) from Wallsend on the River Tyne to Bowness-on-Solway, marking the northernmost frontier of the Roman Empire.',
    source: 'English Heritage'
  },
  {
    id: 'est-victoria-death-year',
    roundType: 'CLOSEST_WINS',
    category: 'Victorian History',
    prompt: 'In what year did Queen Victoria die at Osborne House?',
    correctValue: 1901,
    unit: 'year',
    toleranceScale: 25,
    explanation: 'Queen Victoria died on 22 January 1901 aged 81, having reigned for 63 years and seven months. Her death concluded the Victorian era and inaugurated the Edwardian decade.',
    source: 'Royal Archives, Windsor Castle'
  }
];

/* ==========================================================================
   6. RANK IT (Sequence Ordering Challenges)
   ========================================================================== */
export const rankItChallenges: RankItChallenge[] = [
  {
    id: 'rank-cities-north-to-south',
    roundType: 'RANK_IT',
    category: 'British Geography',
    prompt: 'Arrange these 5 UK cities in order from NORTH to SOUTH',
    items: [
      { id: 'aberdeen', label: 'Aberdeen', correctRank: 1, detail: 'Latitude 57.15° N (North)' },
      { id: 'edinburgh', label: 'Edinburgh', correctRank: 2, detail: 'Latitude 55.95° N' },
      { id: 'newcastle', label: 'Newcastle upon Tyne', correctRank: 3, detail: 'Latitude 54.97° N' },
      { id: 'manchester', label: 'Manchester', correctRank: 4, detail: 'Latitude 53.48° N' },
      { id: 'bristol', label: 'Bristol', correctRank: 5, detail: 'Latitude 51.45° N (South)' },
    ],
    explanation: 'From the Granite City in Aberdeenshire down through the Scottish capital, Tyneside, the industrial North West, and arriving at the West Country.',
    source: 'Ordnance Survey Gazetteer'
  },
  {
    id: 'rank-monarchs-accession',
    roundType: 'RANK_IT',
    category: 'English & British Monarchy',
    prompt: 'Order these British monarchs by their date of ACCESSION (earliest to latest)',
    items: [
      { id: 'henry-viii', label: 'Henry VIII', correctRank: 1, detail: 'Acceded 1509' },
      { id: 'elizabeth-i', label: 'Elizabeth I', correctRank: 2, detail: 'Acceded 1558' },
      { id: 'charles-i', label: 'Charles I', correctRank: 3, detail: 'Acceded 1625' },
      { id: 'george-iii', label: 'George III', correctRank: 4, detail: 'Acceded 1760' },
      { id: 'victoria', label: 'Queen Victoria', correctRank: 5, detail: 'Acceded 1837' },
    ],
    explanation: 'Tudor patriarch (1509), Elizabethan golden age (1558), Stuart civil war martyr/tyrant (1625), Hanoverian monarch (1760), and the Empress of India (1837).',
    source: 'Royal Household Chronology'
  },
  {
    id: 'rank-mountain-peaks',
    roundType: 'RANK_IT',
    category: 'UK Mountain Summits',
    prompt: 'Rank these 4 British mountain summits from HIGHEST to LOWEST elevation',
    items: [
      { id: 'ben-nevis', label: 'Ben Nevis (Scotland)', correctRank: 1, detail: '1,345 m (Highest)' },
      { id: 'snowdon', label: 'Yr Wyddfa / Snowdon (Wales)', correctRank: 2, detail: '1,085 m' },
      { id: 'scafell-pike', label: 'Scafell Pike (England)', correctRank: 3, detail: '978 m' },
      { id: 'slieve-donard', label: 'Slieve Donard (N. Ireland)', correctRank: 4, detail: '850 m (Lowest)' },
    ],
    explanation: 'The National Three Peaks (plus Northern Ireland’s Mourne titan). Scotland takes the top spot by a country mile, followed by Gwynedd, the Lake District, and County Down.',
    source: 'Ordnance Survey Triangulation Survey'
  },
  {
    id: 'rank-historical-events',
    roundType: 'RANK_IT',
    category: 'British Historical Milestones',
    prompt: 'Arrange these major British historical events CHRONOLOGICALLY (oldest to most recent)',
    items: [
      { id: 'battle-hastings', label: 'Battle of Hastings', correctRank: 1, detail: '1066 AD' },
      { id: 'magna-carta', label: 'Sealing of Magna Carta', correctRank: 2, detail: '1215 AD' },
      { id: 'great-fire', label: 'The Great Fire of London', correctRank: 3, detail: '1666 AD' },
      { id: 'battle-waterloo', label: 'Battle of Waterloo', correctRank: 4, detail: '1815 AD' },
      { id: 'battle-britain', label: 'Battle of Britain', correctRank: 5, detail: '1940 AD' },
    ],
    explanation: 'From William the Conqueror’s arrow-heavy invasion, to King John’s reluctant treaty, Thomas Farriner’s bakery blaze, the Duke of Wellington’s triumph over Napoleon, and the RAF’s finest hour.',
    source: 'The National Archives (Kew)'
  }
];

/* ==========================================================================
   7. IMAGE REVEAL (Progressive Unmasking of Iconic UK Assets)
   ========================================================================== */
export const imageRevealChallenges: ImageRevealChallenge[] = [
  {
    id: 'img-rosetta-stone',
    roundType: 'IMAGE_REVEAL',
    category: 'Museum Artifacts & British History',
    prompt: 'Identify this world-famous British Museum granodiorite stele that unlocked Egyptian hieroglyphics',
    subjectName: 'The Rosetta Stone',
    aliases: ['rosetta stone', 'rosetta', 'the rosetta stone'],
    options: ['The Rosetta Stone', 'The Elgin Marbles', 'The Cyrus Cylinder', 'The Sutton Hoo Helmet'],
    imageUrl: '/assets/reconnaissance/rosetta-stone.webp',
    svgGraphicType: 'artifact',
    visualHint: 'Carved in 196 BC with three scripts: Ancient Egyptian hieroglyphs, Demotic script, and Ancient Greek.',
    explanation: 'Discovered near Memphis in 1799 and held at the British Museum since 1802. Thomas Young and Jean-François Champollion deciphered it, revealing thousands of years of lost dynastic Egyptian literature.',
    source: 'The British Museum Department of Ancient Egypt'
  },
  {
    id: 'img-angel-north',
    roundType: 'IMAGE_REVEAL',
    category: 'Public Art & Engineering',
    prompt: 'Identify this iconic 20-metre-tall public steel sculpture by Antony Gormley in Gateshead',
    subjectName: 'The Angel of the North',
    aliases: ['angel of the north', 'the angel of the north', 'angel of north'],
    options: ['The Angel of the North', 'The Kelpies', 'ArcelorMittal Orbit', 'Another Place'],
    imageUrl: '/assets/reconnaissance/angel-of-the-north.webp',
    svgGraphicType: 'landmark',
    visualHint: 'Constructed from weathering steel with a 54-metre wingspan, designed to withstand 100 mph gales.',
    explanation: 'Erected in 1998 on the site of the former Teams Colliery. Gormley angled the wings 3.5 degrees forward to evoke a sense of embrace, overlooking 90,000 drivers daily on the A1.',
    source: 'Gateshead Council Arts & Heritage'
  },
  {
    id: 'img-glenfinnan-viaduct',
    roundType: 'IMAGE_REVEAL',
    category: 'Scottish Architecture & Cinema',
    prompt: 'Identify this sweeping 21-arch concrete railway viaduct in the West Highlands of Scotland',
    subjectName: 'Glenfinnan Viaduct',
    aliases: ['glenfinnan viaduct', 'glenfinnan', 'harry potter bridge'],
    options: ['Glenfinnan Viaduct', 'Forth Bridge', 'Ribblehead Viaduct', 'Tay Bridge'],
    imageUrl: '/assets/reconnaissance/glenfinnan-viaduct.webp',
    svgGraphicType: 'structure',
    visualHint: 'Built between 1897 and 1901 by Robert McAlpine, carrying the West Highland Line across the River Finnan.',
    explanation: 'Built entirely of mass concrete without metal reinforcement by "Concrete Bob" McAlpine. It entered global pop-culture lore as the Hogwarts Express crossing route in the Harry Potter films.',
    source: 'Historic Environment Scotland & Network Rail'
  },
  {
    id: 'img-tower-bridge',
    roundType: 'IMAGE_REVEAL',
    category: 'Victorian Civil Engineering',
    prompt: 'Identify this iconic combined bascule and suspension bridge spanning the River Thames',
    subjectName: 'Tower Bridge',
    aliases: ['tower bridge', 'london tower bridge'],
    options: ['Tower Bridge', 'London Bridge', 'Blackfriars Bridge', 'Westminster Bridge'],
    imageUrl: '/assets/reconnaissance/tower-bridge.webp',
    svgGraphicType: 'landmark',
    visualHint: 'Often confused by American tourists with its downstream neighbour London Bridge.',
    explanation: 'Completed in 1894, Tower Bridge used hydraulic steam power to raise its massive bascules in just one minute. American entrepreneur Robert P. McCulloch famously bought London Bridge in 1968, though urban legend insists he thought he bought this one.',
    source: 'City of London Corporation'
  }
];

/* ==========================================================================
   8. STOP THE SCORE (Confidence Risk Assessment Engine)
   ========================================================================== */
export const stopTheScoreChallenges: StopTheScoreChallenge[] = [
  {
    id: 'sts-swans',
    roundType: 'STOP_THE_SCORE',
    category: 'Eccentric Royal Prerogatives',
    prompt: 'Under ancient British royal prerogative dating back to the 12th century, the British Monarch retains ownership of which species of wild bird on open waters?',
    options: [
      'Unmarked Mute Swans',
      'Red Kites in royal parks',
      'Atlantic Puffins on crown cliffs',
      'Wild Peregrine Falcons'
    ],
    correctIndex: 0,
    explanation: 'The Crown retains ownership of all unmarked mute swans swimming in open waters. The annual "Swan Upping" census along the River Thames by the Royal Swan Marker has taken place since the 12th century.',
    source: 'The Royal Household / Worshipful Company of Vintners'
  },
  {
    id: 'sts-tea-cups',
    roundType: 'STOP_THE_SCORE',
    category: 'British Domestic Habits',
    prompt: 'According to the UK Tea and Infusions Association, approximately how many cups of tea are drunk across the United Kingdom EVERY SINGLE DAY?',
    options: [
      '100 million cups',
      '35 million cups',
      '210 million cups',
      '12 million cups'
    ],
    correctIndex: 0,
    explanation: 'Around 100 million cups daily, adding up to nearly 36 billion cups a year. The British National Grid even schedules power reserves for the "TV pickup" surges caused by millions of simultaneous boiling kettles.',
    source: 'UK Tea & Infusions Association / National Grid ESO'
  },
  {
    id: 'sts-postcode',
    roundType: 'STOP_THE_SCORE',
    category: 'British Postal System',
    prompt: 'Which British city was selected in 1959 to trial the world’s first modern alphanumeric postal code system?',
    options: [
      'Norwich',
      'Bristol',
      'Edinburgh',
      'Coventry'
    ],
    correctIndex: 0,
    explanation: 'Norwich was chosen in October 1959 by Postmaster General Ernest Marples for the trial postcode "NOR", before the nationwide coding rollout was completed in 1974.',
    source: 'The Postal Museum (London)'
  },
  {
    id: 'sts-biscuit-tax',
    roundType: 'STOP_THE_SCORE',
    category: 'British Legal Peculiarities',
    prompt: 'Which change when stale was one factor in the 1991 VAT tribunal deciding that Jaffa Cakes had enough characteristics of cakes to be zero-rated?',
    options: [
      'They go hard when stale (biscuits go soft)',
      'They contain more than 15% fresh liquid egg',
      'They can be sliced into twelve equal wedges',
      'Their batter rises via yeast fermentation'
    ],
    correctIndex: 0,
    explanation: 'Jaffa Cakes become hard when stale, whereas biscuits generally become soft. The tribunal considered this alongside their ingredients, texture, size, packaging and other characteristics before accepting them as cakes.',
    source: 'HMRC internal manual VFOOD6260; United Biscuits (UK) Ltd (No. 2) v Commissioners of Customs and Excise [1991] BVC 818 (LON/91/0160)'
  },
  {
    id: 'sts-sandwich-earl',
    roundType: 'STOP_THE_SCORE',
    category: 'British Culinary Folklore',
    prompt: 'According to the traditional account of the sandwich’s name, John Montagu ate meat between bread so that he could continue what activity?',
    options: [
      'Leaving his 24-hour gambling card table',
      'Dropping ink onto naval admiralty maps',
      'Using French silver cutlery at dinner',
      'Interrupting his parliamentary speech'
    ],
    correctIndex: 0,
    explanation: 'A widely repeated account says the 4th Earl of Sandwich ate this way without leaving the gaming table. Contemporary evidence confirms the name was in use by 1762, but the gambling origin remains a traditional attribution rather than a settled fact.',
    source: 'Davidson, Alan, The Oxford Companion to Food, 3rd ed., edited by Tom Jaine, Oxford University Press, 2014, entry “sandwich”'
  }
];

export const allChallenges: Challenge[] = [
  ...top10Challenges,
  ...putUpOrShutUpChallenges,
  ...theListChallenges,
  ...whereInBritainChallenges,
  ...closestWinsChallenges,
  ...rankItChallenges,
  ...imageRevealChallenges,
  ...stopTheScoreChallenges,
  ...supplementalChallenges,
  ...expansionChallenges,
  ...misfiledRecordsChallenges,
  ...redactedRecordsChallenges,
  ...commonDossierChallenges,
  ...missingMinutesChallenges,
  ...publicEnquiryChallenges,
  ...chainOfCommandChallenges,
  ...complaintsDeskChallenges,
  ...seatingCommitteeChallenges,
  ...dispatchBoxChallenges
];
