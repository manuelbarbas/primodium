import { defaultEntity, Entity } from "@primodiumxyz/reactive-tables";
import { Tables } from "@/lib/types";
import { hslToHex } from "@/utils/global/color";
import { hashEntities } from "@/utils/global/encode";

export function createColorUtils(tables: Tables) {
  const entityColor = new Map<Entity, string>();

  /**
   * Get color for entity
   * @param entity entity to get color for
   * @returns color for entity
   * */
  function getEntityColor(entity: Entity | undefined) {
    if (!entity || entity === defaultEntity) return "#999999";
    const alliance = tables.PlayerAlliance.get(entity)?.alliance as Entity;
    entity = alliance ?? entity;
    if (entity === tables.Account.get()?.value) return "#22d3ee";
    if (entityColor.has(entity)) return entityColor.get(entity) as string;
    const hash = hashEntities(entity);

    // Define the step size for quantization
    const numColors = 256;
    const stepSize = Math.round(256 / numColors); // Adjust this value to control the granularity

    // Extract and quantize characters from the address to create RGB values
    const h = Math.floor((parseInt(hash.substring(60, 66), 16) % 256) / stepSize) * stepSize;
    const s = Math.max(50, Math.floor((parseInt(hash.substring(54, 60), 16) % 100) / stepSize) * stepSize);
    const l = Math.max(60, Math.floor((parseInt(hash.substring(48, 54), 16) % 100) / stepSize) * stepSize);

    const color = hslToHex(h / 360, s / 100, l / 100);
    entityColor.set(entity, color);
    return color;
  }

  return {
    getEntityColor,
  };
}
