import { primodium } from "@game/api";
import { Scenes } from "@game/constants";
import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { RadialGradient } from "@visx/gradient";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Circle } from "@visx/shape";
import { VoronoiPolygon, voronoi } from "@visx/voronoi";
import { ERock } from "contracts/config/enums";
import { ReactNode, useMemo, useRef } from "react";
import { components } from "src/network/components";
import { entityToColor } from "src/util/color";

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
  onCoordinateClick?: (coord: Coord) => void;
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
  const width = (maxX - minX) * 1.2;
  const height = (maxY - minY) * 1.2;
  const edgeLength = Math.max(width, height);

  // Calculate new bounds
  const newMinX = centerX - edgeLength / 2;
  const newMaxX = centerX + edgeLength / 2;
  const newMinY = centerY - edgeLength / 2;
  const newMaxY = centerY + edgeLength / 2;

  return { minX: newMinX, maxX: newMaxX, minY: newMinY, maxY: newMaxY };
}

export const Minimap = () => {
  const points = useEntityQuery([Has(components.Position), Has(components.RockType)]).map((entity) => {
    const rockType = components.RockType.get(entity)?.value;
    const position = components.Position.get(entity);
    const owner = components.OwnedBy.get(entity)?.value as Entity | undefined;
    return { ...position!, owner, size: rockType === ERock.Asteroid ? 3 : 2 };
  });

  const onCoordinateClick = (coord: Coord) => {
    const { pan } = primodium.api(Scenes.Starmap).camera;
    pan(coord);
  };
  const { hooks, scene } = primodium.api(Scenes.Starmap);
  const rawView = hooks.useCamera().worldView;
  const view = useMemo(() => {
    const tilemap = scene.getConfig(Scenes.Starmap)?.tilemap;
    if (!rawView || !tilemap) return undefined;
    const { x, y } = pixelCoordToTileCoord({ x: rawView.x, y: rawView.y }, tilemap.tileWidth, tilemap.tileHeight);
    const { x: width, y: height } = pixelCoordToTileCoord(
      { x: rawView.width, y: rawView.height },
      tilemap.tileWidth,
      tilemap.tileHeight
    );
    return {
      x,
      y,
      width,
      height,
    };
  }, [rawView, scene]);

  return (
    <div
      className={`card bg-neutral relative border border-secondary p-2 drop-shadow-2xl pointer-events-auto transition transition-all`}
      style={{ width: 300, height: 300 }}
    >
      <Voronoi points={points} width={300} height={300} view={view} onCoordinateClick={onCoordinateClick} />
    </div>
  );
};

export const Voronoi = ({ points, width, height, view, onCoordinateClick }: DotsProps) => {
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

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const scaleX = (bounds.maxX - bounds.minX) / rect.width;
    const scaleY = (bounds.maxY - bounds.minY) / rect.height;

    const x = bounds.minX + (event.clientX - rect.left) * scaleX;
    const y = bounds.maxY - (event.clientY - rect.top) * scaleY;

    onCoordinateClick?.({ x, y });
  };

  return (
    <svg width={"100%"} height={"100%"} ref={svgRef} color="black" onClick={handleSvgClick}>
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
                  fillOpacity={0.3}
                  stroke="white"
                  strokeWidth={1}
                  strokeOpacity={0.2}
                />
              ) as unknown as ReactNode[]
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
                stroke={"white"}
                fill={entityToColor(point.owner)}
              />
            ) as unknown as ReactNode[]
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
