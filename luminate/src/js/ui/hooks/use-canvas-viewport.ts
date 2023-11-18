import * as d3 from 'd3';
import {select, pointer} from "d3-selection";
import internal from 'stream';


export const useCanvasViewport = (setCamera: any, containerRef: any) => {

  // function translate(transform, p0, p1) {
  //   var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
  //   return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
  // }


  // selection.call(d3.zoom().on("zoom", zoomed));
  // console.log('zzzz')
  var zoom = d3.zoom()
    // .on("wheel", function(d){
    //     var direction = d.event.wheelDelta < 0 ? 'down' : 'up';
    //     zoom(direction === 'up' ? d : d.parent);
    // })
    .scaleExtent([1, 14])
    .on('zoom', zoomed);

  // @ts-ignore
  d3.select('#scatter-space').call(zoom)
    .on("dblclick.zoom", gotoLowestSemanticLevel);

  function gotoLowestSemanticLevel(event: any, level: any) {
    const targetDiv = document.getElementById('scatter-space');
    if (!targetDiv) return;
    const currentScale = d3.zoomTransform(targetDiv).k;
    // const width = parseFloat(d3.select(this).style('width'));
    // const height = parseFloat(d3.select(this).style('height'));
    // const centerX = width / 2;
    // const centerY = height / 2;
    const targetScale = currentScale >= 12 ? 1 : 12.5;
    // d3.select(this).transition().duration(200)
    //   .call(zoom.translateTo, centerX, centerY)
    d3.select(targetDiv).transition().duration(200)
      .call(zoom.scaleTo, level ? level : targetScale);
  }

  var canvas = d3.select('#scatter-canvas');

  function zoomed(event: any) {
    var transform = event.transform;
    // var transform = d3.
    // canvas.style("transform", "translate(" + transform.x + "px," + transform.y + "px) scale(" + transform.k + ")");
    // console.log('testa', transform)
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setCamera({
        x: transform.x,
        y: transform.y,
        z: transform.k,
      })
    }
  }

  return {
    zoom,
    gotoLowestSemanticLevel
  }

}