export interface Point {
  x: number
  y: number
}

export interface Camera {
  x: number
  y: number
  z: number
}

export interface Box {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export const screenToCanvas = (point: Point, camera: Camera): Point => {
  return {
    x: point.x / camera.z - camera.x,
    y: point.y / camera.z - camera.y,
  }
}

export const canvasToScreen = (point: Point, camera: Camera): Point => {
  return {
    x: (point.x + camera.x) * camera.z,
    y: (point.y + camera.y) * camera.z,
  }
}

export const getViewport = (camera: Camera, box: Box): Box => {
  const topLeft = screenToCanvas({ x: box.minX, y: box.minY }, camera)
  const bottomRight = screenToCanvas({ x: box.maxX, y: box.maxY }, camera)

  return {
    minX: topLeft.x,
    minY: topLeft.y,
    maxX: bottomRight.x,
    maxY: bottomRight.y,
    height: bottomRight.x - topLeft.x,
    width: bottomRight.y - topLeft.y,
  }
}

export const getViewportFromRect = (camera: Camera, rect: DOMRect) => getViewport(camera, {
  minX: rect.left,
  minY: rect.top,
  maxX: rect.right,
  maxY: rect.bottom,
  width: rect.width,
  height: rect.height,
})

export const identityViewport: Box = {
  minX: 0,
  minY: 0,
  maxX: 0,
  maxY: 0,
  width: 0,
  height: 0,
}

export const panCamera = (camera: Camera, dx: number, dy: number): Camera => {
  return {
    x: camera.x - dx / camera.z,
    y: camera.y - dy / camera.z,
    z: camera.z,
  }
}

export const zoomCamera = (camera: Camera, point: Point, box: Box, dz: number): Camera => {
  const zoom = (camera.z + dz * camera.z)

  const p1 = screenToCanvas(point, camera)

  const p2 = screenToCanvas(point, { ...camera, z: zoom })

  return {
    // x: Math.min(box.maxX, Math.max(0, zoom <= 1 ? 0 : camera.x - (p2.x - p1.x))),
    // y: Math.min(box.maxY, Math.max(0, zoom <= 1 ? 0 : camera.y - (p2.y - p1.y))),
    x: zoom <= 1 ? 0 : camera.x - (p2.x - p1.x),
    y: zoom <= 1 ? 0 : camera.y - (p2.y - p1.y),
    z: Math.max(1, zoom),
  }
}
