import moment from 'moment';

const DATE_FORMAT = 'MMM DD, YYYY'; // for placeholder
const DATE_FORMAT_API = 'YYYY-MM-DD'; // for salesforce

/**
 * @description Format ISO-8601 string (from local table and state) to placeholder string
 * @param date Date string save in local table and state. (YYY-MM-DDTHH:mm:ss.sssZ)
 */
export const formatISOStringToCalendarDateString = (date: string) => {
  return moment(new Date(date)).format(DATE_FORMAT);
};

/**
 * @description Format ISO-8601 string (from local table and state) salesforce date string (YYYY-MM-DD).
 * @param date Date string save in local table and state. (YYY-MM-DDTHH:mm:ss.sssZ)
 */
export const formatISOStringToAPIDate = (date: string) => {
  return moment(new Date(date)).format(DATE_FORMAT_API);
};
