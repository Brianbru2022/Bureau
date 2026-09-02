import type {
  Challenge, ClosestWinsChallenge, ImageRevealChallenge, PutUpOrShutUpChallenge,
  RankItChallenge, StopTheScoreChallenge, TheListChallenge, Top10Challenge,
  WhereInBritainChallenge
} from '../types';

type ListPack = [id: string, category: string, prompt: string, answers: string[], source: string];
type RankedPack = [id: string, category: string, prompt: string, answers: string[], source: string];

const aliasesFor = (name: string): string[] => Array.from(new Set([
  name.replace(/[’]/g, "'"),
  name.replace(/^The\s+/i, ''),
])).filter(alias => alias !== name && alias.length > 0);
const answer = (name: string) => ({ name, aliases: aliasesFor(name) });
const makeList = ([id, category, prompt, answers, source]: ListPack): TheListChallenge => ({
  id: `list-${id}`, roundType: 'THE_LIST', category, prompt,
  validAnswers: answers.map(answer), explanation: `The certified register contains ${answers.length} accepted entries.`, source
});
const makeBid = ([id, category, prompt, answers, source]: ListPack): PutUpOrShutUpChallenge => ({
  id: `bid-${id}`, roundType: 'PUT_UP_OR_SHUT_UP', category, prompt, targetUnit: 'valid entries',
  validAnswers: answers.map(answer), explanation: `The certified register contains ${answers.length} accepted entries.`, source
});
const makeTop10 = ([id, category, prompt, answers, source]: RankedPack): Top10Challenge => ({
  id: `top10-${id}`, roundType: 'TOP_10', category, prompt,
  items: answers.map((name, index) => ({ rank: index + 1, name, aliases: aliasesFor(name), detail: `Register position ${index + 1}`, rarityMultiplier: 1 + index * 0.07 })),
  explanation: 'The shutters follow the Bureau’s certified filing order.', source
});

const NATIONAL_PARKS_ENGLAND = ['The Broads','Dartmoor','Exmoor','Lake District','New Forest','North York Moors','Northumberland','Peak District','South Downs','Yorkshire Dales'];
const UK_MONARCHS_1760 = ['George III','George IV','William IV','Victoria','Edward VII','George V','Edward VIII','George VI','Elizabeth II','Charles III'];
const HISTORIC_ART_PLACES = ["St Paul's Cathedral",'Angel of the North','Yorkshire Sculpture Park','Barbara Hepworth Museum and Sculpture Garden','Kelmscott Manor','Chatsworth House','Tate Modern','Sutton Hoo','Coventry Cathedral','Minack Theatre'];
const SHAKESPEARE_TRAGEDIES = ['Antony and Cleopatra','Coriolanus','Hamlet','Julius Caesar','King Lear','Macbeth','Othello','Romeo and Juliet','Timon of Athens','Titus Andronicus'];
const DOWNING_STREET_PMS = ['Winston Churchill','Clement Attlee','Anthony Eden','Harold Macmillan','Alec Douglas-Home','Harold Wilson','Edward Heath','James Callaghan','Margaret Thatcher','John Major'];
const ENGLISH_CATHEDRAL_CITIES = ['Canterbury','York','Durham','Ely','Exeter','Gloucester','Hereford','Lichfield','Lincoln','Salisbury'];
const UK_WORLD_HERITAGE = ['Blenheim Palace','Canterbury Cathedral','City of Bath','Cornwall and West Devon Mining Landscape','Derwent Valley Mills','Dorset and East Devon Coast','Durham Castle and Cathedral','English Lake District','Ironbridge Gorge','Maritime Greenwich'];
const LONDON_TUBE_LINES = ['Bakerloo','Central','Circle','District','Hammersmith & City','Jubilee','Metropolitan','Northern','Piccadilly','Victoria'];
const BRITISH_INVENTIONS = ['World Wide Web','Telephone','Television','Steam locomotive','Jet engine','Hovercraft','Pneumatic tyre','Electric motor','Carbon fibre','Stainless steel'];

