import { expect, describe, it } from "vitest";
import { getSeeding } from "./playoff";
import { getSchedule } from "./schedule";
import { CONFERENCE_PLAYOFF_TEAMS } from "./data";

const testCases = {
  "2023": {
    afc: ["BAL", "BUF", "KC", "HOU", "CLE", "MIA", "PIT"],
    nfc: ["SF", "DAL", "DET", "TB", "PHI", "LAR", "GB"],
  },
  "2024": {
    afc: ["KC", "BUF", "BAL", "HOU", "LAC", "PIT", "DEN"],
    nfc: ["DET", "PHI", "TB", "LAR", "MIN", "WSH", "GB"],
  },
  "2025": {
    afc: ["DEN", "NE", "JAX", "PIT", "HOU", "BUF", "LAC"],
    nfc: ["SEA", "CHI", "PHI", "CAR", "LAR", "SF", "GB"],
  },
};

describe("getSeeding", () => {
  it.each(Object.keys(testCases))("Season %d", async (season) => {
    const { schedule } = await getSchedule(parseInt(season));
    const { afc, nfc } = getSeeding(schedule);

    const afcPlayoffTeams = afc.seeding.slice(0, CONFERENCE_PLAYOFF_TEAMS);
    const nfcPlayoffTeams = nfc.seeding.slice(0, CONFERENCE_PLAYOFF_TEAMS);

    expect(afcPlayoffTeams).toStrictEqual(
      testCases[season as keyof typeof testCases].afc
    );
    expect(nfcPlayoffTeams).toStrictEqual(
      testCases[season as keyof typeof testCases].nfc
    );
  });
});
