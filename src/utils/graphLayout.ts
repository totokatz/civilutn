export interface Point { x: number; y: number }

export function bezierPath(from: Point, to: Point): string {
  const dx = to.x - from.x
  const cp1x = from.x + dx * 0.4
  const cp2x = to.x - dx * 0.4
  return `M ${from.x} ${from.y} C ${cp1x} ${from.y}, ${cp2x} ${to.y}, ${to.x} ${to.y}`
}

export function getElementRight(el: HTMLElement, container: HTMLElement, zoom = 1): Point {
  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return {
    x: (elRect.right - containerRect.left) / zoom,
    y: (elRect.top - containerRect.top + elRect.height / 2) / zoom,
  }
}

export function getElementLeft(el: HTMLElement, container: HTMLElement, zoom = 1): Point {
  const elRect = el.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return {
    x: (elRect.left - containerRect.left) / zoom,
    y: (elRect.top - containerRect.top + elRect.height / 2) / zoom,
  }
}
