import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { RadialGradient } from "@visx/gradient";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Circle } from "@visx/shape";
import { VoronoiPolygon, voronoi } from "@visx/voronoi";
import { ERock } from "contracts/config/enums";
import { useMemo, useRef, useState } from "react";
import { components } from "src/network/components";
import { hashEntities } from "src/util/encode";

type DotPoint = {
  x: number;
  y: number;
  owner: Entity | undefined;
  size: number;
};

type DotsProps = {
  points: DotPoint[];
  width: number;
  height: number;
  view?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
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
  const width = Math.min(500, (maxX - minX) * 1.25);
  const height = Math.min(500, (maxY - minY) * 1.25);
  const edgeLength = Math.max(width, height);

  // Calculate new bounds
  const newMinX = centerX - edgeLength / 2;
  const newMaxX = centerX + edgeLength / 2;
  const newMinY = centerY - edgeLength / 2;
  const newMaxY = centerY + edgeLength / 2;

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

  return `#${hexR}${hexG}${hexB}`;
}

export const Minimap = () => {
  const hoverWidth = 450;
  const normalWidth = 300;
  const [hover, setHover] = useState<number>(normalWidth);
  const points = useEntityQuery([Has(components.Position), Has(components.RockType)]).map((entity) => {
    const rockType = components.RockType.get(entity)?.value;
    const position = components.Position.get(entity);
    const owner = components.OwnedBy.get(entity)?.value as Entity | undefined;
    return { ...position!, owner, size: rockType === ERock.Asteroid ? 4 : 2 };
  });
  const view = components.MapBounds.use();

  return (
    <div
      className={`card bg-neutral border border-secondary p-2 drop-shadow-2xl pointer-events-auto transition transition-all`}
      style={{ width: hover, height: hover }}
      onMouseEnter={(e) => {
        setHover(hoverWidth);
      }}
      onMouseLeave={() => {
        setHover(normalWidth);
      }}
    >
      <Voronoi points={points} width={hover} height={hover} view={view} />
    </div>
  );
};

export const Voronoi = ({ points, width, height, view }: DotsProps) => {
  if (width < 10) width = 100;
  const svgRef = useRef<SVGSVGElement>(null);

  const bounds = useMemo(() => calculateScaledBounds(points), [points]);

  const xScale = useMemo(() => {
    const scale = scaleLinear<number>({
      domain: [bounds.minX, bounds.maxX],
      range: [0, width - 1],
    });
    return scale;
  }, [width, bounds.minX, bounds.maxX]);

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [bounds.minY, bounds.maxY],
        range: [height + 1, 0],
      }),
    [height, bounds.minY, bounds.maxY]
  );

  console.log(`bounds: ${bounds.minX} ${bounds.maxX} ${bounds.minY} ${bounds.maxY}`);
  view &&
    console.log(
      `view: ${JSON.stringify(view)} ${xScale(view.x)} ${yScale(view.y)} ${xScale(view.width)} ${yScale(view.height)}}`
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

  const scaleToBounds = ({ width: w, height: h }: { width: number; height: number }) => ({
    w: (w / (bounds.maxX - bounds.minX)) * width,
    h: (h / (bounds.maxY - bounds.minY)) * height,
  });

  return (
    <svg width={"100%"} height={"100%"} ref={svgRef} color="black">
      <RadialGradient id="bg-gradient" from="#030305" to="0E0E19" />;{/** capture all mouse events with a rect */}
      <rect width={width} height={height} fill="url(#bg-gradient)" />
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
                  fillOpacity={0.1}
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
                r={point.size}
                fill={"white"}
                stroke={entityToColor(point.owner)}
              />
            ) as any
        )}
      </Group>
      {view && (
        <rect
          x={xScale(view.x)}
          y={yScale(-view.y)}
          width={scaleToBounds(view).w}
          height={scaleToBounds(view).h}
          fill="rgba(255,255,255,10%)"
          stroke="white"
          strokeWidth={1}
          strokeDasharray="4,4"
        />
      )}
    </svg>
  );
};
