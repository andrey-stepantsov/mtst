export const ALL_EVENTS = [
  "50 FR", "100 FR", "200 FR", "500 FR", "1000 FR", "1650 FR",
  "50 BK", "100 BK", "200 BK",
  "50 BR", "100 BR", "200 BR",
  "50 FL", "100 FL", "200 FL",
  "100 IM", "200 IM", "400 IM"
].sort((a, b) => {
  const getPostfix = (event: string) => event.split(' ').pop() || '';
  const getLength = (event: string) => parseInt(event.split(' ')[0]) || 0;

  const postfixA = getPostfix(a);
  const postfixB = getPostfix(b);

  // Sort by postfix first
  if (postfixA < postfixB) return -1;
  if (postfixA > postfixB) return 1;

  // If postfixes are the same, sort by length
  const lengthA = getLength(a);
  const lengthB = getLength(b);
  return lengthA - lengthB;
});

export const AGE_BRACKETS_SINGLE = ["10&U", "11-12", "13-14", "15-16", "17-18"];
export const AGE_BRACKETS_GROUP = ["01-10", "11-12", "13-14", "15-16", "17-18"];

// Combine and sort them for the "show all" view.
// Using a Set to remove duplicates ('11-12', etc.) and then sorting.
export const AGE_BRACKETS_ALL = [...new Set([...AGE_BRACKETS_SINGLE, ...AGE_BRACKETS_GROUP])].sort((a, b) => {
  // Custom sort to keep '10&U' and '01-10' at the beginning and in order.
  const aVal = parseInt(a.replace('&U', '-1').split('-')[0]);
  const bVal = parseInt(b.replace('&U', '-1').split('-')[0]);
  if (aVal !== bVal) return aVal - bVal;
  return a.length - b.length; // Puts '01-10' before '10&U'
});
