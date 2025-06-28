export default function getWeekDates(startMonday) {
  // Returns array of { label: "MON", date: 30 } etc.
  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startMonday);
    d.setDate(startMonday.getDate() + i);
    week.push({
      label: weekDays[i],
      date: d.getDate(),
    });
  }
  return week;
}
