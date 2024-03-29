import { parseSchedule } from "./schedule";

export enum Conference {
  AFC = 'AFC',
  NFC = 'NFC',
}

export enum Division {
  AFC_North = "AFC North",
  AFC_South = "AFC South",
  AFC_East = "AFC East",
  AFC_West = "AFC West",

  NFC_North = "NFC North",
  NFC_South = "NFC South",
  NFC_East = "NFC East",
  NFC_West = "NFC West",
}

export const DIVISIONS = Object.values(Division);

function getConferenceByDivision(division: Division) {
  switch (division) {
    case Division.AFC_North:
    case Division.AFC_South:
    case Division.AFC_East:
    case Division.AFC_West:
      return Conference.AFC;
    case Division.NFC_North:
    case Division.NFC_South:
    case Division.NFC_East:
    case Division.NFC_West:
      return Conference.NFC;
  }
}

export function isDivisionInConference(
  division: Division,
  conference: Conference
) {
  return getConferenceByDivision(division) === conference;
}

export interface Team {
  name: string;
  shorthand: string;
  division: Division;
  conference: Conference;
}

const TEAMS_OBJECTS = {
  "Arizona Cardinals": {
    shorthand: "ARI",
    division: Division.NFC_West,
    conference: Conference.NFC,
  },
  "Atlanta Falcons": {
    shorthand: "ATL",
    division: Division.NFC_South,
    conference: Conference.NFC,
  },
  "Baltimore Ravens": {
    shorthand: "BAL",
    division: Division.AFC_North,
    conference: Conference.AFC,
  },
  "Buffalo Bills": {
    shorthand: "BUF",
    division: Division.AFC_East,
    conference: Conference.AFC,
  },
  "Carolina Panthers": {
    shorthand: "CAR",
    division: Division.NFC_South,
    conference: Conference.NFC,
  },
  "Chicago Bears": {
    shorthand: "CHI",
    division: Division.NFC_North,
    conference: Conference.NFC,
  },
  "Cincinnati Bengals": {
    shorthand: "CIN",
    division: Division.AFC_North,
    conference: Conference.AFC,
  },
  "Cleveland Browns": {
    shorthand: "CLE",
    division: Division.AFC_North,
    conference: Conference.AFC,
  },
  "Dallas Cowboys": {
    shorthand: "DAL",
    division: Division.NFC_East,
    conference: Conference.NFC,
  },
  "Denver Broncos": {
    shorthand: "DEN",
    division: Division.AFC_West,
    conference: Conference.AFC,
  },
  "Detroit Lions": {
    shorthand: "DET",
    division: Division.NFC_North,
    conference: Conference.NFC,
  },
  "Green Bay Packers": {
    shorthand: "GB",
    division: Division.NFC_North,
    conference: Conference.NFC,
  },
  "Houston Texans": {
    shorthand: "HOU",
    division: Division.AFC_South,
    conference: Conference.AFC,
  },
  "Indianapolis Colts": {
    shorthand: "IND",
    division: Division.AFC_South,
    conference: Conference.AFC,
  },
  "Jacksonville Jaguars": {
    shorthand: "JAX",
    division: Division.AFC_South,
    conference: Conference.AFC,
  },
  "Kansas City Chiefs": {
    shorthand: "KC",
    division: Division.AFC_West,
    conference: Conference.AFC,
  },
  "Las Vegas Raiders": {
    shorthand: "LV",
    division: Division.AFC_West,
    conference: Conference.AFC,
  },
  "Los Angeles Rams": {
    shorthand: "LAR",
    division: Division.NFC_West,
    conference: Conference.NFC,
  },
  "Los Angeles Chargers": {
    shorthand: "LAC",
    division: Division.AFC_West,
    conference: Conference.AFC,
  },
  "Miami Dolphins": {
    shorthand: "MIA",
    division: Division.AFC_East,
    conference: Conference.AFC,
  },
  "Minnesota Vikings": {
    shorthand: "MIN",
    division: Division.NFC_North,
    conference: Conference.NFC,
  },
  "New England Patriots": {
    shorthand: "NE",
    division: Division.AFC_East,
    conference: Conference.AFC,
  },
  "New Orleans Saints": {
    shorthand: "NO",
    division: Division.NFC_South,
    conference: Conference.NFC,
  },
  "New York Giants": {
    shorthand: "NYG",
    division: Division.NFC_East,
    conference: Conference.NFC,
  },
  "New York Jets": {
    shorthand: "NYJ",
    division: Division.AFC_East,
    conference: Conference.AFC,
  },
  "Philadelphia Eagles": {
    shorthand: "PHI",
    division: Division.NFC_East,
    conference: Conference.NFC,
  },
  "Pittsburg Steelers": {
    shorthand: "PIT",
    division: Division.AFC_North,
    conference: Conference.AFC,
  },
  "San Francisco 49ers": {
    shorthand: "SF",
    division: Division.NFC_West,
    conference: Conference.NFC,
  },
  "Seattle Seahawks": {
    shorthand: "SEA",
    division: Division.NFC_West,
    conference: Conference.NFC,
  },
  "Tampa Bay Buccaneers": {
    shorthand: "TB",
    division: Division.NFC_South,
    conference: Conference.NFC,
  },
  "Tennessee Titans": {
    shorthand: "TEN",
    division: Division.AFC_South,
    conference: Conference.AFC,
  },
  "Washington Commanders": {
    shorthand: "WSH",
    division: Division.NFC_East,
    conference: Conference.NFC,
  },
};

