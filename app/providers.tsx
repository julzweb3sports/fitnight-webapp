"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { MeshProvider } from "@meshsdk/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MeshProvider>
      <DynamicContextProvider
        settings={{
          environmentId: "ef787315-eda1-4cd6-8771-f7af709cb1a6", // aus dem Dynamic Dashboard
          walletConnectors: [EthereumWalletConnectors],
        }}
      >
        {children}
      </DynamicContextProvider>
    </MeshProvider>
  );
}