import { calculatePowerRanking } from "../elo";
import { formatSchedule } from "../schedule";

export const SEASON = 2025;

const RAW_DATA = require(`./${SEASON}.json`);

export const SCHEDULE = formatSchedule(RAW_DATA);

export const ELO_POWER_RANKING = calculatePowerRanking(SCHEDULE);