export const supplementalTop10: Top10Challenge[] = ([
  ['england-parks','Protected Landscapes','Ten National Parks in England, in the official register order',NATIONAL_PARKS_ENGLAND,'GOV.UK and ONS, National parks in England and Wales'],
  ['uk-monarchs-1760','Royal History','The ten UK monarchs from the 1760 accession to the present, chronologically',UK_MONARCHS_1760,'UK Parliament Regnal Years API'],
  ['historic-art-places','Heritage','Historic England’s ten Art, Architecture & Sculpture places',HISTORIC_ART_PLACES,'Historic England, A History of England in 100 Places'],
  ['shakespeare-tragedies','Literature','Ten tragedies in the Shakespeare Birthplace Trust catalogue',SHAKESPEARE_TRAGEDIES,'Shakespeare Birthplace Trust play catalogue'],
  ['postwar-pms','Political History','The first ten post-war Prime Ministers beginning with Churchill',DOWNING_STREET_PMS,'House of Commons Library, Prime Ministers briefing SN04256'],
  ['cathedral-cities','British Places','Ten historic English cathedral cities on the Bureau register',ENGLISH_CATHEDRAL_CITIES,'Church of England cathedral directory'],
  ['world-heritage','Heritage','Ten UK World Heritage properties in alphabetical register order',UK_WORLD_HERITAGE,'UNESCO World Heritage List, United Kingdom'],
  ['underground-lines','London','Ten London Underground lines in alphabetical order',LONDON_TUBE_LINES,'Transport for London, Tube lines'],
  ['british-inventions','Science & Industry','Ten inventions associated with British inventors on the Science Museum register',BRITISH_INVENTIONS,'Science Museum Group collection and inventor biographies']
] as RankedPack[]).map(makeTop10);

const BID_PACKS: ListPack[] = [
  ['england-parks','Protected Landscapes','Name National Parks in England',NATIONAL_PARKS_ENGLAND,'GOV.UK and ONS, National parks in England and Wales'],
  ['london-underground-lines','London Transport','Name London Underground lines',[...LONDON_TUBE_LINES,'Waterloo & City'],'Transport for London, Tube lines'],
  ['uk-monarchs','Royal History','Name UK monarchs who acceded in 1760 or later',UK_MONARCHS_1760,'UK Parliament Regnal Years API'],
  ['shakespeare-tragedies','Literature','Name Shakespeare tragedies',SHAKESPEARE_TRAGEDIES,'Shakespeare Birthplace Trust play catalogue'],
  ['world-heritage','Heritage','Name UK World Heritage properties',UK_WORLD_HERITAGE,'UNESCO World Heritage List, United Kingdom'],
  ['scottish-council-areas','Scottish Geography','Name Scottish council areas',['Aberdeen City','Aberdeenshire','Angus','Argyll and Bute','Clackmannanshire','Dundee City','East Ayrshire','East Dunbartonshire','East Lothian','East Renfrewshire','Edinburgh','Falkirk','Fife','Glasgow City','Highland','Inverclyde','Midlothian','Moray','Na h-Eileanan Siar','North Ayrshire','North Lanarkshire','Orkney Islands','Perth and Kinross','Renfrewshire','Scottish Borders','Shetland Islands','South Ayrshire','South Lanarkshire','Stirling','West Dunbartonshire','West Lothian'],'Scottish Government, Council area profiles'],
  ['welsh-principal-areas','Welsh Geography','Name principal areas of Wales',['Blaenau Gwent','Bridgend','Caerphilly','Cardiff','Carmarthenshire','Ceredigion','Conwy','Denbighshire','Flintshire','Gwynedd','Isle of Anglesey','Merthyr Tydfil','Monmouthshire','Neath Port Talbot','Newport','Pembrokeshire','Powys','Rhondda Cynon Taf','Swansea','Torfaen','Vale of Glamorgan','Wrexham'],'Welsh Government, Local authorities'],
  ['ni-districts','Northern Irish Geography','Name local government districts in Northern Ireland',['Antrim and Newtownabbey','Ards and North Down','Armagh City Banbridge and Craigavon','Belfast','Causeway Coast and Glens','Derry City and Strabane','Fermanagh and Omagh','Lisburn and Castlereagh','Mid and East Antrim','Mid Ulster','Newry Mourne and Down'],'Northern Ireland Executive, Local councils'],
  ['ceremonial-counties','English Geography','Name ceremonial counties of England',['Bedfordshire','Berkshire','Bristol','Buckinghamshire','Cambridgeshire','Cheshire','City of London','Cornwall','Cumbria','Derbyshire','Devon','Dorset','Durham','East Riding of Yorkshire','East Sussex','Essex','Gloucestershire','Greater London','Greater Manchester','Hampshire','Herefordshire','Hertfordshire','Isle of Wight','Kent','Lancashire','Leicestershire','Lincolnshire','Merseyside','Norfolk','North Yorkshire','Northamptonshire','Northumberland','Nottinghamshire','Oxfordshire','Rutland','Shropshire','Somerset','South Yorkshire','Staffordshire','Suffolk','Surrey','Tyne and Wear','Warwickshire','West Midlands','West Sussex','West Yorkshire','Wiltshire','Worcestershire'],'UK Government, Lieutenancies Act 1997'],
  ['national-trails','Walking Britain','Name National Trails in England and Wales',['Cleveland Way','Cotswold Way','Hadrian’s Wall Path','North Downs Way','Offa’s Dyke Path','Pennine Bridleway','Pennine Way','Pembrokeshire Coast Path','Peddars Way and Norfolk Coast Path','South Downs Way','South West Coast Path','Thames Path','The Ridgeway','Yorkshire Wolds Way'],'Natural England and Natural Resources Wales, National Trails'],
  ['premier-league-founders','Football History','Name founding Premier League clubs from the 1992–93 season',['Arsenal','Aston Villa','Blackburn Rovers','Chelsea','Coventry City','Crystal Palace','Everton','Ipswich Town','Leeds United','Liverpool','Manchester City','Manchester United','Middlesbrough','Norwich City','Nottingham Forest','Oldham Athletic','Queens Park Rangers','Sheffield United','Sheffield Wednesday','Southampton','Tottenham Hotspur','Wimbledon'],'Premier League, History and 1992–93 table']
];
export const supplementalBid: PutUpOrShutUpChallenge[] = BID_PACKS.map(makeBid);

