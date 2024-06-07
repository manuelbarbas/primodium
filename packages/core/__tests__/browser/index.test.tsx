import { describe, it, expect } from "vitest";
import { commonTests, createTestConfig } from "../lib/common";
import { render, screen } from "@testing-library/react";
import React from "react";

import { CoreProvider, useCore } from "@/hooks";
import { createCore } from "@/createCore";

describe("browser", () => {
  const { coreConfig, address } = createTestConfig();

  commonTests();

  describe("browser-only", () => {
    it("should contain core object in a hook", () => {
      const TestCoreComponent = () => {
        const core = useCore();
        return (
          <div>
            <p>{core.config.playerAddress}</p>
          </div>
        );
      };
      const core = createCore(coreConfig);
      render(
        <CoreProvider {...core}>
          <TestCoreComponent />
        </CoreProvider>
      );
      expect(screen.getByText(address)).toBeInTheDocument();
    });
  });
});
