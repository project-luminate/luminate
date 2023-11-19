import DatabaseManager from '../db/database-manager.js';
import * as d3 from 'd3';

function dimensionToColor(dimensions){
    // const numberOfColors = 30; // Change this to the desired number of colors
    // const colorScale = d3.scaleOrdinal().range(d3.range(numberOfColors));

    // const colors = colorScale.domain();

    // console.log(colors);
    const colors = [
        '#E74C3C',
        '#3498DB',
        '#1ABC9C',
        '#F39C12',
        '#9B59B6',
        '#2ECC71',
        '#34495E',
        '#16A085',
        '#E67E22',
        "#3498DB",
        "#2ECC71",
        "#F39C12",
        "#8E44AD",
        "#D35400",
        "#34495E",
        "#27AE60",
        "#7D3C98",
        "#D35400",
        "#8E44AD",
        "#3498DB",
        "#2ECC71",
        "#F39C12",
        "#8E44AD",
        "#D35400",
        '#FF5733',
        '#E74C3C',
        '#3498DB',
        '#1ABC9C',
        '#F39C12',
        '#9B59B6',
        '#2ECC71',
        '#34495E',
        '#16A085',
        '#E67E22',
        
    ];
    // if numerical dimension, then use the color scale of the same color
    // if categorical dimension, then use different color from the color palette
    var dimensionColorPairing = {};
    dimensions.forEach(dimension => {
        dimension = dimension["label"];
        const dim = DatabaseManager.getDimension("0",dimension);
        if (dim["type"] == "categorical"){ 
            const values = dim["values"];
            var valueToColor = {};
            for (var j = 0; j < values.length; j++){
                valueToColor[values[j]] = colors.pop();
            }
            dimensionColorPairing[dimension] = { "type": dim["type"], "map": valueToColor};
        } else { // numerical dimension
            dimensionColorPairing[dimension] = { "type": dim["type"], "map": colors.pop()};
        }
    });
    return dimensionColorPairing;

}

function dimensionToPosition(dimensions){
    /* 
        return a mapping of dimension to position for categorical dimensions
     */
    var dimensionPositionPairing = {};
    dimensions.forEach(dimension => {
        dimension = dimension["label"];
        const dim = DatabaseManager.getDimension("0",dimension);
        const values = dim["values"];
        if (dim["type"] == "categorical"){ 
            var valueToPosition = {};
            for (var j = 0; j < values.length; j++){
                valueToPosition[values[j]] = 500*j;
            }
            dimensionPositionPairing[dimension] = { "type": dim["type"], "map": valueToPosition};
            
        } else { // numerical dimension
            dimensionPositionPairing[dimension] = { "type": dim["type"], "map": values};

        }
    });
    return dimensionPositionPairing;
}

export default { dimensionToColor, dimensionToPosition};

