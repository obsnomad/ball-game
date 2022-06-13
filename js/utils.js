export const generateColorPart = () => Math.ceil(Math.random() * 256);

export const convertColor = (color, modifier = 0) => {
  const clamped = Uint8ClampedArray.from(color, (part) => part + modifier);
  return (
    "#" +
    Array.from(clamped, (part) => part.toString(16).padStart(2, "0")).join("")
  );
};
