export const REGULAR_SEASON_GAMES = 17; // Excluding bye-weeks
export const WILDCARD_SPOTS = 3;
export const CONFERENCE_PLAYOFF_TEAMS = WILDCARD_SPOTS + 4;

export enum WeekResult {
  Win,
  Loss,
  Draw,
}

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

export const TEAMS_OBJECTS = {
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
  "Pittsburgh Steelers": {
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

export const TEAM_SHORTHANDS = Object.keys(TEAM_MAP);
