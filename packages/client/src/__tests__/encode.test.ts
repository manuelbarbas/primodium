import { Entity } from "@latticexyz/recs";
import { getMotherlodeEntity, hashKeyEntity, toHex32 } from "../util/encode";

// Outputs of LibEncode.sol's hashKeyEntity function
const hashKeyEntityOutputs = {
  key: "KEY",
  entities: [
    {
      entity: toHex32(0) as Entity,
      output: "0xdbb5031518f04b153063fe2bbe179cbadc73d8a5c2e3ca18e1f4efabb1a25ab1",
    },
    {
      entity: toHex32(1) as Entity,
      output: "0xddd5c55844434152e840f9136df112e1922d082f0d7618a38da73c3c354b7272",
    },
    {
      entity: toHex32(2) as Entity,
      output: "0xe251a7b45234bace2bedecff795c58f94fb8e7d699fbc2e204e90b15d6d9980e",
    },
    {
      entity: toHex32(3) as Entity,
      output: "0x7072887f652397c0aa343de18e995fe0dfd22c8eb69882b343382f67743f0aeb",
    },
    {
      entity: toHex32(4) as Entity,
      output: "0x7d569a14c4775da03c33be7e3dc686662a4060d159393e6a38070847c9b0f9b2",
    },
  ],
};

// Check with second argument padded to 160 bits (as if address)
hashKeyEntityOutputs.entities.forEach((example) => {
  if (hashKeyEntity(toHex32(hashKeyEntityOutputs.key), example.entity) != example.output) {
    console.log("entity: ", example.entity);
    console.log("expected:", example.output);
    console.log("actual:", hashKeyEntity(toHex32(hashKeyEntityOutputs.key), example.entity));
    throw new Error();
  }
});

const motherlodeHashes = [
  {
    coord: { x: 0, y: 0 },
    i: 0,
    motherlodeEntity: "0x31770bdcdd8f48847479fa8ca640ecbe14466cede049528f865644c388bc0c3b",
  },
  {
    coord: { x: 7, y: 3 },
    i: 1,
    motherlodeEntity: "0x20699780b0d5ba058f9782c9a3b3c87328057c8cb3a38a5ecc7b977910107928",
  },
  {
    coord: { x: 4, y: 6 },
    i: 2,
    motherlodeEntity: "0x3c80a0f6580607445ba6728fac1b7b9eabe5c274a9aac7487fb4a072f5a976a7",
  },
  {
    coord: { x: 1, y: 9 },
    i: 3,
    motherlodeEntity: "0x3080552ec4d2adddeb2b880dfce67d93fec01178a0b7a14d0a9633e4c010800a",
  },
  {
    coord: { x: 8, y: 2 },
    i: 4,
    motherlodeEntity: "0xe8b2f565dd510cf0775141614f9f8fbc0dcdb90ac8e563914cac2b0541d156ae",
  },
];

for (const example of motherlodeHashes) {
  const motherlodeEntity = getMotherlodeEntity(toHex32(example.i) as Entity, example.coord);
  if (example.motherlodeEntity !== motherlodeEntity) {
    console.log("i:", example.i);
    console.log("motherlodeEntity:", example.motherlodeEntity);
    console.log("getMotherlodeEntity:", motherlodeEntity);
    throw new Error();
  }
}
