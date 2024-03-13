import { hexAvgCatNum, normalizedValue } from "../../../util/color-util";
import { colors } from "../../../util/util";
import { Dimension, getDimensionOrder, ordinalRange } from "../scatter-space/scatter-space.helper";

/**
 * Given nodes, dimension, and axis, return the average position of the nodes
 */
export const getCenterAxisLabelFromNodes = (axis: 'x' | 'y', nodes: any[], dimension: Dimension, dimensionValue: string) => {
  let total = 0, nodeCount = 0;
  nodes
    .filter(node => node.Dimension[dimension.type][dimension.name] === dimensionValue)
    .forEach(node => {
      total += axis === 'x' ? node.x : node.y;
      ++nodeCount;
    })
  return total / nodeCount;
}

export const getNumericalAxisSteps = (dimension: Dimension, length: number) => {
  if (dimension.type !== 'numerical') return [0,1];
  const [min, max] = (dimension.values as unknown) as [number, number];
  const step = (max - min) / (length);
  return Array.from({ length: length+1 }, (_, i) => min + i * step);
}

export const numAxisSteps = (zoom: number) => {
  // if (zoom <= 1.5) return 10;
  if (zoom <= 3) return 10;
  // if (zoom <= 5) return 40;
  if (zoom <= 10) return 30;
  return 60;
}

export const getAxisLabelColor = (dummyNode: any, catI: number, i: number, dimension: Dimension) => {
  return dimension.type === 'categorical'
    ? darkenHexColor(colors[catI])
    : darkenHexColor(hexAvgCatNum(
        colors[getDimensionOrder(dummyNode, dimension)],
        normalizedValue(ordinalRange, i)
      ), 50)
}

export const darkenHexColor = (hex, shade=30) => {
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
      throw new Error('Invalid HEX color.');
  }

  let color = hex.slice(1); // Remove #

  // If it's a 3 character hex, expand it
  if (color.length === 3) {
      color = color.split('').map(ch => ch + ch).join('');
  }

  const decimalColors = {
      red: parseInt(color.substring(0, 2), 16),
      green: parseInt(color.substring(2, 4), 16),
      blue: parseInt(color.substring(4, 6), 16)
  };

  // Decrease each color channel
  for (const color in decimalColors) {
      decimalColors[color] = Math.max(0, decimalColors[color] - shade);
  }

  // Convert back to hex
  return "#" + ((1 << 24) + (decimalColors.red << 16) + (decimalColors.green << 8) + decimalColors.blue).toString(16).slice(1).toUpperCase();
}

export const labelIsFilteredIn = (dimension: Dimension, label: string, nullIsTrue?: boolean) => {
  if (nullIsTrue && !dimension.filtered) return true;
  return dimension.filtered?.includes(label)
}