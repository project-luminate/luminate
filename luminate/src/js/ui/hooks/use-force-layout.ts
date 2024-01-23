import * as d3 from 'd3';
import { useEffect, useReducer, useRef } from 'react';
import { Axes, Dimension, dimensionIndex, getNumericalDimensionRange, normalize } from '../components/scatter-space/scatter-space.helper';

const strength = -150;
const alpha = 0.1;

export const useForceLayout = (
  boardRect: DOMRect | undefined,
  autolayout: boolean,
  blockMap: {[ID: string]: any},
  setBlockMap: any,
  zoom: number,
  cursorPosition: { x: number; y: number },
  axes: Axes,
) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const dimForce = (dimension: Dimension) => {
    if (dimension.type === 'numerical') return 0.08;
    return dimension.type === 'categorical' ? 0.05 : 0.03;
  }

  useEffect(() => {
    // Setup forces only if autolayout is true
    const simulation = d3.forceSimulation();

    simulation
      .nodes(Object.values(blockMap).map((block, index) => {
        return block;
      }))
      .force('charge', d3.forceManyBody().strength(strength))
      .force('collide', d3.forceCollide().radius(axes.x.type === 'categorical' ? 20 : 20))
      // .force('center', customClusterForce(simulation, axes.x.type === 'categorical' ? 10 : 1))
      .force('center', axesClusterForce(simulation, axes))
      .force('x', d3.forceX().x(0).strength(dimForce(axes.x)))
      .force('y', d3.forceY().y(0).strength(dimForce(axes.y)));

    simulation
      .alpha(1)
      // .alphaDecay(0.04)
      .restart();

    if (Object.values(blockMap).length === 0) return;
    simulation.on('tick', () => {
      const updatedBlockMap: {[ID: string]: any} = blockMap;

      Object.values(blockMap).forEach((block, index) => {

        let newX = simulation.nodes()[index]?.x ?? block.x ?? 0;
        let newY = simulation.nodes()[index]?.y ?? block.y ?? 0;

        updatedBlockMap[block.ID] = {
          ...block,
          x: newX,
          y: newY,
          // vx: block.vx ? block.vx*0.4 : 0,
          // vy: block.vy ? block.vy*0.4 : 0,
        };
      });
      setBlockMap(updatedBlockMap);
      forceUpdate();
    });


    // setTimeout(() => {
    //   console.log('stoppping', simulation.stop());
    // }, 1000)

    // Clean up function to stop the simulation when the component unmounts
    return () => {
      simulation.stop();
    };
  }, [boardRect?.width, boardRect?.height, blockMap, autolayout, strength, axes.x, axes.y]);

  function axesClusterForce(simulation, axes: Axes) {
    // Conditions:
    // x: cat -> count

    console.log(axes)
    const force = (alpha) => {
      if (boardRect) {

        // const clusterWidth = boardRect.width / n;
        // const clusterHeight = boardRect.height / n;

        simulation.nodes().forEach((node, index) => {
          const targetX = dimensionClusterForce('x', axes.x, boardRect, node);
          const targetY = dimensionClusterForce('y', axes.y, boardRect, node);

          if (node && node.x && node.y && node.vx && node.vy) {
            node.vx += (targetX - node.x) * alpha * 0.12;
            node.vy += (targetY - node.y) * alpha * 0.12;
          }
        });
      }
    };
    return force;
  };

  return;// { startSimulation: simulation.restart, stopSimulation: simulation.stop }
};

/**
 * Given the axis dimension and the node, return the target position it should move to.
 * @param axisDimension 
 * @returns target
 * Categorical: expression includes: (index % n), (boardRect.{size} / n), (boardRect.{size}/2)
 * Numerical: expression includes: (index / n), (boardRect.{size} / n), (boardRect.{size}/2)
 * Null: boardRect.{size}/2
 */
const dimensionClusterForce = (
  axis: 'x' | 'y', axisDimension: Dimension, boardRect: DOMRect, node: any,
) => {
  const size = axis === 'x' ? boardRect.width*0.8 : boardRect.height*0.8;
  if (axisDimension.type === 'categorical') {
    const n = axisDimension.values.length+1; // Number of labels
    const targetCluster = dimensionIndex(node, axisDimension) % n;
    return (targetCluster) * (size/n) - size/2 + 0.1*size;
  } else if (axisDimension.type === 'ordinal') {
    const n = axisDimension.values.length+1; // Number of labels
    const targetCluster = axis === 'y' ? (5-(dimensionIndex(node, axisDimension) % n)) : dimensionIndex(node, axisDimension) % n;
    return (targetCluster) * (size/n) - size/2 + 0.1*size;
  } else if (axisDimension.type === 'numerical') {
    const
      min = parseFloat(axisDimension.values[0]),
      max = parseFloat(axisDimension.values[1])// If numerical, values are the min and max.
    return normalize(axis === 'x' ? [min, max] : [max, min], node.Dimension.numerical[axisDimension.name]) * size - size/2;
    // Convert the node value to floating point: 0~1.
  }
  // this axis doesn't exist, so center the cluster in this axis.
  // Or if anything else goes wrong, just put in the center.
  return 0;//axis === 'x' ? 0 : size/2;
}
