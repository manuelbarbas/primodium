import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { createCore } from "@/createCore";
import { AccountClientProvider, CoreProvider, useCore } from "@/react/hooks";
import { useAccountClient } from "@/react/hooks/useAccountClient";

import { commonTests, createTestConfig } from "../lib/common";

describe("browser", () => {
  const { coreConfig, privateKey } = createTestConfig();

  commonTests();

  describe("browser-only", () => {
    it("should contain core object in a hook", () => {
      const TestCoreComponent = () => {
        const core = useCore();

        return (
          <div>
            <p>{core.config.initialBlockNumber?.toString()}</p>
          </div>
        );
      };

      const core = createCore(coreConfig);
      core.network.world;

      render(
        <CoreProvider {...core}>
          <TestCoreComponent />
        </CoreProvider>,
      );

      // @ts-expect-error Property 'toBeInTheDocument' does not exist on type 'Assertion<HTMLElement>'
      expect(screen.getAllByText(coreConfig.initialBlockNumber?.toString() ?? "")[0]).toBeInTheDocument();
    });

    it("should contain account client in a hook", () => {
      const TestCoreComponent = () => {
        const { playerAccount } = useAccountClient();
        return (
          <div>
            <p>{playerAccount.address}</p>
          </div>
        );
      };

      const core = createCore(coreConfig);

      render(
        <CoreProvider {...core}>
          <AccountClientProvider playerPrivateKey={privateKey} sessionPrivateKey={privateKey}>
            <TestCoreComponent />
          </AccountClientProvider>
        </CoreProvider>,
      );

      // @ts-expect-error Property 'toBeInTheDocument' does not exist on type 'Assertion<HTMLElement>'
      expect(screen.getAllByText(coreConfig.initialBlockNumber?.toString() ?? "")[0]).toBeInTheDocument();
    });
  });
});
