export const START_OF_DAY = new Date().setHours(0, 0, 0, 0);

export const TOTAL_DAY_DURATION =
    new Date().setHours(23, 59, 59, 999) - START_OF_DAY;
