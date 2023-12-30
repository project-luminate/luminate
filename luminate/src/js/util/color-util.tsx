function hexToRgb(hex) {
    if (!hex) return { red:224,green:224,blue:224 };

    // Remove the hash at the start if it's there
    hex = hex.charAt(0) === '#' ? hex.slice(1) : hex;

    // Parse r, g, b values
    const bigint = parseInt(hex, 16);
    const red = Math.round((bigint >> 16) & 255);
    const green = Math.round((bigint >> 8) & 255);
    const blue = Math.round(bigint & 255);

    return { red, green, blue };
}

export function rgbToHex(rgb) {
    function toHex(value) {
        const intValue = Math.round(value); // Ensure no floating point values
        let hex = intValue.toString(16); 
        return hex.length == 1 ? "0" + hex : hex;
    }
    return "#" + toHex(rgb.red) + toHex(rgb.green) + toHex(rgb.blue);
}


const rgbArrayToHex = (rgb) => {
    return rgbToHex({
        red: rgb[0],
        green: rgb[1],
        blue: rgb[2],
    });
}
// two categorical
function colAvg(a, b) {
    return [(a[0] + b[0]) / 2,
            (a[1] + b[1]) / 2,
            (a[2] + b[2]) / 2,
           ]
}

// Instead of linear, lets make it quartic, so that the colors in the center are not suprt dark.
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function easeInOutQuartic(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function myLerp(a, b, t) {
    const easedT = easeInOutQuad(t);
    return Math.round(a * (1 - easedT) + b * easedT);
}


function colLerp(V, W, t) {
    return [myLerp(V[0], W[0], t),
            myLerp(V[1], W[1], t),
            myLerp(V[2], W[2], t),
           ]
}

// one categorical, one numerical
export function getColor(color: string, t: number) {
    const white = { red: 255, green: 255, blue: 255 };
    const Rgb = hexToRgb(color);
    const rgbArray = [Rgb.red, Rgb.green, Rgb.blue];
    return colLerp(white, rgbArray, t);
}

// two numerical
export function get2DColor (colorA, colorB, xT, yT){
    let O = [255,255,255]
    let RgbA = hexToRgb(colorA)
    let A = [RgbA.red, RgbA.green, RgbA.blue]
    let RgbB = hexToRgb(colorB)
    let B = [RgbB.red, RgbB.green, RgbB.blue]
    let cX = colLerp(O, A, xT)
    let cY = colLerp(O, B, yT)
    return colAvg(cX, cY)
}

// All T values are range from [0~1]

export const hexAvgTwoCat = (a, b) => {
    const {red: ra, green: ga, blue: ba} = hexToRgb(a)
    const {red: rb, green: gb, blue: bb} = hexToRgb(b)
    return rgbToHex({
        red: (ra+rb)/2,
        green: (ga+gb)/2,
        blue: (ba+bb)/2,
    });
}

export const hexAvgCatNum = (c, n) => {
    const gray = [224, 224, 224];
    const rgbC = hexToRgb(c);
    const interpolatedRgb = colLerp(gray, [rgbC.red, rgbC.green, rgbC.blue], n);
    return rgbToHex({red: interpolatedRgb[0], green: interpolatedRgb[1], blue: interpolatedRgb[2]});
}

// export const hexAvgTwoNum = (a, b, aT, bT) => {
//     let rgbA = hexToRgb(a);
//     let A = [rgbA.red, rgbA.green, rgbA.blue];

//     let rgbB = hexToRgb(b);
//     let B = [rgbB.red, rgbB.green, rgbB.blue];

//     let cX = colLerp(A, B, aT);
//     let cY = colLerp(A, B, bT);
    
//     // Assuming you have a colAvg function that averages two RGB arrays
//     let averageRgb = colAvg(cX, cY);
//     return rgbArrayToHex(averageRgb);
// }
export const hexAvgTwoNum = (a, b, aT, bT) => {
    const gray = [224, 224, 224];

    let rgbA = hexToRgb(a);
    let A = [rgbA.red, rgbA.green, rgbA.blue];

    let rgbB = hexToRgb(b);
    let B = [rgbB.red, rgbB.green, rgbB.blue];

    // Interpolate between gray and a based on aT
    let cA = colLerp(gray, A, aT);
    // Interpolate between gray and b based on bT
    let cB = colLerp(gray, B, bT);

    const abT = bT/(aT+bT)

    // Interpolate between cA and cB to get the final color
    let finalColor = colLerp(cA, cB, abT);

    return rgbArrayToHex(finalColor);
}

/**
 * Given two colors, two normalized values, return the balanced average between the two colors.
 * If both 0, return gray, if both 1 return even mix of both colors. If 1,0, return color 1, if 0,1, return color 2.
 */
// export const hexAvgTwoAxes = () => {

//     hexAvgCatNum(
//         colors[getDimensionOrder(node, axes.x)],
//         normalizedValue(ordinalRange, getOrdinalLabelOrder(node, axes.x))
//       );
  
//       // Update such that there are two axes 

// }


export const normalizedValue = ([min, max], v) => {
    return (v - min) / (max - min);
}
