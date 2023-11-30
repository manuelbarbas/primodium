import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { RadialGradient } from "@visx/gradient";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Circle } from "@visx/shape";
import { VoronoiPolygon, voronoi } from "@visx/voronoi";
import { useMemo, useRef } from "react";
import { components } from "src/network/components";
import { hashEntities } from "src/util/encode";
import { Card } from "../core/Card";

type DotPoint = {
  x: number;
  y: number;
  owner: Entity | undefined;
};
type DotsProps = {
  points: DotPoint[];
  width: number;
  height: number;
  showControls?: boolean;
};

function calculateScaledBounds(coords: Coord[]): { minX: number; maxX: number; minY: number; maxY: number } {
  if (coords.length === 0) {
    throw new Error("The array of coordinates is empty.");
  }

  let minX = coords[0].x;
  let maxX = coords[0].x;
  let minY = coords[0].y;
  let maxY = coords[0].y;

  // Find min and max bounds
  coords.forEach((coord) => {
    if (coord.x < minX) minX = coord.x;
    if (coord.x > maxX) maxX = coord.x;
    if (coord.y < minY) minY = coord.y;
    if (coord.y > maxY) maxY = coord.y;
  });

  // Calculate center
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Scale bounds by 1.25
  const width = (maxX - minX) * 1.25;
  const height = (maxY - minY) * 1.25;

  // Calculate new bounds
  const newMinX = centerX - width / 2;
  const newMaxX = centerX + width / 2;
  const newMinY = centerY - height / 2;
  const newMaxY = centerY + height / 2;

  return { minX: newMinX, maxX: newMaxX, minY: newMinY, maxY: newMaxY };
}

function entityToColor(address: Entity | undefined) {
  if (!address) return "#000000";
  const hash = hashEntities(address);

  // Define the step size for quantization
  const stepSize = 16; // Adjust this value to control the granularity

  // Extract and quantize characters from the address to create RGB values
  const r = Math.floor((parseInt(hash.substring(2, 8), 16) % 256) / stepSize) * stepSize;
  const g = Math.floor((parseInt(hash.substring(8, 14), 16) % 256) / stepSize) * stepSize;
  const b = Math.floor((parseInt(hash.substring(14, 20), 16) % 256) / stepSize) * stepSize;

  // Convert to hexadecimal and pad with zeros if necessary
  const hexR = r.toString(16).padStart(2, "0");
  const hexG = g.toString(16).padStart(2, "0");
  const hexB = b.toString(16).padStart(2, "0");

  console.log(`#${hexR}${hexG}${hexB}`);
  return `#${hexR}${hexG}${hexB}`;
}

export const Minimap = ({ width = 800, height = 800 }: { width?: number; height?: number }) => {
  const points = useEntityQuery([Has(components.Position), Has(components.RockType)]).map((entity) => {
    const position = components.Position.get(entity);
    const owner = components.OwnedBy.get(entity)?.value as Entity | undefined;
    return { ...position!, owner };
  });
  console.log("points:", points);
  return (
    <Card className="flex flex-col gap-1">
      <Voronoi points={points} width={width} height={height} />
    </Card>
  );
};

export const Voronoi = ({ points, width, height }: DotsProps) => {
  if (width < 10) width = 100;
  const svgRef = useRef<SVGSVGElement>(null);

  const bounds = useMemo(() => calculateScaledBounds(points), [points]);

  const xScale = useMemo(() => {
    const scale = scaleLinear<number>({
      domain: [bounds.minX, bounds.maxX],
      range: [0, width],
      clamp: true,
    });
    return scale;
  }, [width, bounds.minX, bounds.maxX]);

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [bounds.minY, bounds.maxY],
        range: [height, 0],
        clamp: true,
      }),
    [height, bounds.minY, bounds.maxY]
  );

  const voronoiLayout = useMemo(
    () =>
      voronoi<DotPoint>({
        x: (d) => xScale(d.x) ?? 0,
        y: (d) => yScale(d.y) ?? 0,
        width,
        height,
      })(points),
    [width, height, xScale, yScale, points]
  );

  return (
    <svg width={width} height={height} ref={svgRef} color="black">
      <RadialGradient id="bg-gradient" from="#000" to="#555" />;{/** capture all mouse events with a rect */}
      <rect width={width} height={height} rx={14} fill="url(#bg-gradient)" />
      <Group pointerEvents="none">
        {voronoiLayout
          .polygons()
          .map(
            (polygon, i) =>
              (
                <VoronoiPolygon
                  key={`polygon-${i}`}
                  polygon={polygon}
                  fill={entityToColor(polygon.data.owner)}
                  fillOpacity={0.7}
                  stroke="white"
                  strokeWidth={1}
                  strokeOpacity={0.2}
                />
              ) as any
          )}
        {points.map(
          (point, i) =>
            (
              <Circle
                key={`point-${point.x}-${i}`}
                className="dot"
                cx={xScale(point.x)}
                cy={yScale(point.y)}
                r={i % 3 === 0 ? 2 : 3}
                fill={"white"}
                stroke={entityToColor(point.owner)}
              />
            ) as any
        )}
      </Group>
    </svg>
  );
};
