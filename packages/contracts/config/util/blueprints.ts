export function getIntArray(coords: { x: number; y: number }[]) {
  return coords.reduce((prev: number[], { x, y }) => [...prev, x, y], []);
}

export function getBlueprint(width: number, height: number) {
  //write a function that takes in width and height and returns a blueprint
  //that is width x height
  const blueprint = [];
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      blueprint.push({ x: -x, y: -y });
    }
  }
  return getIntArray(blueprint);
}

/*
    X X  
  X X X X  
X X X X X X 
X X X X X X 
  X X X X  
    X X 
*/

export const wormholeBlueprint = getIntArray([
  { x: 2, y: 0 },
  { x: 3, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 3, y: 1 },
  { x: 4, y: 1 },
  { x: 0, y: 2 },
  { x: 1, y: 2 },
  { x: 2, y: 2 },
  { x: 3, y: 2 },
  { x: 4, y: 2 },
  { x: 5, y: 2 },
  { x: 0, y: 3 },
  { x: 1, y: 3 },
  { x: 2, y: 3 },
  { x: 3, y: 3 },
  { x: 4, y: 3 },
  { x: 5, y: 3 },
  { x: 1, y: 4 },
  { x: 2, y: 4 },
  { x: 3, y: 4 },
  { x: 4, y: 4 },
  { x: 2, y: 5 },
  { x: 3, y: 5 },
]);
