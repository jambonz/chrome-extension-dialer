// fn to format call date:
export function transform(t1: number, t2: number) {
  const diff = Math.abs(t1 - t2) / 1000; // Get the difference in seconds

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = Math.floor(diff % 60);

  // Pad the values with a leading zero if they are less than 10
  const hours1 = hours < 10 ? "0" + hours : hours;
  const minutes1 = minutes < 10 ? "0" + minutes : minutes;
  const seconds1 = seconds < 10 ? "0" + seconds : seconds;

  return `${hours1}:${minutes1}:${seconds1}`;
}