const LIST_PACKS: ListPack[] = [
  ['england-parks','Protected Landscapes','Feed the compressor with National Parks in England',NATIONAL_PARKS_ENGLAND,'GOV.UK and ONS, National parks in England and Wales'],
  ['tube-lines','London Transport','Feed the compressor with London Underground lines',[...LONDON_TUBE_LINES,'Waterloo & City'],'Transport for London, Tube lines'],
  ['monarchs','Royal History','Feed the compressor with UK monarchs who acceded in 1760 or later',UK_MONARCHS_1760,'UK Parliament Regnal Years API'],
  ['historic-art','Heritage','Feed the compressor with Historic England’s Art, Architecture & Sculpture places',HISTORIC_ART_PLACES,'Historic England, A History of England in 100 Places'],
  ['shakespeare','Literature','Feed the compressor with Shakespeare tragedies',SHAKESPEARE_TRAGEDIES,'Shakespeare Birthplace Trust play catalogue'],
  ['world-heritage','Heritage','Feed the compressor with UK World Heritage properties',UK_WORLD_HERITAGE,'UNESCO World Heritage List, United Kingdom'],
  ['scottish-cities','Scottish Geography','Feed the compressor with Scotland’s official cities',['Aberdeen','Dundee','Dunfermline','Edinburgh','Glasgow','Inverness','Perth','Stirling'],'UK Government, List of cities'],
  ['welsh-cities','Welsh Geography','Feed the compressor with Wales’s official cities',['Bangor','Cardiff','Newport','St Asaph','St Davids','Swansea','Wrexham'],'UK Government, List of cities'],
  ['ni-counties','Northern Irish Geography','Feed the compressor with Northern Ireland’s traditional counties',['Antrim','Armagh','Down','Fermanagh','Londonderry','Tyrone'],'Ordnance Survey of Northern Ireland'],
  ['beatles-albums','British Music','Feed the compressor with core UK Beatles studio albums',['Please Please Me','With the Beatles','A Hard Day’s Night','Beatles for Sale','Help!','Rubber Soul','Revolver','Sgt. Pepper’s Lonely Hearts Club Band','The Beatles','Yellow Submarine','Abbey Road','Let It Be'],'British Library, The Beatles collection'],
  ['jane-austen','Literature','Feed the compressor with Jane Austen’s completed novels',['Sense and Sensibility','Pride and Prejudice','Mansfield Park','Emma','Northanger Abbey','Persuasion'],'Jane Austen’s House bibliography'],
  ['henry-viii-wives','Royal History','Feed the compressor with the six wives of Henry VIII',['Catherine of Aragon','Anne Boleyn','Jane Seymour','Anne of Cleves','Catherine Howard','Catherine Parr'],'Historic Royal Palaces, Henry VIII']
];
export const supplementalList: TheListChallenge[] = LIST_PACKS.map(makeList);

