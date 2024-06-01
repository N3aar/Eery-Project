import dayjs from "dayjs";

export function dateToCron (dateStr: string) {
  const date = dayjs(dateStr, 'DD/MM/YY HH:mm');

  const minute = date.format('m');
  const hour = date.format('H');
  const day = date.format('D');
  const month = date.format('M');
  const year = date.format('YYYY');

  return `${minute} ${hour} ${day} ${month} * ${year}`;
}