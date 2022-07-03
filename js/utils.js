export const generateColorPart = () => Math.ceil(Math.random() * 256);

export const convertColor = (color, modifier = 0) => {
  const clamped = Uint8ClampedArray.from(color, (part) => part + modifier);
  return (
    "#" +
    Array.from(clamped, (part) => part.toString(16).padStart(2, "0")).join("")
  );
};

export const vectorDot = ([a1, b1], [a2, b2]) => a1 * a2 + b1 * b2;
export const vectorMultiply = ([a, b], m) => [a * m, b * m];
export const vectorAdd = ([a1, b1], [a2, b2]) => [a1 + a2, b1 + b2];
export const vectorSubtract = ([a1, b1], [a2, b2]) => [a1 - a2, b1 - b2];
