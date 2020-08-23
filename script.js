const WIDTH = 1024;
const HEIGHT = 800;
const SCALE = 3.5;
const MIDDLE_X = WIDTH / 2;
const MIDDLE_Y = HEIGHT / 2;

const LIGHTNESS = 0.5;

let ctx;

/**
 * Stores the canvas context passed by the html page in the module for later use.
 * @param context The canvas 2D context
 */
export function setContext(context) {
  ctx = context;
}

/**
 * Draws the color wheel at the center of the canvas.
 */
export function drawColorWheel() {
  if (!ctx) throw new Error('Context not found, please call setContext().');

  // A circle has 360 degrees, corresponding to all possible hue values (0 - 360)
  for (let h = 0; h <= 360; h++) {
    // The color's saturation is expressed as a percentage (0 - 100)
    for (let s = 0; s <= 100; s++) {
      ctx.beginPath();
      ctx.fillStyle = `hsl(${h}, ${s}%, ${LIGHTNESS * 100}%)`;
      // To calculate the position of the color on the wheel we use the sine and cosine as explained on
      // https://en.wikipedia.org/wiki/Trigonometric_functions.
      // Low saturation colors are drawn close to the center of the wheel while high saturation colors are drawn further
      // away. The whole wheel is scaled to make the diameter bigger than 200 pixels (1 pixel per 1% saturation as the
      // radius).
      const posX = MIDDLE_X + Math.cos(degreeToRadian(h)) * s * SCALE;
      const posY = MIDDLE_Y - Math.sin(degreeToRadian(h)) * s * SCALE;
      // At that position we draw a little dot that gets bigger the further away from the center it lies (scales with s).
      // We draw a full circle from 0 to 360 degrees which is the same as 0 to 2π radians.
      ctx.arc(posX, posY, SCALE * s / 100 + 1.5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // To smooth the bumps on the outer layer we draw an invisible border around the color wheel
  drawColorWheelBorder();
}

/**
 * Draws a thick invisible border around the color wheel to smooth the outer ring of colors.
 */
function drawColorWheelBorder() {
  ctx.beginPath();
  // Setting the same color as the canvas background makes the border invisible.
  ctx.strokeStyle = '#fefefe';
  ctx.lineWidth = 10;
  // We draw a full circle from 0 to 360 degrees which is the same as 0 to 2π radians.
  ctx.arc(MIDDLE_X, MIDDLE_Y, 100 * SCALE + 5, 0, 2 * Math.PI);
  ctx.stroke();
}

/**
 * Draws the instructions at the bottom of the canvas.
 */
export function drawInstructions() {
  if (!ctx) throw new Error('Context not found, please call setContext().');

  ctx.fillStyle = 'black';
  ctx.font = '26px Roboto';
  const instructions = 'Hover over any color or tap anywhere on the wheel';
  const textWidth = ctx.measureText(instructions).width;
  ctx.fillText(instructions, MIDDLE_X - Math.floor(textWidth / 2), HEIGHT - 15);
}

/**
 * Draws the relative position of the mouse cursor at the top right corner of the canvas.
 * @param {number} x The relative horizontal (x) position of the cursor on the canvas
 * @param {number} y The relative vertical (y) position of the cursor on the canvas
 */
export function drawMousePosition(x, y) {
  if (!ctx) throw new Error('Context not found, please call setContext().');

  ctx.clearRect(WIDTH - 105, 0, WIDTH, 40);
  ctx.fillStyle = 'black';
  ctx.font = '14px Roboto';
  ctx.fillText(`X: ${x}, Y: ${y}`, WIDTH - 100, 25);
}

/**
 * Draws the currently selected color at the top left corner of the canvas.
 * @param {number} x The relative horizontal (x) position of the cursor on the canvas
 * @param {number} y The relative vertical (y) position of the cursor on the canvas
 */
export function drawPickedColor(x, y) {
  if (!ctx) throw new Error('Context not found, please call setContext().');

  ctx.clearRect(10, 10, 200, 210);
  const color = getColorForPoint(x, y);
  ctx.fillStyle = `hsl(${color.h}, ${color.s * 100}%, ${color.l * 100}%)`;
  ctx.fillRect(10, 10, 200, 160);
  drawColorDetails(color);
}

/**
 * Returns the hsl color for the current cursor position.
 * @param {number} x The relative horizontal (x) position of the cursor on the canvas
 * @param {number} y The relative vertical (y) position of the cursor on the canvas
 * @returns {{h: number, s: number, l: number}} The hsl color for the current cursor position
 */
function getColorForPoint(x, y) {
  const dist = getDistanceFromCenter(x, y);

  // If the distance from the center is greater than the 100px radius * the scale, the cursor is not in the color wheel.
  // We return white as the color.
  if (dist > 100 * SCALE) return {h: 0, s: 0, l: 1};

  // The saturation is the distance from the center divided by the scale.
  const s = dist / SCALE;
  // To find the hue base on the x value we have to reverse the following formula
  // x = MIDDLE_X + Math.cos(degreeToRadian(h)) * s * SCALE
  let h = radianToDegree(Math.acos((x - MIDDLE_X) / s / SCALE));
  // Since every x value has 2 possible colors (1 above and 1 below the vertical middle) we need to inverse the hue if
  // the point is lower than the vertical middle. 360 - h is the same as h * -1 (380° - 90° == -90° == 290°) but is
  // better for displaying the hue value.
  if (y > MIDDLE_Y) h = 360 - h;
  return {h, s: s / 100, l: LIGHTNESS};
}

/**
 * Draws the color's details at the top left corner of the canvas, below the selected color.
 * @param {{h: number, s: number, l: number}} color The color
 */
function drawColorDetails(color) {
  ctx.fillStyle = 'black';
  ctx.font = '14px Roboto';
  ctx.fillText(`H: ${Math.floor(color.h)}, S: ${Math.floor(color.s * 100)}%, L: ${color.l * 100}%`, 15, 185);
  const rgb = hslToRgb(color);
  ctx.fillText(`R: ${Math.floor(rgb.r)}, G: ${Math.floor(rgb.g)}, B: ${Math.floor(rgb.b)}`, 15, 200);
  ctx.fillText(`#${rgbToHex(rgb)}`, 15, 215);
}

/**
 * Utility functions
 */

/**
 * Returns the distance of the given point (x, y) from the center of the canvas.
 * @param x The relative horizontal value of the point
 * @param y The relative vertical value of the point
 * @returns {number} The distance from the center in pixels
 */
function getDistanceFromCenter(x, y) {
  const offsetX = Math.abs(MIDDLE_X - x);
  const offsetY = Math.abs(MIDDLE_Y - y);
  // We use the Pythagorean theorem (a² + b² = c²) to calculate the distance.
  return Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
}

/**
 * Converts an HSL color to the RGB notation.
 * @param {{h: number, s: number, l: number}} The hsl color to convert
 * @returns {{r: number, g: number, b: number}} The rgb notation
 */
function hslToRgb({h, s, l}) {
  // This formula is documented at https://www.rapidtables.com/convert/color/hsl-to-rgb.html.
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  if (h < 60) return {r: (c + m) * 255, g: (x + m) * 255, b: m * 255};
  if (h < 120) return {r: (x + m) * 255, g: (c + m) * 255, b: m * 255};
  if (h < 180) return {r: m * 255, g: (c + m) * 255, b: (x + m) * 255};
  if (h < 240) return {r: m * 255, g: (x + m) * 255, b: (c + m) * 255};
  if (h < 300) return {r: (x + m) * 255, g: m * 255, b: (c + m) * 255};
  return {r: (c + m) * 255, g: m * 255, b: (x + m) * 255};
}

/**
 * Converts an RGB color to the hexadecimal notation.
 * @param {{r: number, g: number, b: number}} The rgb color to convert
 * @returns {string} The hexadecimal notation
 */
function rgbToHex({r, g, b}) {
  let hexR = Math.floor(r).toString(16);
  // We need to left pad numbers < 16
  if (r < 16) hexR = `0${hexR}`;
  let hexG = Math.floor(g).toString(16);
  if (g < 16) hexG = `0${hexG}`;
  let hexB = Math.floor(b).toString(16);
  if (b < 16) hexB = `0${hexB}`;
  return `${hexR}${hexG}${hexB}`.toUpperCase();
}

/**
 * Converts an angle in degrees to an angle in radians.
 * @param {number} deg The angle in degrees
 * @returns {number} The angle in radians
 */
function degreeToRadian(deg) {
  return deg * Math.PI / 180;
}

/**
 * Converts an angle in radians to an angle in degrees.
 * @param {number} rad The angle in radians
 * @returns {number} The angle in degrees
 */
function radianToDegree(rad) {
  return rad * 180 / Math.PI;
}