export const TEAMS: Team[] = Object.entries(TEAMS_OBJECTS).reduce(
  (acc, cur) => {
    acc.push({ name: cur[0], ...cur[1] } as never);
    return acc;
  },
  []
);

export const NFC_TEAMS = TEAMS.filter(
  (team) => team.conference === Conference.NFC
);
export const AFC_TEAMS = TEAMS.filter(
  (team) => team.conference === Conference.AFC
);

// Clean this up
export const TEAM_MAP = TEAMS.reduce<Record<string, Team>>((acc, team) => {
  acc[team.shorthand] = team;
  return acc;
}, {});

const PLAYED_GAMES = {
  ARI: [
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    true,
    null,
    false,
    false,
    true,
  ],
  ATL: [
    true,
    true,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    false,
    null,
    true,
    true,
    false,
    false,
    true,
    false,
  ],
  BAL: [
    true,
    true,
    false,
    true,
    false,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    null,
    true,
    true,
    true,
    true,
    false,
  ],
  BUF: [
    false,
    true,
    true,
    true,
    false,
    true,
    false,
    true,
    false,
    false,
    true,
    false,
    null,
    true,
    true,
    true,
    true,
  ],
  CAR: [
    false,
    false,
    false,
    false,
    false,
    false,
    null,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
  ],
  CHI: [
    false,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    true,
    false,
    true,
    null,
    true,
    false,
    true,
    true,
  ],
  CIN: [
    false,
    false,
    true,
    false,
    true,
    true,
    null,
    true,
    true,
    false,
    false,
    false,
    true,
    true,
    true,
    false,
    false,
  ],
  CLE: [
    true,
    false,
    true,
    false,
    null,
    true,
    true,
    false,
    true,
    true,
    true,
    false,
    false,
    true,
    true,
    true,
    true,
  ],
  DAL: [
    true,
    true,
    false,
    true,
    false,
    true,
    null,
    true,
    false,
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    true,
  ],
  DEN: [
    false,
    false,
    false,
    true,
    false,
    false,
    true,
    true,
    null,
    true,
    true,
    true,
    false,
    true,
    false,
    false,
    true,
  ],
  DET: [
    true,
    false,
    true,
    true,
    true,
    true,
    false,
    true,
    null,
    true,
    true,
    false,
    true,
    false,
    true,
    true,
    false,
  ],
  GB: [
    true,
    false,
    true,
    false,
    false,
    null,
    false,
    false,
    true,
    false,
    true,
    true,
    true,
    false,
    false,
    true,
    true,
  ],
  HOU: [
    false,
    false,
    true,
    true,
    false,
    true,
    null,
    false,
    true,
    true,
    true,
    false,
    true,
    false,
    true,
    false,
    true,
  ],
  IND: [
    false,
    true,
    true,
    false,
    true,
    false,
    false,
    false,
    true,
    true,
    null,
    true,
    true,
    false,
    true,
    false,
    true,
  ],
  JAX: [
    true,
    false,
    false,
    true,
    true,
    true,
    true,
    true,
    null,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    true,
  ],
  KC: [
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    null,
    false,
    true,
    false,
    false,
    true,
    false,
    true,
  ],
  LAC: [
    false,
    false,
    true,
    true,
    null,
    false,
    false,
    true,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
  ],
  LAR: [
    true,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    false,
    null,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
  ],
  LV: [
    true,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    true,
    true,
    false,
    false,
    null,
    false,
    true,
    true,
    false,
  ],
  MIA: [
    true,
    true,
    true,
    false,
    true,
    true,
    false,
    true,
    false,
    null,
    true,
    true,
    true,
    false,
    true,
    true,
    false,
  ],
  MIN: [
    false,
    false,
    false,
    true,
    false,
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    null,
    true,
    false,
    false,
    false,
  ],
  NE: [
    false,
    false,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    null,
    false,
    false,
    true,
    false,
    true,
    false,
  ],
  NO: [
    true,
    true,
    false,
    false,
    true,
    false,
    false,
    true,
    true,
    false,
    null,
    false,
    false,
    true,
    true,
    false,
    true,
  ],
  NYG: [
    false,
    true,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    true,
    true,
    null,
    true,
    false,
    false,
    false,
  ],
  NYJ: [
    true,
    false,
    false,
    false,
    true,
    true,
    null,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
  ],
  PHI: [
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
    true,
    null,
    true,
    true,
    false,
    false,
    false,
    true,
    false,
  ],
  PIT: [
    false,
    true,
    true,
    false,
    true,
    null,
    true,
    false,
    true,
    true,
    false,
    true,
    false,
    false,
    false,
    true,
    true,
    true,
  ],
  SF: [
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    null,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    true,
  ],
  SEA: [
    false,
    true,
    true,
    true,
    null,
    false,
    true,
    true,
    false,
    true,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
  ],
  TB: [
    true,
    true,
    false,
    true,
    null,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    true,
    true,
    true,
    true,
    false,
  ],
  TEN: [
    false,
    true,
    false,
    true,
    false,
    false,
    null,
    true,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    false,
  ],
  WSH: [
    true,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    null,
    false,
    false,
    false,
  ],
};