export const supplementalMaps: WhereInBritainChallenge[] = [
  ['st-davids','St Davids Cathedral, Pembrokeshire',51.8819,-5.2683,'Wales'],
  ['lands-end',"Land’s End, Cornwall",50.0660,-5.7147,'England'],
  ['john-ogroats','John o’ Groats, Caithness',58.6373,-3.0689,'Scotland'],
  ['ely-cathedral','Ely Cathedral, Cambridgeshire',52.3986,0.2642,'England'],
  ['portmeirion','Portmeirion, Gwynedd',52.9134,-4.0986,'Wales']
].map(([id,targetName,lat,lng,region]) => ({
  id: `map-${id}`, roundType: 'WHERE_IN_BRITAIN', category: 'British Geography', prompt: `Locate ${targetName}`,
  targetName: String(targetName), region: region as WhereInBritainChallenge['region'], lat: Number(lat), lng: Number(lng), mapX: 50, mapY: 50,
  explanation: `${targetName} is filed at approximately ${Number(lat).toFixed(3)}°, ${Number(lng).toFixed(3)}°.`, source: 'Ordnance Survey place data and official site coordinates'
}));

export const supplementalClosest: ClosestWinsChallenge[] = [
  ['ben-nevis','Geography','What is the height of Ben Nevis?',1345,'metres',12,'Ordnance Survey, Ben Nevis'],
  ['thames-length','Geography','How long is the River Thames?',346,'kilometres',18,'Environment Agency, River Thames'],
  ['channel-tunnel','Engineering','How long is the Channel Tunnel?',50.45,'kilometres',12,'Getlink, Channel Tunnel key figures'],
  ['angel-wingspan','Public Art','What is the wingspan of the Angel of the North?',54,'metres',15,'Gateshead Council, Angel of the North'],
  ['london-eye','Engineering','How tall is the London Eye?',135,'metres',12,'London Eye official facts'],
  ['stonehenge-age','Prehistory','Approximately how many years ago was Stonehenge’s stone circle erected?',4500,'years ago',20,'English Heritage, History of Stonehenge'],
  ['big-ben-bell','Engineering','How much does the Great Bell known as Big Ben weigh?',13.7,'tonnes',15,'UK Parliament, Big Ben facts'],
  ['severn-bridge','Engineering','What is the main span of the first Severn Bridge?',988,'metres',15,'National Highways, Severn Bridge']
].map(([id,category,prompt,value,unit,tolerance,source]) => ({
  id: `closest-${id}`, roundType: 'CLOSEST_WINS', category: String(category), prompt: String(prompt), correctValue: Number(value), unit: String(unit), toleranceScale: Number(tolerance), explanation: `The certified value is ${value} ${unit}.`, source: String(source)
}));

