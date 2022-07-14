export const generateColorPart = () => Math.ceil(Math.random() * 256);

export const convertColor = (color, modifier = 0) => {
  const clamped = Uint8ClampedArray.from(color, (part) => part + modifier);
  return (
    "#" +
    Array.from(clamped, (part) => part.toString(16).padStart(2, "0")).join("")
  );
};

export const randomId = (prefix = '') => prefix + Math.random().toString(16).slice(2);

export const vector = {
  dot: ([a1, b1], [a2, b2]) => a1 * a2 + b1 * b2,
  multiply: ([a, b], m) => [a * m, b * m],
  add: ([a1, b1], [a2, b2]) => [a1 + a2, b1 + b2],
  subtract: ([a1, b1], [a2, b2]) => [a1 - a2, b1 - b2],
};