export const SCHEDULE = parseSchedule(
  `
ARI @WSH NYG DAL @SF CIN @LAR @SEA BAL @CLE ATL @HOU LAR @PIT BYE SF @CHI @PHI SEA
ATL CAR GB @DET @JAX HOU WSH @TB @TEN MIN @ARI BYE NO @NYJ TB @CAR IND @CHI @NO
BAL HOU @CIN IND @CLE @PIT @TEN DET @ARI SEA CLE CIN @LAC BYE LAR @JAX @SF MIA PIT
BUF @NYJ LV @WSH MIA JAX NYG @NE TB @CIN DEN NYJ @PHI BYE @KC DAL @LAC NE @MIA
CAR @ATL NO @SEA MIN @DET @MIA BYE HOU IND @CHI DAL @TEN @TB @NO ATL GB @JAX TB
CHI GB @TB @KC DEN @WSH MIN LV @LAC @NO CAR @DET @MIN BYE DET @CLE ARI ATL @GB
CIN @CLE BAL LAR @TEN @ARI SEA BYE @SF BUF HOU @BAL PIT @JAX IND MIN @PIT @KC CLE
CLE CIN @PIT TEN BAL BYE SF @IND @SEA ARI @BAL PIT @DEN @LAR JAX CHI @HOU NYJ @CIN
DAL @NYG NYJ @ARI NE @SF @LAC BYE LAR @PHI NYG @CAR WSH SEA PHI @BUF @MIA DET @WSH
DEN LV WSH @MIA @CHI NYJ @KC GB KC BYE @BUF MIN CLE @HOU @LAC @DET NE LAC @LV
DET @KC SEA ATL @GB CAR @TB @BAL LV BYE @LAC CHI GB @NO @CHI DEN @MIN @DAL MIN
GB @CHI @ATL NO DET @LV BYE @DEN MIN LAR @PIT LAC @DET KC @NYG TB @CAR @MIN CHI
HOU @BAL IND @JAX PIT @ATL NO BYE @CAR TB @CIN ARI JAX DEN @NYJ @TEN CLE TEN @IND
IND JAX @HOU @BAL LAR TEN @JAX CLE NO @CAR @NE BYE TB @TEN @CIN PIT @ATL LV HOU
JAX @IND KC HOU ATL @BUF IND @NO @PIT BYE SF TEN @HOU CIN @CLE BAL @TB CAR @TEN
KC DET @JAX CHI @NYJ @MIN DEN LAC @DEN MIA BYE PHI @LV @GB BUF @NE LV CIN @LAC
LV @DEN @BUF PIT @LAC GB NE @CHI @DET NYG NYJ @MIA KC BYE MIN LAC @KC @IND DEN
LAR @SEA SF @CIN @IND PHI ARI PIT @DAL @GB BYE SEA @ARI CLE @BAL WSH NO @NYG @SF
LAC MIA @TEN @MIN LV BYE DAL @KC CHI @NYJ DET @GB BAL @NE DEN @LV BUF @DEN KC
MIA @LAC @NE DEN @BUF NYG CAR @PHI NE @KC BYE LV @NYJ @WSH TEN NYJ DAL @BAL BUF
MIN TB @PHI LAC @CAR KC @CHI SF @GB @ATL NO @DEN CHI BYE @LV @CIN DET GB @DET
NE PHI MIA @NYJ @DAL NO @LV BUF @MIA WSH IND BYE @NYG LAC @PIT KC @DEN @BUF NYJ
NO TEN @CAR @GB TB @NE @HOU JAX @IND CHI @MIN BYE @ATL DET CAR NYG @LAR @TB ATL
NYG DAL @ARI @SF SEA @MIA @BUF WSH NYJ @LV @DAL @WSH NE BYE GB @NO @PHI LAR PHI
NYJ BUF @DAL NE KC @DEN PHI BYE @NYG LAC @LV @BUF MIA ATL HOU @MIA WSH @CLE @NE
PHI @NE MIN @TB WSH @LAR @NYJ MIA @WSH DAL BYE @KC BUF SF @DAL @SEA NYG ARI @NYG
PIT SF CLE @LV @HOU BAL BYE @LAR JAX TEN GB @CLE @CIN ARI NE @IND CIN @SEA @BAL
SF @PIT @LAR NYG ARI DAL @CLE @MIN CIN BYE @JAX TB @SEA @PHI SEA @ARI BAL @WSH LAR
SEA LAR @DET CAR @NYG BYE @CIN ARI CLE @BAL WSH @LAR SF @DAL @SF PHI @TEN PIT @ARI
TB @MIN CHI PHI @NO BYE DET ATL @BUF @HOU TEN @SF @IND CAR @ATL @GB JAX NO @CAR
TEN @NO LAC @CLE CIN @IND BAL BYE ATL @PIT @TB @JAX CAR IND @MIA HOU SEA @HOU JAX
WSH ARI @DEN BUF @PHI CHI @ATL @NYG PHI @NE @SEA NYG @DAL MIA BYE @LAR @NYJ SF DAL`,
  PLAYED_GAMES
);
