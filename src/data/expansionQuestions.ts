import type {
  Challenge,
  ClosestWinsChallenge,
  ImageRevealChallenge,
  PutUpOrShutUpChallenge,
  RankItChallenge,
  StopTheScoreChallenge,
  TheListChallenge,
  Top10Challenge,
  WhereInBritainChallenge,
} from '../types';

type Answer = { name: string; aliases: string[] };
const answer = (name: string, ...aliases: string[]): Answer => ({ name, aliases });
const cleanAlias = (name: string) => name.toLowerCase().replace(/[’']/g, '').replace(/^the /, '');
const EXTRA_ALIASES: Record<string, string[]> = {
  'Bannau Brycheiniog': ['Brecon Beacons'],
  'Eryri': ['Snowdonia'],
  'Loch Lomond and the Trossachs': ['Loch Lomond'],
  'Regent’s Park and Primrose Hill': ['Regents Park', 'Regent Park', 'Primrose Hill'],
};
const answers = (names: string[]) => names.map(name => answer(name, cleanAlias(name), ...(EXTRA_ALIASES[name] ?? [])));

type Register = { id: string; category: string; prompt: string; entries: string[]; source: string };
const top10 = ({ id, category, prompt, entries, source }: Register): Top10Challenge => ({
  id: `top10-exp-${id}`,
  roundType: 'TOP_10',
  category,
  prompt,
  items: entries.map((name, index) => ({
    rank: index + 1,
    name,
    aliases: [cleanAlias(name)],
    detail: `Certified register position ${index + 1}`,
    rarityMultiplier: 1 + index * .07,
  })),
  explanation: `The certified sequence is ${entries.join(' • ')}.`,
  source,
});

const BOND_FIRST_TEN = ['Dr. No','From Russia with Love','Goldfinger','Thunderball','You Only Live Twice',"On Her Majesty’s Secret Service",'Diamonds Are Forever','Live and Let Die','The Man with the Golden Gun','The Spy Who Loved Me'];
const NORMAN_TO_PLANTAGENET = ['William I','William II','Henry I','Stephen','Henry II','Richard I','John','Henry III','Edward I','Edward II'];
const DICKENS_FIRST_TEN = ['The Pickwick Papers','Oliver Twist','Nicholas Nickleby','The Old Curiosity Shop','Barnaby Rudge','Martin Chuzzlewit','Dombey and Son','David Copperfield','Bleak House','Hard Times'];
const SCOTTISH_ISLANDS = ['Lewis and Harris','Skye','Mainland, Shetland','Mull','Islay','Mainland, Orkney','Arran','Jura','South Uist','North Uist'];
const ENGLISH_PEAKS = ['Scafell Pike','Scafell','Helvellyn','Ill Crag','Broad Crag','Skiddaw','Great End','Bowfell','Great Gable','Cross Fell'];
const FIRST_FA_CUP_WINNERS = ['Wanderers','Oxford University','Royal Engineers','Old Etonians','Clapham Rovers','Old Carthusians','Blackburn Olympic','Blackburn Rovers','Aston Villa','West Bromwich Albion'];
const LONDON_BOROUGHS_FIRST_TEN = ['Barking and Dagenham','Barnet','Bexley','Brent','Bromley','Camden','Croydon','Ealing','Enfield','Greenwich'];
const SHAKESPEARE_HISTORIES = ['King John','Richard II','Henry IV, Part 1','Henry IV, Part 2','Henry V','Henry VI, Part 1','Henry VI, Part 2','Henry VI, Part 3','Richard III','Henry VIII'];
const SAVOY_FIRST_TEN = ['Trial by Jury','The Sorcerer','H.M.S. Pinafore','The Pirates of Penzance','Patience','Iolanthe','Princess Ida','The Mikado','Ruddigore','The Yeomen of the Guard'];
const BEATLES_FIRST_TEN = ['Please Please Me','With the Beatles',"A Hard Day’s Night",'Beatles for Sale','Help!','Rubber Soul','Revolver',"Sgt. Pepper’s Lonely Hearts Club Band",'The Beatles','Yellow Submarine'];

export const expansionTop10: Top10Challenge[] = [
  { id:'bond-films',category:'British Cinema',prompt:'The first ten official Eon James Bond films, in UK release order',entries:BOND_FIRST_TEN,source:'British Film Institute, James Bond filmography' },
  { id:'post-conquest-monarchs',category:'Royal History',prompt:'The first ten English monarchs after the Norman Conquest, by accession',entries:NORMAN_TO_PLANTAGENET,source:'The Royal Family, Kings and Queens chronology' },
  { id:'dickens-novels',category:'Literature',prompt:'The first ten Charles Dickens novels, by initial publication',entries:DICKENS_FIRST_TEN,source:'British Library, Charles Dickens bibliography' },
  { id:'scottish-islands',category:'Scottish Geography',prompt:'The ten largest Scottish islands by land area',entries:SCOTTISH_ISLANDS,source:'National Records of Scotland, Inhabited Islands analytical table' },
  { id:'english-peaks',category:'English Geography',prompt:'The ten highest mountain summits in England',entries:ENGLISH_PEAKS,source:'Ordnance Survey, highest mountains in England' },
  { id:'fa-cup-winners',category:'Football History',prompt:'The first ten different clubs to win the FA Cup',entries:FIRST_FA_CUP_WINNERS,source:'The Football Association, FA Cup roll of honour' },
  { id:'london-boroughs',category:'London',prompt:'The first ten London boroughs in alphabetical register order',entries:LONDON_BOROUGHS_FIRST_TEN,source:'London Councils, borough directory' },
  { id:'shakespeare-histories',category:'Literature',prompt:'Ten Shakespeare English history plays in their subjects’ chronological order',entries:SHAKESPEARE_HISTORIES,source:'Shakespeare Birthplace Trust, histories catalogue' },
  { id:'savoy-operas',category:'Theatre and Music',prompt:'The first ten Gilbert and Sullivan operas after Thespis, by première',entries:SAVOY_FIRST_TEN,source:'The Gilbert and Sullivan Society, opera chronology' },
  { id:'beatles-albums',category:'British Music',prompt:'The first ten core Beatles studio albums in UK release order',entries:BEATLES_FIRST_TEN,source:'British Library, The Beatles collection and discography' },
].map(top10);

const ENGLISH_REGIONS = ['North East','North West','Yorkshire and the Humber','East Midlands','West Midlands','East of England','London','South East','South West'];
const LONDON_BOROUGHS = ['Barking and Dagenham','Barnet','Bexley','Brent','Bromley','Camden','Croydon','Ealing','Enfield','Greenwich','Hackney','Hammersmith and Fulham','Haringey','Harrow','Havering','Hillingdon','Hounslow','Islington','Kensington and Chelsea','Kingston upon Thames','Lambeth','Lewisham','Merton','Newham','Redbridge','Richmond upon Thames','Southwark','Sutton','Tower Hamlets','Waltham Forest','Wandsworth','Westminster'];
const DICKENS_NOVELS = [...DICKENS_FIRST_TEN,'Little Dorrit','A Tale of Two Cities','Great Expectations','Our Mutual Friend','The Mystery of Edwin Drood'];
const BOND_FILMS = [...BOND_FIRST_TEN,'Moonraker','For Your Eyes Only','Octopussy','A View to a Kill','The Living Daylights','Licence to Kill','GoldenEye','Tomorrow Never Dies','The World Is Not Enough','Die Another Day','Casino Royale','Quantum of Solace','Skyfall','Spectre','No Time to Die'];
const SAVOY_OPERAS = [...SAVOY_FIRST_TEN,'The Gondoliers','Utopia, Limited','The Grand Duke'];
const ROYAL_PARKS = ['Bushy Park','Green Park','Greenwich Park','Hyde Park','Kensington Gardens',"Regent’s Park and Primrose Hill",'Richmond Park',"St James’s Park"];
const RUSSELL_GROUP = ['University of Birmingham','University of Bristol','University of Cambridge','Cardiff University','Durham University','University of Edinburgh','University of Exeter','University of Glasgow','Imperial College London',"King’s College London",'University of Leeds','University of Liverpool','London School of Economics','University of Manchester','Newcastle University','University of Nottingham','University of Oxford',"Queen Mary University of London","Queen’s University Belfast",'University of Sheffield','University of Southampton','University College London','University of Warwick','University of York'];
const LAKE_DISTRICT_LAKES = ['Bassenthwaite Lake','Brothers Water','Buttermere','Coniston Water','Crummock Water','Derwent Water','Elter Water','Ennerdale Water','Esthwaite Water','Grasmere','Haweswater','Loweswater','Rydal Water','Thirlmere','Ullswater','Wast Water','Windermere'];
const UK_NATIONAL_PARKS = ['The Broads','Cairngorms','Dartmoor','Exmoor','Lake District','Loch Lomond and the Trossachs','New Forest','North York Moors','Northumberland','Peak District','Pembrokeshire Coast','Eryri','South Downs','Yorkshire Dales','Bannau Brycheiniog'];

const OPEN_REGISTERS: Register[] = [
  {id:'english-regions',category:'Geography',prompt:'Name official regions of England',entries:ENGLISH_REGIONS,source:'Office for National Statistics, Regions of England'},
  {id:'london-boroughs',category:'London',prompt:'Name London boroughs',entries:LONDON_BOROUGHS,source:'London Councils, borough directory'},
  {id:'dickens-novels',category:'Literature',prompt:'Name novels written by Charles Dickens',entries:DICKENS_NOVELS,source:'British Library, Charles Dickens bibliography'},
  {id:'bond-films',category:'British Cinema',prompt:'Name official Eon James Bond films',entries:BOND_FILMS,source:'British Film Institute, James Bond filmography'},
  {id:'shakespeare-histories',category:'Literature',prompt:'Name Shakespeare English history plays',entries:SHAKESPEARE_HISTORIES,source:'Shakespeare Birthplace Trust, histories catalogue'},
  {id:'savoy-operas',category:'Theatre and Music',prompt:'Name Gilbert and Sullivan operas first produced at the Opera Comique or Savoy tradition',entries:SAVOY_OPERAS,source:'The Gilbert and Sullivan Society, opera chronology'},
  {id:'royal-parks',category:'London',prompt:'Name the Royal Parks in London',entries:ROYAL_PARKS,source:'The Royal Parks, park directory'},
  {id:'russell-group',category:'Education',prompt:'Name Russell Group universities',entries:RUSSELL_GROUP,source:'Russell Group, Our universities'},
  {id:'lake-district-lakes',category:'Geography',prompt:'Name major named lakes, waters and meres in the Lake District',entries:LAKE_DISTRICT_LAKES,source:'Lake District National Park, lakes and waters'},
  {id:'uk-national-parks',category:'Protected Landscapes',prompt:'Name National Parks in England, Scotland or Wales',entries:UK_NATIONAL_PARKS,source:'National Parks UK, park directory'},
];

const makeOpenRound = <T extends PutUpOrShutUpChallenge | TheListChallenge>(register:Register, type:T['roundType']):T => ({
  id: `${type === 'THE_LIST' ? 'list' : 'bid'}-exp-${register.id}`,
  roundType: type,
  category: register.category,
  prompt: type === 'THE_LIST' ? register.prompt.replace(/^Name /, 'Feed the pressure register with ') : register.prompt,
  ...(type === 'PUT_UP_OR_SHUT_UP' ? { targetUnit: 'valid entries' } : {}),
  validAnswers: answers(register.entries),
  explanation: `The certified register contains ${register.entries.length} entries.`,
  source: register.source,
} as T);

export const expansionBids = OPEN_REGISTERS.map(register => makeOpenRound<PutUpOrShutUpChallenge>(register, 'PUT_UP_OR_SHUT_UP'));
export const expansionLists = OPEN_REGISTERS.map(register => makeOpenRound<TheListChallenge>(register, 'THE_LIST'));

type MapEntry = [string,string,number,number,WhereInBritainChallenge['region'],string];
const MAP_ENTRIES: MapEntry[] = [
  ['durham-cathedral','Durham Cathedral',54.7733,-1.5763,'England','Durham Cathedral official visitor information'],
  ['stirling-castle','Stirling Castle',56.1238,-3.9469,'Scotland','Historic Environment Scotland, Stirling Castle'],
  ['giants-causeway',"Giant’s Causeway",55.2408,-6.5116,'Northern Ireland',"National Trust, Giant’s Causeway"],
  ['tenby','Tenby Harbour',51.6727,-4.7004,'Wales','Visit Wales, Tenby'],
  ['whitby-abbey','Whitby Abbey',54.4887,-0.6071,'England','English Heritage, Whitby Abbey'],
  ['urquhart-castle','Urquhart Castle',57.3240,-4.4420,'Scotland','Historic Environment Scotland, Urquhart Castle'],
  ['iron-bridge','The Iron Bridge, Shropshire',52.6277,-2.4850,'England','English Heritage, Iron Bridge'],
  ['royal-pavilion','Royal Pavilion, Brighton',50.8226,-0.1371,'England','Royal Pavilion and Museums Trust'],
  ['titanic-belfast','Titanic Belfast',54.6080,-5.9099,'Northern Ireland','Titanic Belfast official visitor information'],
  ['lindisfarne-castle','Lindisfarne Castle',55.6699,-1.7843,'England','National Trust, Lindisfarne Castle'],
];
export const expansionMaps: WhereInBritainChallenge[] = MAP_ENTRIES.map(([id,targetName,lat,lng,region,source]) => ({
  id:`map-exp-${id}`,roundType:'WHERE_IN_BRITAIN',category:'British Geography',prompt:`Locate ${targetName}`,targetName,region,lat,lng,mapX:50,mapY:50,
  explanation:`The certified coordinates are approximately ${lat.toFixed(3)}°, ${lng.toFixed(3)}°.`,source,
}));

type EstimateEntry = [string,string,string,number,string,number,string];
const ESTIMATES: EstimateEntry[] = [
  ['blackpool-tower','Architecture','How tall is Blackpool Tower?',158,'metres',12,'Blackpool Tower official facts'],
  ['elizabeth-tower','Architecture','How tall is Elizabeth Tower?',96,'metres',12,'UK Parliament, Elizabeth Tower facts'],
  ['shard-height','Architecture','How tall is The Shard?',309.6,'metres',10,'The Shard, building facts'],
  ['humber-span','Engineering','What is the length of the Humber Bridge main span?',1410,'metres',12,'Humber Bridge Board, bridge facts'],
  ['lovell-dish','Science','What is the diameter of the Lovell Telescope dish?',76.2,'metres',12,'Jodrell Bank Centre for Engagement'],
  ['kelpies-height','Public Art','How tall is each of The Kelpies?',30,'metres',12,'Scottish Canals, The Kelpies'],
  ['royal-albert-capacity','Culture','What is the seated capacity of the Royal Albert Hall?',5272,'seats',15,'Royal Albert Hall, auditorium facts'],
  ['forth-length','Engineering','What is the total length of the Forth Bridge?',2467,'metres',15,'Historic Environment Scotland, Forth Bridge'],
  ['clifton-span','Engineering','What is the span of Clifton Suspension Bridge?',214,'metres',12,'Clifton Suspension Bridge Trust'],
  ['yr-wyddfa-height','Geography','What is the height of Yr Wyddfa?',1085,'metres',10,'Eryri National Park and Ordnance Survey'],
];
export const expansionClosest: ClosestWinsChallenge[] = ESTIMATES.map(([id,category,prompt,correctValue,unit,toleranceScale,source]) => ({
  id:`closest-exp-${id}`,roundType:'CLOSEST_WINS',category,prompt,correctValue,unit,toleranceScale,explanation:`The certified value is ${correctValue} ${unit}.`,source,
}));

type SequenceEntry = [string,string,string,string[],string];
const SEQUENCES: SequenceEntry[] = [
  ['tudors','Royal History','Order these Tudor monarchs by accession, earliest first',['Henry VII','Henry VIII','Edward VI','Mary I','Elizabeth I'],'The Royal Family, Tudor chronology'],
  ['scientists','Science','Order these British scientists by birth, earliest first',['Isaac Newton','Michael Faraday','Charles Darwin','Alan Turing'],'Royal Society biographies'],
  ['authors','Literature','Order these British authors by birth, earliest first',['Jane Austen','Charles Dickens','Virginia Woolf','George Orwell'],'British Library author biographies'],
  ['wars','History','Order these conflicts by starting year, earliest first',['English Civil War','Napoleonic Wars','First World War','Second World War'],'Imperial War Museums, conflict timelines'],
  ['rail-landmarks','Transport','Order these transport openings, earliest first',['Stockton and Darlington Railway','Forth Bridge','Channel Tunnel','Elizabeth line'],'National Railway Museum and Transport for London histories'],
  ['architecture','Architecture','Order these structures by completion, earliest first',['Durham Cathedral','Palace of Westminster','Blackpool Tower','The Shard'],'Historic England and official building histories'],
  ['communications','Technology','Order these communication milestones, earliest first',['Electric telegraph','BBC radio broadcasting','BBC Television Service','World Wide Web'],'Science Museum Group and BBC History'],
  ['women-vote','Political History','Order these voting milestones, earliest first',['Representation of the People Act 1918','Equal Franchise Act 1928','Voting age lowered to 18','Scottish Parliament election 1999'],'UK Parliament, electoral franchise history'],
  ['olympic-britain','Sport','Order these British-hosted sporting events, earliest first',['London Olympics 1908','London Olympics 1948','London Olympics 2012','Birmingham Commonwealth Games 2022'],'Olympics and Commonwealth Games official histories'],
  ['albums','British Music','Order these albums by UK release, earliest first',['Sgt. Pepper’s Lonely Hearts Club Band','The Dark Side of the Moon','Never Mind the Bollocks','Back to Black'],'British Library and Official Charts discographies'],
];
export const expansionRank: RankItChallenge[] = SEQUENCES.map(([id,category,prompt,labels,source]) => ({
  id:`rank-exp-${id}`,roundType:'RANK_IT',category,prompt,items:labels.map((label,index)=>({id:`${id}-${index+1}`,label,correctRank:index+1,detail:`Certified position ${index+1}`})),explanation:`The certified order is ${labels.join(' → ')}.`,source,
}));

type ImageEntry = [string,string,string,string,string[],string,string,string];
const IMAGE_ENTRIES: ImageEntry[] = [
  ['white-cliffs','Natural Heritage','Identify this famous chalk coastline','White Cliffs of Dover',['Seven Sisters','Flamborough Head','Beachy Head'],'white-cliffs-of-dover.webp','White chalk faces overlook the narrowest part of the English Channel.','National Trust, White Cliffs of Dover'],
  ['blackpool-tower','Architecture','Identify this seaside iron tower','Blackpool Tower',['Eiffel Tower','Radio City Tower','Spinnaker Tower'],'blackpool-tower.webp','The lattice tower has dominated a Lancashire resort since 1894.','Blackpool Tower official history'],
  ['royal-pavilion','Architecture','Identify this domed royal seaside palace','Royal Pavilion, Brighton',['Osborne House','Blenheim Palace','Kew Palace'],'royal-pavilion-brighton.webp','Its Indo-Saracenic exterior was created for George IV.','Royal Pavilion and Museums Trust'],
  ['falkirk-wheel','Engineering','Identify this rotating boat lift','Falkirk Wheel',['Anderton Boat Lift','Pontcysyllte Aqueduct','Thames Barrier'],'falkirk-wheel.webp','The circular mechanism links two Scottish canals.','Scottish Canals, Falkirk Wheel'],
  ['clifton-bridge','Engineering','Identify this suspension bridge above the Avon Gorge','Clifton Suspension Bridge',['Menai Suspension Bridge','Humber Bridge','Severn Bridge'],'clifton-suspension-bridge.webp','Brunel’s bridge connects Clifton with Leigh Woods.','Clifton Suspension Bridge Trust'],
  ['stirling-castle','Scottish Heritage','Identify this royal fortress above the River Forth','Stirling Castle',['Edinburgh Castle','Doune Castle','Dumbarton Castle'],'stirling-castle.webp','Several Stewart monarchs were crowned or lived here.','Historic Environment Scotland'],
  ['durham-cathedral','Architecture','Identify this Norman cathedral above a river bend','Durham Cathedral',['Lincoln Cathedral','York Minster','Ely Cathedral'],'durham-cathedral.webp','The shrine of St Cuthbert stands beside Durham Castle.','Durham Cathedral official history'],
  ['royal-liver-building','Architecture','Identify this waterfront building crowned by two birds','Royal Liver Building',['Cunard Building','Port of Liverpool Building','Battersea Power Station'],'royal-liver-building.webp','Two Liver Birds watch the Mersey from its clock towers.','National Museums Liverpool'],
  ['menai-bridge','Engineering','Identify this suspension bridge linking Anglesey','Menai Suspension Bridge',['Conwy Suspension Bridge','Clifton Suspension Bridge','Tamar Bridge'],'menai-suspension-bridge.webp','Thomas Telford’s bridge crosses the Menai Strait.','Cadw, Menai Suspension Bridge'],
  ['glastonbury-tor','Landscape History','Identify this tower-topped Somerset hill','Glastonbury Tor',['Brent Knoll','Silbury Hill','St Michael’s Mount'],'glastonbury-tor.webp','St Michael’s Tower crowns an isolated hill associated with Avalon.','National Trust, Glastonbury Tor'],
];
export const expansionImages: ImageRevealChallenge[] = IMAGE_ENTRIES.map(([id,category,prompt,subjectName,distractors,file,visualHint,source]) => ({
  id:`img-exp-${id}`,roundType:'IMAGE_REVEAL',category,prompt,subjectName,aliases:[cleanAlias(subjectName)],options:[subjectName,...distractors],imageUrl:`/assets/reconnaissance/${file}`,visualHint,explanation:`The certified subject is ${subjectName}.`,source,mediaLicence:'Wikimedia Commons; individual attribution recorded in public/assets/reconnaissance/EXPANSION-LICENCES.json',
}));

type StopEntry = [string,string,string,string[],number,string,string];
const STOP_ENTRIES: StopEntry[] = [
  ['tudor-last','Royal History','Who was the final Tudor monarch?',['Elizabeth I','Mary I','James I','Henry VIII'],0,'Elizabeth I died in 1603 and was succeeded by James VI and I.','The Royal Family, Elizabeth I'],
  ['highest-england','Geography','Which is the highest mountain in England?',['Scafell Pike','Helvellyn','Skiddaw','Cross Fell'],0,'Scafell Pike reaches 978 metres.','Ordnance Survey, highest mountains in England'],
  ['falkirk-purpose','Engineering','What does the Falkirk Wheel move?',['Boats between canals','Railway carriages','Road traffic','Hydroelectric turbines'],0,'The rotating lift transfers boats between the Forth and Clyde and Union canals.','Scottish Canals, Falkirk Wheel'],
  ['bard-birthplace','Literature','In which town was William Shakespeare born?',['Stratford-upon-Avon','Canterbury','Bath','Warwick'],0,'Shakespeare was born in Stratford-upon-Avon in 1564.','Shakespeare Birthplace Trust'],
  ['edinburgh-volcano','Scottish Geography','Edinburgh Castle stands on which geological feature?',['Castle Rock','Arthur’s Seat','Salisbury Crags','Calton Hill'],0,'Castle Rock is the plug of an extinct volcano.','Historic Environment Scotland'],
  ['liver-birds','Liverpool','How many Liver Birds stand on the Royal Liver Building?',['Two','One','Three','Four'],0,'A pair of copper Liver Birds crown the two clock towers.','National Museums Liverpool'],
  ['lovell-location','Science','Where is the Lovell Telescope?',['Jodrell Bank','Greenwich Observatory','Goonhilly','Royal Observatory Edinburgh'],0,'The telescope is at Jodrell Bank in Cheshire.','Jodrell Bank Centre for Engagement'],
  ['clifton-designer','Engineering','Which engineer is chiefly associated with Clifton Suspension Bridge?',['Isambard Kingdom Brunel','Thomas Telford','Robert Stephenson','Joseph Bazalgette'],0,'Brunel won the design competition for the bridge.','Clifton Suspension Bridge Trust'],
  ['pavilion-patron','Royal History','Which monarch commissioned Brighton’s Royal Pavilion while Prince Regent?',['George IV','William IV','George III','Edward VII'],0,'The future George IV transformed the residence into the Royal Pavilion.','Royal Pavilion and Museums Trust'],
  ['first-bond','British Cinema','Which film began the official Eon James Bond series?',['Dr. No','Goldfinger','Casino Royale','From Russia with Love'],0,'Dr. No was released in 1962 as the first Eon Bond film.','British Film Institute, Dr. No'],
];
export const expansionStop: StopTheScoreChallenge[] = STOP_ENTRIES.map(([id,category,prompt,options,correctIndex,explanation,source]) => ({id:`sts-exp-${id}`,roundType:'STOP_THE_SCORE',category,prompt,options,correctIndex,explanation,source}));

export const expansionChallenges: Challenge[] = [
  ...expansionTop10,
  ...expansionBids,
  ...expansionLists,
  ...expansionMaps,
  ...expansionClosest,
  ...expansionRank,
  ...expansionImages,
  ...expansionStop,
];