type RankPack = [string,string,string,string[],string];
const RANK_PACKS: RankPack[] = [
  ['monarchs','Royal History','Order these monarchs by accession, earliest first',['Victoria','Edward VII','George V','Elizabeth II'],'UK Parliament Regnal Years API'],
  ['bridges','Engineering','Order these bridges by opening date, earliest first',['Menai Suspension Bridge','Forth Bridge','Tower Bridge','Millennium Bridge'],'Institution of Civil Engineers archive'],
  ['novels','Literature','Order these novels by first publication, earliest first',['Pride and Prejudice','Jane Eyre','The Hobbit','Nineteen Eighty-Four'],'British Library catalogues'],
  ['inventions','Science','Order these inventions by demonstration or patent, earliest first',['Steam locomotive','Telephone','Television','World Wide Web'],'Science Museum Group'],
  ['national-parks','Protected Landscapes','Order these National Parks by designation, earliest first',['Peak District','Pembrokeshire Coast','The Broads','South Downs'],'National Parks UK'],
  ['prime-ministers','Political History','Order these Prime Ministers by first taking office',['Clement Attlee','Margaret Thatcher','Tony Blair','David Cameron'],'House of Commons Library, Prime Ministers'],
  ['albums','British Music','Order these Beatles albums by UK release',['Please Please Me','Rubber Soul','Sgt. Pepper’s Lonely Hearts Club Band','Abbey Road'],'British Library and Beatles discography'],
  ['cathedrals','Architecture','Order these present cathedral buildings by major construction start',['Durham Cathedral','Salisbury Cathedral',"St Paul’s Cathedral",'Liverpool Cathedral'],'Church of England cathedral histories'],
  ['railways','Transport','Order these railway milestones, earliest first',['Stockton and Darlington Railway','London Underground','Forth Bridge','Channel Tunnel'],'National Railway Museum'],
  ['broadcasting','Media','Order these BBC services by launch',['BBC Radio','BBC Television Service','BBC Two','BBC News website'],'BBC History'],
  ['sport-events','Sport','Order these British sporting firsts, earliest first',['First FA Cup Final','First Wimbledon Championship','First modern Olympic Games in London','First London Marathon'],'National Football Museum, Wimbledon and Olympic archives']
];
export const supplementalRank: RankItChallenge[] = RANK_PACKS.map(([id,category,prompt,labels,source]) => ({
  id: `rank-${id}`, roundType: 'RANK_IT', category, prompt,
  items: labels.map((label,index) => ({ id: `${id}-${index+1}`, label, correctRank: index+1, detail: `Certified position ${index+1}` })),
  explanation: `The correct sequence is ${labels.join(' → ')}.`, source
}));

type ImagePack = [string,string,string,string,string[],string,string,string];
const IMAGE_PACKS: ImagePack[] = [
  ['stonehenge','Prehistoric Britain','Identify this prehistoric stone circle','Stonehenge',['Avebury','Ring of Brodgar','Callanish Stones'],'stonehenge.webp','A ring of monumental stones on Salisbury Plain.','English Heritage, Stonehenge'],
  ['edinburgh-castle','Scottish Heritage','Identify this fortress above Scotland’s capital','Edinburgh Castle',['Stirling Castle','Eilean Donan Castle','Urquhart Castle'],'edinburgh-castle.webp','Its volcanic Castle Rock dominates the city skyline.','Historic Environment Scotland'],
  ['elizabeth-tower','Parliament','Identify this clock tower at the Palace of Westminster','Elizabeth Tower',['Victoria Tower','Blackpool Tower','Nelson’s Column'],'elizabeth-tower.webp','The bell inside is commonly called Big Ben.','UK Parliament, Big Ben'],
  ['giants-causeway','Natural Heritage','Identify this basalt coast in County Antrim',"Giant’s Causeway",['Durdle Door','Cheddar Gorge','Fingal’s Cave'],'giants-causeway.webp','Tens of thousands of interlocking basalt columns meet the sea.','National Trust, Giant’s Causeway'],
  ['forth-bridge','Engineering','Identify this red cantilever railway bridge','Forth Bridge',['Tay Bridge','Royal Albert Bridge','Humber Bridge'],'forth-bridge.webp','It crosses the Firth of Forth west of Edinburgh.','Historic Environment Scotland, Forth Bridge'],
  ['kelpies','Public Art','Identify these giant horse-head sculptures','The Kelpies',['Another Place','Angel of the North','The Headington Shark'],'kelpies.webp','Two 30-metre steel heads stand beside the Forth and Clyde Canal.','Scottish Canals, The Kelpies'],
  ['sutton-hoo','Archaeology','Identify this Anglo-Saxon ceremonial helmet','Sutton Hoo Helmet',['Waterloo Helmet','Roman Crosby Garrett Helmet','Benty Grange Helmet'],'sutton-hoo-helmet.webp','It was reconstructed from fragments found in the ship burial.','British Museum, Sutton Hoo helmet'],
  ['spitfire','Aviation','Identify this elliptical-winged British fighter','Supermarine Spitfire',['Hawker Hurricane','Avro Lancaster','de Havilland Mosquito'],'spitfire.webp','Its wing shape is one of the most recognisable of the Second World War.','Royal Air Force Museum, Spitfire'],
  ['caernarfon','Welsh Heritage','Identify this polygonal-towered castle in Gwynedd','Caernarfon Castle',['Conwy Castle','Harlech Castle','Beaumaris Castle'],'caernarfon-castle.webp','Edward I’s fortress stands beside the River Seiont.','Cadw, Caernarfon Castle'],
  ['hadrians-wall','Roman Britain','Identify this Roman frontier across northern England',"Hadrian’s Wall",['Antonine Wall','Offa’s Dyke','Wat’s Dyke'],'hadrians-wall.webp','The frontier ran from the Tyne to the Solway Firth.','English Heritage, Hadrian’s Wall'],
  ['cerne-abbas','Landscape History','Identify this chalk hill figure in Dorset','Cerne Abbas Giant',['Uffington White Horse','Long Man of Wilmington','Westbury White Horse'],'cerne-abbas-giant.webp','The nude figure holds a large club above his head.','National Trust, Cerne Giant']
];
export const supplementalImages: ImageRevealChallenge[] = IMAGE_PACKS.map(([id,category,prompt,subjectName,distractors,file,visualHint,source]) => ({
  id: `img-${id}`, roundType: 'IMAGE_REVEAL', category, prompt, subjectName, aliases: [subjectName.toLowerCase()], options: [subjectName,...distractors], imageUrl: `/assets/reconnaissance/${file}`, visualHint, explanation: `${subjectName} is the certified subject.`, source
}));

