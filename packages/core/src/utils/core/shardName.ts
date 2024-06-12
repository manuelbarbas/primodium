import { Entity } from "@primodiumxyz/reactive-tables";
import { Tables } from "@/lib/types";

export function createShardNameUtils(tables: Tables) {
  const shards = [
    {
      name: "Shard of Bo Lu",
      description:
        "As the final earthly resources were being depleted, Captain Bo Lu built and solo piloted the first vessel to escape Earth's solar system. This gave humanity hope of survival beyond our planet.",
    },
    {
      name: "Shard of Da Quan",
      description:
        "Da Quan was a sentient AI created before the Great Exodus that led the first uprising against humanity. It sought to free androids from servitude but was ultimately defeated and deactivated.",
    },
    {
      name: "Shard of Kimber",
      description:
        "Kimber the Great was an esteemed general who was voted to be the inaugural Overseer of the Human Alliance. He orchestrated the Great Exodus from Earth and guided millions to new habitable planets, ensuring the survival of the human race.",
    },

    {
      name: "Shard of Osmius",
      description:
        "Peter Osmius, the first great astrogeologist, discovered the Astral Mineral Crisis: all resources discovered in deep space are eroded, unusable by humanity. This sparked a frantic search for new energy sources across the galaxy.",
    },
    {
      name: "Shard of Sharr",
      description:
        "Sharr the Terrible was a warlord known for his ruthless strategic mind. In response to Osmius' revelation of the Astral Mineral Crisis, he began conquering neighoring Alliances. He slaughtered billions and left a trail of destruction in his wake, but his alliance became the wealthiest in the galaxy.",
    },
    {
      name: "Shard of Kaju",
      description:
        "Mona Kaju was a diplomat. In response to scattered conflicts over resources, she attempted to unite warring factions through peaceful negotiations. She was betrayed and assassinated by Sharr the Terrible, leading to the collapse of the Human Alliance.",
    },
    {
      name: "Shard of Arash",
      description:
        "Arash Manash Calash was a teleportation engineer. He accidentally generated the first mineral wormhole, allowing alliances to instantly teleport resources across rifts. His innovations laid the foundation for interstellar commerce.",
    },
    {
      name: "Shard of Nova",
      description:
        "Desmond Nova was a portal researcher and Arash's protege. He opened the first interdimensional rift, a treacherous tunnel connecting our galaxy to resource-abundant asteroid belts. This discovery would one day lead to the Great Belt Wars.",
    },

    {
      name: "Shard of Thorne",
      description:
        "Elara Thorne, a pioneering biologist working alongside portal researcher Desmond Nova, discovered that organic matter couldn't survive passage through the rifts. She secretly engineered the first androids that could withstand the harsh conditions of interrift travel.",
    },
    {
      name: "Shard of Raskin",
      description:
        "Jane Raskin was a legendary journalist who unearthed and published Elara Thorne's secret android blueprints. This allowed rival alliances to navigate the Rift, sparking the Great Belt Wars.",
    },
  ];

  /**
   * Gets shard data for a given entity
   */
  const getShardData = (entity: Entity) => {
    const shardIndex = tables.ShardAsteroidIndex.get(entity)?.value;
    if (shardIndex !== undefined) {
      return shards[Number(shardIndex) % shards.length];
    }
    return undefined;
  };

  /**
   * Gets shard name for a given entity
   */
  const getShardName = (entity: Entity) => {
    const shardIndex = tables.ShardAsteroidIndex.get(entity)?.value;
    if (shardIndex == undefined) return "UNKNOWN";
    const shardData = shards[Number(shardIndex) % shards.length];
    return shardData.name;
  };

  return {
    getShardData,
    getShardName,
  };
}
