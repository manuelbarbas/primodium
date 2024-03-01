import { Entity } from "@latticexyz/recs";
import { expect, test } from "vitest";
import { hashKeyEntity, toHex32 } from "../util/encode";

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

test("hashKeyEntityOutputs", () => {
  hashKeyEntityOutputs.entities.forEach((example) => {
    expect(hashKeyEntity(toHex32(hashKeyEntityOutputs.key), example.entity)).eq(example.output);
  });
});
