import { hexAvgCatNum, hexAvgTwoCat, hexAvgTwoNum, normalizedValue } from "../../../util/color-util";
import { colors } from "../../../util/util";

export interface Label {
  dimensionId: number;
  name: string;
  type: 'categorical' | 'numerical' | 'ordinal';
}

export interface Dimension {
  id: number;
  name: string;
  type: 'null' | 'categorical' | 'numerical' | 'ordinal';
  filtered: string[]; // always a subset of values
  values: string[];
}

export const nullDimension: Dimension = {
  id: -1,
  name: '',
  type: 'null',
  filtered: [],
  values: [],
}

export interface Axes {
  x: Dimension,
  y: Dimension,
}

export const dimensionsToAxes = (dimensions: Dimension[]): Axes => {
  const [dim1, dim2] = dimensions;
  return {
    x: dim1??nullDimension,
    y: dim2??nullDimension,
  }
}

export const ordinalRange: [number, number] = [0,5];

export const nodeColor = (node: any, axes: Axes) => {
  if (axes.x.type === 'categorical' && axes.y.type === 'categorical') {
    // y axis colors are just the next set of colors after the x set
    return hexAvgTwoCat(
      colors[dimensionIndex(node, axes.x)],
      colors[axes.x.values.length+dimensionIndex(node, axes.y)]
    );
  } else if (axes.x.type === 'ordinal' && axes.y.type === 'categorical') {
    return hexAvgCatNum(
      colors[axes.x.values.length+dimensionIndex(node, axes.y)],
      normalizedValue(ordinalRange, getOrdinalLabelOrder(node, axes.x))
    );
  } else if (axes.x.type === 'categorical' && axes.y.type === 'ordinal') {
    return hexAvgCatNum(
      colors[dimensionIndex(node, axes.x)+1],
      normalizedValue(ordinalRange, getOrdinalLabelOrder(node, axes.y))
    );
  } else if (axes.x.type === 'ordinal' && axes.y.type === 'ordinal') {
    return hexAvgTwoNum(
      colors[getDimensionOrder(node, axes.x)],
      colors[getDimensionOrder(node, axes.y)],
      normalizedValue(ordinalRange, getOrdinalLabelOrder(node, axes.x)),
      normalizedValue(ordinalRange, getOrdinalLabelOrder(node, axes.y))
    )
  } else if (axes.x.type === 'categorical' && axes.y.type === 'numerical') {
    return hexAvgCatNum(
      colors[dimensionIndex(node, axes.x)],
      normalizedValue(axes.y.values as unknown as [number, number], node.Dimension.numerical[axes.y.name])
    );
  } else if (axes.x.type === 'numerical' && axes.y.type === 'categorical') {
    return hexAvgCatNum(
      colors[axes.x.values.length+dimensionIndex(node, axes.y)],
      normalizedValue(axes.x.values as unknown as [number, number], node.Dimension.numerical[axes.x.name])
    );
  } else if (axes.x.type === 'numerical' && axes.y.type === 'numerical') {
    return hexAvgTwoNum(
      colors[getDimensionOrder(node, axes.x)],
      colors[getDimensionOrder(node, axes.y)],
      normalizedValue(axes.x.values as unknown as [number, number], node.Dimension.numerical[axes.x.name]),
      normalizedValue(axes.y.values as unknown as [number, number], node.Dimension.numerical[axes.y.name])
    )
  } else if (axes.x.type === 'categorical') {
    return colors[dimensionIndex(node, axes.x)];
  } else if (axes.x.type === 'ordinal') {
    return hexAvgCatNum(
      colors[getDimensionOrder(node, axes.x)],
      normalizedValue(ordinalRange, getOrdinalLabelOrder(node, axes.x))
    );
  } else if (axes.x.type === 'numerical') {
    return hexAvgCatNum(
      colors[getDimensionOrder(node, axes.x)],
      normalizedValue(axes.x.values as unknown as [number, number], node.Dimension.numerical[axes.x.name])
    );
  } else {
    return '';
  }
}

export const getOrdinalLabelOrder = (node: any, dimension: Dimension) => {
  return dimension.values.indexOf(node.Dimension.ordinal[dimension.name])
}

export const getDimensionOrder = (node: any, dimension: Dimension) => {
  if (dimension.id === -1) return 0;
  const dimensions = Object.keys(node.Dimension[dimension.type]);
  return dimensions.indexOf(dimension.name) ?? 0;
}

export const dimensionIndex = (node: any, dimension: Dimension) => {
  return dimension.values.indexOf(node.Dimension[dimension.type][dimension.name]);
}

/**
 * Given a numercal dimension and nodes, find the numerical range [min, max] of the dimension
 * @returns [min, max]
 */
export const getNumericalDimensionRange = (dimension: Dimension, nodes: any[]) => {
  if (dimension.type !== 'numerical') return [0,0];

  let [min, max] = [Infinity, 0];
  nodes.forEach(node => {
    max = Math.max(max, node.Dimension.numerical[dimension.name])
    min = Math.min(min, node.Dimension.numerical[dimension.name])
  })
  return [min, max];
}

/**
 * Normalizes value to be in range [0,1]
 */
export const normalize = ([min, max]: [number, number], value: number) => {
  return (value - min) / (max - min)
}