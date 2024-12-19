import { calculatePowerRanking } from "./elo";
import { parseSchedule } from "./schedule";

export const REGULAR_SEASON_GAMES = 17; // Excluding bye-weeks
export const WILDCARD_SPOTS = 3;

export enum Conference {
  AFC = "AFC",
  NFC = "NFC",
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

export const AFC_DIVISIONS = DIVISIONS.filter((division) =>
  isDivisionInConference(division, Conference.AFC)
);

export const NFC_DIVISIONS = DIVISIONS.filter((division) =>
  isDivisionInConference(division, Conference.NFC)
);

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

export const NFC_TEAMS_OBJECTS = TEAMS.filter(
  (team) => team.conference === Conference.NFC
);

export const AFC_TEAMS_OBJECTS = TEAMS.filter(
  (team) => team.conference === Conference.AFC
);

export const NFC_TEAMS = NFC_TEAMS_OBJECTS.map((team) => team.shorthand);

export const AFC_TEAMS = AFC_TEAMS_OBJECTS.map((team) => team.shorthand);

export const AFC_EAST_TEAMS = TEAMS.filter(
  (team) => team.division === Division.AFC_East
).map((team) => team.shorthand);
export const AFC_NORTH_TEAMS = TEAMS.filter(
  (team) => team.division === Division.AFC_North
).map((team) => team.shorthand);
export const AFC_SOUTH_TEAMS = TEAMS.filter(
  (team) => team.division === Division.AFC_South
).map((team) => team.shorthand);
export const AFC_WEST_TEAMS = TEAMS.filter(
  (team) => team.division === Division.AFC_West
).map((team) => team.shorthand);

export const NFC_EAST_TEAMS = TEAMS.filter(
  (team) => team.division === Division.NFC_East
).map((team) => team.shorthand);
export const NFC_NORTH_TEAMS = TEAMS.filter(
  (team) => team.division === Division.NFC_North
).map((team) => team.shorthand);
export const NFC_SOUTH_TEAMS = TEAMS.filter(
  (team) => team.division === Division.NFC_South
).map((team) => team.shorthand);
export const NFC_WEST_TEAMS = TEAMS.filter(
  (team) => team.division === Division.NFC_West
).map((team) => team.shorthand);

export const DIVISION_MAP = {
  [Division.AFC_East]: AFC_EAST_TEAMS,
  [Division.AFC_North]: AFC_NORTH_TEAMS,
  [Division.AFC_South]: AFC_SOUTH_TEAMS,
  [Division.AFC_West]: AFC_WEST_TEAMS,

  [Division.NFC_East]: NFC_EAST_TEAMS,
  [Division.NFC_North]: NFC_NORTH_TEAMS,
  [Division.NFC_South]: NFC_SOUTH_TEAMS,
  [Division.NFC_West]: NFC_WEST_TEAMS,
};

// Clean this up
export const TEAM_MAP = TEAMS.reduce<Record<string, Team>>((acc, team) => {
  acc[team.shorthand] = team;
  return acc;
}, {});

const PLAYED_GAMES_2023 = {
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

// https://gridirongames.com/nfl-season-schedule-grid/
export const SCHEDULE_2023 = parseSchedule(
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
  PLAYED_GAMES_2023
);

const PLAYED_GAMES_2024 = {
  ARI: [false, true, false, false, true, false, true, true, true, true, null, false, false, false, true],
  ATL: [false, true, false, true, true, true, false, true, true, false, false, null, false, false, true],
  BAL: [false, false, true, true, true, true, true, false, true, true, false, true, false, null, true],
  BUF: [true, true, true, false, false, true, true, true, true, true, true, null, true, false, true],
  CAR: [false, false, true, false, false, false, false, false, true, true, null, false, false, false, false],
  CHI: [true, false, false, true, true, true, null, false, false, false, false, false, false, false, false],
  CIN: [false, false, false, true, false, true, true, false, true, false, false, null, false, true, true],
  CLE: [false, true, false, false, false, false, false, true, false, false, false, true, false, false, false],
  DAL: [true, false, false, true, true, false, null, false, false, false, false, true, true, false, true],
  DEN: [false, false, true, true, true, false, true, true, false, false, true, true, true, null, true],
  DET: [true, false, true, true, null, true, true, true, true, true, true, true, true, true, false],
  GB: [false, true, true, false, true, true, true, true, false, null, true, true, true, false, true],
  HOU: [true, true, false, true, true, true, false, true, false, false, true, false, true, null, true],
  IND: [false, false, true, true, false, true, true, false, false, false, true, false, true, null, false],
  JAX: [false, false, false, false, true, false, true, false, false, false, false, null, false, true, false],
  KC: [true, true, true, true, true, null, true, true, true, true, false, true, true, true, true],
  LAC: [true, true, false, false, null, true, false, true, true, true, true, false, true, false, false],
  LAR: [false, false, true, false, false, null, true, true, true, false, true, false, true, true, true],
  LV: [false, true, false, true, false, false, false, false, false, null, false, false, false, false, false],
  MIA: [true, false, false, false, true, null, false, false, false, true, true, true, false, true, false],
  MIN: [true, true, true, true, true, null, false, false, true, true, true, true, true, true, true],
  NE: [true, false, false, false, false, false, false, true, false, true, false, false, false, null, false],
  NO: [true, true, false, false, false, false, false, false, false, true, true, null, false, true, false],
  NYG: [false, false, true, false, true, false, false, false, false, false, null, false, false, false, false],
  NYJ: [false, true, true, false, false, false, false, false, true, false, false, null, false, false, true],
  PHI: [true, false, true, false, null, true, true, true, true, true, true, true, true, true, true],
  PIT: [true, true, true, false, false, true, true, true, null, true, true, false, true, true, false],
  SF: [true, false, false, true, false, true, false, true, null, true, false, false, false, true, false],
  SEA: [true, true, true, false, false, false, true, false, false, null, true, true, true, true, false],
  TB: [true, true, false, true, false, true, false, false, false, false, null, true, true, true, true],
  TEN: [false, false, false, true, null, false, false, false, true, false, false, true, false, false, false],
  WSH: [false, true, true, true, true, false, true, true, true, false, false, false, true, null, true],
};

export const SCHEDULE_2024 = parseSchedule(
  `
ARI @BUF LAR DET WSH @SF @GB LAC @MIA CHI NYJ BYE @SEA @MIN SEA NE @CAR @LAR SF
ATL PIT @PHI KC NO TB @CAR SEA @TB DAL @NO @DEN BYE LAC @MIN @LV NYG @WSH CAR
BAL @KC LV @DAL BUF @CIN WSH @TB @CLE DEN CIN @PIT @LAC PHI BYE @NYG PIT @HOU CLE
BUF ARI @MIA JAX @BAL @HOU @NYJ TEN @SEA MIA @IND KC BYE SF @LAR @DET NE NYJ @NE
CAR @NO LAC @LV CIN @CHI ATL @WSH @DEN NO NYG BYE KC TB @PHI DAL ARI @TB @ATL
CHI TEN @HOU @IND LAR CAR JAX BYE @WSH @ARI NE GB MIN @DET @SF @MIN DET SEA @GB
CIN NE @KC WSH @CAR BAL @NYG @CLE PHI LV @BAL @LAC BYE PIT @DAL @TEN CLE DEN @PIT
CLE DAL @JAX NYG @LV @WSH @PHI CIN BAL LAC BYE @NO PIT @DEN @PIT KC @CIN MIA @BAL
DAL @CLE NO BAL @NYG @PIT DET BYE @SF @ATL PHI HOU @WSH NYG CIN @CAR TB @PHI WSH
DEN @SEA PIT @TB @NYJ LV LAC @NO CAR @BAL @KC ATL @LV CLE BYE IND @LAC @CIN KC
DET LAR TB @ARI SEA BYE @DAL @MIN TEN @GB @HOU JAX @IND CHI GB BUF @CHI @SF MIN
GB @PHI IND @TEN MIN @LAR ARI HOU @JAX DET BYE @CHI SF MIA @DET @SEA NO @MIN CHI
HOU @IND CHI @MIN JAX BUF @NE @GB IND @NYJ DET @DAL TEN @JAX BYE MIA @KC BAL @TEN
IND HOU @GB CHI PIT @JAX @TEN MIA @HOU @MIN BUF @NYJ DET @NE BYE @DEN TEN @NYG JAX
JAX @MIA CLE @BUF @HOU IND @CHI NE GB @PHI MIN @DET BYE HOU @TEN NYJ @LV TEN @IND
KC BAL CIN @ATL @LAC NO BYE @SF @LV TB DEN @BUF @CAR LV LAC @CLE HOU @PIT @DEN
LAC LV @CAR @PIT KC BYE @DEN @ARI NO @CLE TEN CIN BAL @ATL @KC TB DEN @NE @LV
LAR @DET @ARI SF @CHI GB BYE LV MIN @SEA MIA @NE PHI @NO BUF @SF @NYJ ARI SEA
LV @LAC @BAL CAR CLE @DEN PIT @LAR KC @CIN BYE @MIA DEN @KC @TB ATL JAX @NO LAC
MIA JAX BUF @SEA TEN @NE BYE @IND ARI @BUF @LAR LV NE @GB NYJ @HOU SF @CLE @NYJ
MIN @NYG SF HOU @GB NYJ BYE DET @LAR IND @JAX @TEN @CHI ARI ATL CHI @SEA GB @DET
NE @CIN SEA @NYJ @SF MIA HOU @JAX NYJ @TEN @CHI LAR @MIA IND BYE @ARI @BUF LAC BUF
NO CAR @DAL PHI @ATL @KC TB DEN @LAC @CAR ATL CLE BYE LAR @NYG WSH @GB LV @TB
NYG MIN @WSH @CLE DAL @SEA CIN PHI @PIT WSH @CAR BYE TB @DAL NO BAL @ATL IND @PHI
NYJ @SF @TEN NE DEN @MIN BUF @PIT @NE HOU @ARI IND BYE SEA @MIA @JAX LAR @BUF MIA
PHI GB ATL @NO @TB BYE CLE @NYG @CIN JAX @DAL WSH @LAR @BAL CAR PIT @WSH DAL NYG
PIT @ATL @DEN LAC @IND DAL @LV NYJ NYG BYE @WSH BAL @CLE @CIN CLE @PHI @BAL KC CIN
SF NYJ @MIN @LAR NE ARI @SEA KC DAL BYE @TB SEA @GB @BUF CHI LAR @MIA DET @ARI
SEA DEN @NE MIA @DET NYG SF @ATL BUF LAR BYE @SF ARI @NYJ @ARI GB MIN @CHI @LAR
TB WSH @DET DEN PHI @ATL @NO BAL ATL @KC SF BYE @NYG @CAR LV @LAC @DAL CAR NO
TEN @CHI NYJ GB @MIA BYE IND @BUF @DET NE @LAC MIN @HOU @WSH JAX CIN @IND @JAX HOU
WSH @TB NYG @CIN @ARI CLE @BAL CAR CHI @NYG PIT @PHI DAL TEN BYE @NO PHI ATL @DAL
`,
  PLAYED_GAMES_2024
);

// ESPN week 14
export const POWER_RANKING_2024 = [
  "DET",
  "BUF",
  "KC",
  "PHI",
  "PIT",
  "MIN",
  "GB",
  "BAL",
  "LAC",
  "WSH",
  "HOU",
  "DEN",
  "SEA",
  "TB",
  "ARI",
  "LAR",
  "ATL",
  "IND",
  "CIN",
  "MIA",
  "SF",
  "CHI",
  "DAL",
  "NO",
  "CLE",
  "CAR",
  "NYJ",
  "NE",
  "TEN",
  "JAX",
  "LV",
  "NYG",
];

export const ELO_POWER_RANKING_2024 = calculatePowerRanking(SCHEDULE_2024);
