import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { BigNumber } from "ethers";
import { expect, test } from "vitest";
import { decodeCoord, encodeCoord, getMotherlodeEntity, hashKeyCoord, hashKeyEntity } from "../util/encode";

// Outputs of LibEncode.sol's hashKeyEntity function
// E.g. console.logBytes32(bytes32(LibEncode.hashKeyEntity(0, 0)));
const hashKeyEntityOutputs = [
  {
    key: 0,
    entity: 0,
    output: "0xad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5",
  },
  {
    key: 90,
    entity: 2,
    output: "0x045e11159efe5db0ada3cb8d2e196919e1d0ef71b9b06d0d60609840a64719a3",
  },
  {
    key: 10,
    entity: 100,
    output: "0x6b17b8cb5e84a99ff8477b1ce6041bf12d9716e79d07056760acebbb8354fbd1",
  },
  {
    key: 12345,
    entity: 678910,
    output: "0x0c5c051a91a8ab2d13ce6a81f1030321cbaa0af9e7d9b7f67acbfeb12def84d3",
  },
  {
    key: 25262728,
    entity: 30313233,
    output: "0xf7eea64553e727e221059874c9505c46a9e9ec09f44b6527830b639b77cb4ddd",
  },
  {
    key: "11699589371590179690663298539456535383454944084246709593455824231284844824000",
    entity: "97993341068949256531366201596922953741936964741343840392882074207030726058262",
    output: "0x000af0440d92c89680faa8b8c174a3d9e85853d832be6c58b4aa6d745554b924",
  },
  {
    key: "29592648218955693310631313341848988444781730640864177349094518031889847668484",
    entity: "115710791415720365844662016873039814882667321015852259562238368675311117449333",
    output: "0x001cb5c6e893b51d92e512213945e99c9341f84f69f9128a2184c70b4e196249",
  },
];

test("hashKeyEntity matches LibEncode outputs", () => {
  // Check with second argument padded to 160 bits (as if address)
  for (const example of hashKeyEntityOutputs) {
    expect(example.output).eq(
      hashKeyEntity(
        example.key,
        // 20 bytes = 160 bits
        example.entity
      )
    );
  }

  // Check with second argument padded to 256 bits (as if entity)
  for (const example of hashKeyEntityOutputs) {
    expect(example.output).eq(hashKeyEntity(example.key, example.entity));
  }
});

// Outputs of LibEncode.sol's encodeCoordEntity function
// E.g. console.logBytes32(bytes32(LibEncode.encodeCoordEntity(Coord({ x: 0, y: 0 }), "primodium")));
const encodeCoordEntityOutputs = [
  {
    coord: { x: 0, y: 0, parent: BigNumber.from("0").toHexString() },
    output: "0",
  },
  {
    coord: { x: 1, y: 5, parent: BigNumber.from(0).toHexString() },
    output: "4294967301",
  },
  {
    coord: { x: -1, y: 10, parent: BigNumber.from(0).toHexString() },
    output: "18446744069414584330",
  },
  {
    coord: { x: 123458, y: -22324234, parent: BigNumber.from(0).toHexString() },
    output: "530252345072630",
  },
  {
    coord: { x: -929331, y: -723932, parent: BigNumber.from(0).toHexString() },
    output: "18442752631751636004",
  },
];

function formattedString(input: string) {
  return "0x" + BigInt(input).toString(16).padStart(64, "0");
}
test("encodeCoordEntity matches LibEncode outputs", () => {
  for (const example of encodeCoordEntityOutputs) {
    expect(formattedString(example.output)).eq(encodeCoord(example.coord));
    expect(example.output).not.eq(
      encodeCoord({
        x: example.coord.x - 10,
        y: example.coord.y,
      })
    );
  }
});

test("decodeCoordEntity matches LibEncode outputs", () => {
  const coordToKey = (coord: Coord) => `${coord.x};;${coord.y}`;
  for (const example of encodeCoordEntityOutputs) {
    expect(coordToKey(example.coord)).eq(coordToKey(decodeCoord(example.output as EntityID)));
  }
});

const hashEntityCoords = [
  {
    coord: { x: 0, y: 0, parent: BigNumber.from("0").toHexString() },
    key: "building",
    output: "19828691625151199819925894263310015295956025344535852370549237859831322790673",
  },
  {
    coord: { x: 1, y: 5, parent: BigNumber.from(123).toHexString() },
    key: "building",
    output: "109148753008226741991702484166202944633515591219524242558445782281528478512641",
  },
  {
    coord: { x: -1, y: 10, parent: BigNumber.from(0).toHexString() },
    key: "building",
    output: "103533954559848020612050344332934577129382484874517710751975151449750747241804",
  },
  {
    coord: { x: 123458, y: -22324234, parent: BigNumber.from(0).toHexString() },
    key: "building",
    output: "111518471964263571474455470130025425666986359214977074161153522376787685319637",
  },
  {
    coord: { x: -929331, y: -723932, parent: BigNumber.from(0).toHexString() },
    key: "building",
    output: "32215382666935507160146267019595249092158368377584145094984290894592005171865",
  },
];

test("hashKeyCoord", () => {
  for (const example of hashEntityCoords) {
    expect(formattedString(example.output)).eq(
      hashKeyCoord(example.key, {
        ...example.coord,
        parent: example.coord.parent as EntityID,
      })
    );
    expect(example.output).not.eq(
      hashKeyCoord(example.key, {
        x: example.coord.x - 10,
        y: example.coord.y,
        parent: "0" as EntityID,
      })
    );
  }
});

const motherlodeHashes = [
  {
    Coord: { x: 0, y: 0 },
    i: 0,
    motherlodeEntity: "29890671933111895212135880125759349577539333039780540095697413485225524862294",
  },
  {
    Coord: { x: 7, y: 11 },
    i: 1,
    motherlodeEntity: "75606207422227065766018308945694276188648012329425277151450290581228475266037",
  },
  {
    Coord: { x: 14, y: 22 },
    i: 2,
    motherlodeEntity: "56818282599026547950251730660126348339991771193204857755929908828156211116710",
  },
  {
    Coord: { x: 21, y: 33 },
    i: 3,
    motherlodeEntity: "50119512804716241922711369707996643928211381710707999263237442351073138882659",
  },
  {
    Coord: { x: 28, y: 44 },
    i: 4,
    motherlodeEntity: "24953602701218774071661218245244089959347974787123319957308740685889942288097",
  },
  {
    Coord: { x: 35, y: 55 },
    i: 5,
    motherlodeEntity: "62203979884552515419306819601663628921764661747695825520162909926398563680261",
  },
  {
    Coord: { x: 42, y: 66 },
    i: 6,
    motherlodeEntity: "61023907394037091164063286689280021119480536360456167865958464494379419734754",
  },
  {
    Coord: { x: 49, y: 77 },
    i: 7,
    motherlodeEntity: "90508163938610830355933897832649707000695036410292051183282052463317229956842",
  },
  {
    Coord: { x: 56, y: 88 },
    i: 8,
    motherlodeEntity: "76146543010518759282207936544077963635482501210780896454104642223317087727027",
  },
  {
    Coord: { x: 63, y: 99 },
    i: 9,
    motherlodeEntity: "33174019957925864689236368538552968135614427705135003245843141467571433069036",
  },
];

test("motherlodeHashes", () => {
  for (const example of motherlodeHashes) {
    expect(formattedString(example.motherlodeEntity)).eq(
      getMotherlodeEntity(example.i.toString() as EntityID, example.Coord)
    );
  }
});