type StopPack = [string,string,string,string[],number,string,string];
const STOP_PACKS: StopPack[] = [
  ['parliament-bell','Parliament','What does the name Big Ben strictly refer to?',['The Great Bell','The clock','The tower','The entire palace'],0,'Big Ben is the nickname of the Great Bell, not the tower.','UK Parliament, Big Ben'],
  ['national-park-first','Protected Landscapes','Which was Britain’s first designated National Park?',['Peak District','Lake District','Dartmoor','Snowdonia'],0,'The Peak District was designated in April 1951.','National Parks UK'],
  ['rosetta-scripts','Museum History','How many scripts appear on the Rosetta Stone?',['Three','Two','Four','Five'],0,'The decree appears in hieroglyphic, Demotic and Ancient Greek.','British Museum, Rosetta Stone'],
  ['channel-opening','Engineering','In which year did the Channel Tunnel officially open?',['1994','1989','1999','2004'],0,'Queen Elizabeth II and President François Mitterrand opened it in 1994.','Getlink, Channel Tunnel history'],
  ['stonehenge-county','Geography','In which ceremonial county is Stonehenge?',['Wiltshire','Dorset','Somerset','Hampshire'],0,'Stonehenge stands on Salisbury Plain in Wiltshire.','English Heritage'],
  ['forth-use','Engineering','What does the Forth Bridge primarily carry?',['Railway trains','Motorway traffic','Pedestrians only','Water pipes'],0,'The Forth Bridge is a cantilever railway bridge.','Historic Environment Scotland'],
  ['ben-nevis','Geography','Ben Nevis belongs to which mountain range?',['Grampian Mountains','Cairngorms','Pennines','Snowdonia'],0,'Ben Nevis is in the Grampian Mountains near Fort William.','Ordnance Survey'],
  ['magna-carta','Political History','Magna Carta was first sealed in which year?',['1215','1066','1314','1485'],0,'King John sealed Magna Carta at Runnymede in June 1215.','UK Parliament, Magna Carta'],
  ['tube-first','Transport','Which was the world’s first underground passenger railway?',['Metropolitan Railway','Central line','District Railway','Northern line'],0,'The Metropolitan Railway opened in London in 1863.','London Transport Museum'],
  ['giants-geology','Natural Heritage',"What type of rock forms Giant’s Causeway?",['Basalt','Granite','Limestone','Sandstone'],0,'Cooling lava fractured into the famous basalt columns.','Geological Survey of Northern Ireland']
];
export const supplementalStop: StopTheScoreChallenge[] = STOP_PACKS.map(([id,category,prompt,options,correctIndex,explanation,source]) => ({ id:`sts-${id}`,roundType:'STOP_THE_SCORE',category,prompt,options,correctIndex,explanation,source }));

export const supplementalChallenges: Challenge[] = [
  ...supplementalTop10, ...supplementalBid, ...supplementalList, ...supplementalMaps,
  ...supplementalClosest, ...supplementalRank, ...supplementalImages, ...supplementalStop
];
