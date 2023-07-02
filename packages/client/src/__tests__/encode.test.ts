import { expect, test } from "vitest";
import {
  decodeCoordEntity,
  encodeCoordEntity,
  hashKeyEntity,
} from "../util/encode";
import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

// Outputs of LibEncode.sol's hashKeyEntity function
// E.g. console.logBytes32(bytes32(LibEncode.hashKeyEntity(0, 0)));
const hashKeyEntityOutputs = [
  {
    key: 0,
    entity: 0,
    output:
      "0xad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5",
  },
  {
    key: 90,
    entity: 2,
    output:
      "0x045e11159efe5db0ada3cb8d2e196919e1d0ef71b9b06d0d60609840a64719a3",
  },
  {
    key: 10,
    entity: 100,
    output:
      "0x6b17b8cb5e84a99ff8477b1ce6041bf12d9716e79d07056760acebbb8354fbd1",
  },
  {
    key: 12345,
    entity: 678910,
    output:
      "0x0c5c051a91a8ab2d13ce6a81f1030321cbaa0af9e7d9b7f67acbfeb12def84d3",
  },
  {
    key: 25262728,
    entity: 30313233,
    output:
      "0xf7eea64553e727e221059874c9505c46a9e9ec09f44b6527830b639b77cb4ddd",
  },
];

test("hashKeyEntity matches LibEncode outputs", () => {
  const getPaddedHex = (n: number, pad: number): string => {
    const hex = n.toString(16);
    return "0x" + "0".repeat(pad - hex.length) + hex;
  };

  // Check with second argument padded to 160 bits (as if address)
  for (const example of hashKeyEntityOutputs) {
    expect(example.output).eq(
      hashKeyEntity(
        getPaddedHex(example.key, 64) as EntityID,
        // 20 bytes = 160 bits
        getPaddedHex(example.entity, 20) as EntityID
      )
    );
  }

  // Check with second argument padded to 256 bits (as if entity)
  for (const example of hashKeyEntityOutputs) {
    expect(example.output).eq(
      hashKeyEntity(
        getPaddedHex(example.key, 64) as EntityID,
        getPaddedHex(example.entity, 64) as EntityID
      )
    );
  }
});

// Hashing edge cases discovered in #36
// AdvancedPowerSourceCraftedItemID 11699589371590179690663298539456535383454944084246709593455824231284844824000
// PenetratorFactoryResearchID 76799586671436623659050302616748218087565722340238208070730782780668821241238
// Hash: 0x70e1c65c98bf24a9e78613b2ce740034b97a8fd2d6d5bbc51d6a8179b561052a

// TitaniumResourceItemID 29592648218955693310631313341848988444781730640864177349094518031889847668484
// ProjectileLauncherResearchID 115710791415720365844662016873039814882667321015852259562238368675311117449333
// Hash: 0x001cb5c6e893b51d92e512213945e99c9341f84f69f9128a2184c70b4e196249

const hashKeyResourceEntityOutputs = [
  {
    key: "11699589371590179690663298539456535383454944084246709593455824231284844824000",
    entity:
      "76799586671436623659050302616748218087565722340238208070730782780668821241238",
    output:
      "0x70e1c65c98bf24a9e78613b2ce740034b97a8fd2d6d5bbc51d6a8179b561052a",
  },
  {
    key: "29592648218955693310631313341848988444781730640864177349094518031889847668484",
    entity:
      "115710791415720365844662016873039814882667321015852259562238368675311117449333",
    output:
      "0x001cb5c6e893b51d92e512213945e99c9341f84f69f9128a2184c70b4e196249",
  },
];

test("hashKeyEntity matches LibEncode outputs, additional tests", () => {
  for (const example of hashKeyResourceEntityOutputs) {
    expect(example.output).eq(
      hashKeyEntity(example.key as EntityID, example.entity as EntityID)
    );
  }
});

// Outputs of LibEncode.sol's encodeCoordEntity function
// E.g. console.logBytes32(bytes32(LibEncode.encodeCoordEntity(Coord({ x: 0, y: 0 }), "primodium")));
const encodeCoordEntityOutputs = [
  {
    coord: { x: 0, y: 0 },
    key: "primodium",
    output:
      "0x00000000000000007072696d6f6469756d000000000000000000000000000000",
  },
  {
    coord: { x: 1, y: 5 },
    key: "building",
    output:
      "0x00000001000000056275696c64696e6700000000000000000000000000000000",
  },
  {
    coord: { x: -1, y: 10 },
    key: "sowm",
    output:
      "0xffffffff0000000a736f776d0000000000000000000000000000000000000000",
  },
  {
    coord: { x: 123458, y: -22324234 },
    key: "taxcuts",
    output:
      "0x0001e242feab5bf6746178637574730000000000000000000000000000000000",
  },
  {
    coord: { x: -929331, y: -723932 },
    key: "smallbrain",
    output:
      "0xfff1d1cdfff4f424736d616c6c627261696e0000000000000000000000000000",
  },
  {
    coord: { x: 239431, y: 3223932 },
    key: "superlongprobablytruncatedstring",
    output:
      "0x0003a7470031317c73757065726c6f6e6770726f6261626c797472756e636174",
  },
  {
    coord: { x: -110, y: -19201929 },
    key: "testtesttesttesttesttest",
    output:
      "0xffffff92fedb0077746573747465737474657374746573747465737474657374",
  },
  {
    coord: { x: 124123, y: 3325 },
    key: "building",
    output:
      "0x0001e4db00000cfd6275696c64696e6700000000000000000000000000000000",
  },
  {
    coord: { x: -12334, y: -1120 },
    key: "sowm",
    output:
      "0xffffcfd2fffffba0736f776d0000000000000000000000000000000000000000",
  },
  {
    coord: { x: 222233332, y: 22324234 },
    key: "taxcuts",
    output:
      "0x0d3f02f40154a40a746178637574730000000000000000000000000000000000",
  },
  {
    coord: { x: 2147483647, y: -2147483647 },
    key: "smallbrain",
    output:
      "0x7fffffff80000001736d616c6c627261696e0000000000000000000000000000",
  },
];

test("encodeCoordEntity matches LibEncode outputs", () => {
  for (const example of encodeCoordEntityOutputs) {
    expect(example.output).eq(encodeCoordEntity(example.coord, example.key));
    expect(example.output).not.eq(
      encodeCoordEntity(
        { x: example.coord.x - 10, y: example.coord.y },
        example.key
      )
    );
  }
});

test("decodeCoordEntity matches LibEncode outputs", () => {
  const coordToKey = (coord: Coord) => `${coord.x};;${coord.y}`;
  for (const example of encodeCoordEntityOutputs) {
    expect(coordToKey(example.coord)).eq(
      coordToKey(decodeCoordEntity(example.output as EntityID))
    );
  }
});
