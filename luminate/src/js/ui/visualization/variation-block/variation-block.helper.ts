import { labelIsFilteredIn } from "../axis/axis.helper";
import { Dimension } from "../scatter-space/scatter-space.helper";

export const blockIsFilteredIn = (dimensionMap: {[id: string]: Dimension}, block: any) => {
  let flag = true;
  Object.values(dimensionMap).forEach(dimension => {
    if (dimension.filtered && dimension.filtered.length > 0) {
      flag = flag && dimension.filtered.includes(block.Dimension[dimension.type][dimension.name])
    }
  })
  return flag;
}

export const allDimensionFiltersOff = (dimensionMap: {[id: string]: Dimension}) => {
  let flag = true;
  Object.values(dimensionMap).forEach(dimension => {
    if (dimension.filtered && dimension.filtered.length > 0) {
      flag = false;
    }
  })
  return flag;
}