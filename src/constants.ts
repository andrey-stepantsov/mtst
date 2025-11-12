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

