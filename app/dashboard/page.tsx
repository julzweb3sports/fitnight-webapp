"use client";

import { useState, useEffect } from "react";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useWallet } from "@meshsdk/react";
import { useRouter } from "next/navigation";

type Tab = "profile" | "nfts" | "memberships" | "buy" | "create";

interface NFT {
  asset: string;
  quantity: string;
}

function shortAddr(addr: string) {
  if (!addr) return "";
  return addr.slice(0, 10) + "..." + addr.slice(-8);
}

// ── Icons ──
const IconProfile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconNFT = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="2" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/>
  </svg>
);
const IconMembership = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
  </svg>
);
const IconBuy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const IconCreate = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const TABS = [
  { key: "profile" as Tab, label: "Profile", Icon: IconProfile },
  { key: "nfts" as Tab, label: "My NFTs", Icon: IconNFT },
  { key: "memberships" as Tab, label: "My Memberships", Icon: IconMembership },
  { key: "buy" as Tab, label: "Buy Membership", Icon: IconBuy },
  { key: "create" as Tab, label: "Create Membership", Icon: IconCreate },
];

// ── Placeholder ──
function ComingSoonTab({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 16, opacity: 0.4 }}>
      <div style={{ fontSize: 48 }}>🚧</div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13 }}>This section is coming soon.</div>
    </div>
  );
}

// ── Profile Tab ──
function ProfileTab() {
  const { primaryWallet, user } = useDynamicContext();
  const { connected, wallet } = useWallet();
  const [cardanoAddr, setCardanoAddr] = useState<string | null>(null);

  useEffect(() => {
    if (connected && wallet) {
      wallet.getChangeAddress().then(setCardanoAddr).catch(() => setCardanoAddr(null));
    }
  }, [connected, wallet]);

  const rows = [
    { label: "Email", value: user?.email ?? "—" },
    { label: "Username", value: user?.username ?? "—" },
    { label: "ETH Address", value: primaryWallet?.address ? shortAddr(primaryWallet.address) : "Not connected" },
    { label: "Cardano Address", value: cardanoAddr ? shortAddr(cardanoAddr) : "Not connected" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #1a1a1a, #333)", border: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
          👤
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.email ?? user?.username ?? "Fitnight User"}</div>
          <div style={{ fontSize: 12, opacity: 0.45, marginTop: 4 }}>Member since {new Date().getFullYear()}</div>
        </div>
      </div>

      {/* Info rows */}
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, overflow: "hidden" }}>
        {rows.map(({ label, value }, i) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none", fontSize: 13 }}>
            <span style={{ opacity: 0.55 }}>{label}</span>
            <span style={{ fontFamily: label.includes("Address") ? "monospace" : "inherit", fontSize: label.includes("Address") ? 11 : 13, opacity: 0.85 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── NFTs Tab ──
function NFTsTab() {
  const { connected, wallet } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !wallet) return;
    setLoading(true);
    (async () => {
      try {
        const utxos = await wallet.getUtxos();
        const assetMap = new Map<string, number>();
        for (const utxo of utxos) {
          const amounts = (utxo as any).output?.amount ?? (utxo as any).amount ?? [];
          for (const amount of amounts) {
            if (amount.unit !== "lovelace") {
              assetMap.set(amount.unit, (assetMap.get(amount.unit) ?? 0) + Number(amount.quantity));
            }
          }
        }
        const result: NFT[] = Array.from(assetMap.entries()).map(([asset, qty]) => ({
          asset,
          quantity: String(qty),
        }));
        setNfts(result);
      } catch (_e: unknown) {
        setError("Could not load assets.");
      } finally {
        setLoading(false);
      }
    })();
  }, [connected, wallet]);

  if (!connected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 12, opacity: 0.4 }}>
        <div style={{ fontSize: 36 }}>🔗</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>No Cardano wallet connected</div>
        <div style={{ fontSize: 12 }}>Go back and connect your Cardano wallet to see your NFTs.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280, opacity: 0.4, fontSize: 14 }}>
        Loading assets...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280, opacity: 0.4, fontSize: 14, color: "rgba(255,100,100,.7)" }}>
        {error}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, gap: 12, opacity: 0.4 }}>
        <div style={{ fontSize: 36 }}>🖼️</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>No NFTs found</div>
        <div style={{ fontSize: 12 }}>This wallet doesn't contain any tokens or NFTs yet.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 12, opacity: 0.45 }}>{nfts.length} asset{nfts.length !== 1 ? "s" : ""} found</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {nfts.map((nft) => (
          <div key={nft.asset} style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 16 }}>
            <div style={{ width: "100%", height: 100, background: "rgba(255,255,255,.04)", borderRadius: 8, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
              🖼️
            </div>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,.6)", wordBreak: "break-all", marginBottom: 6 }}>
              {nft.asset.slice(0, 20)}...
            </div>
            <div style={{ fontSize: 11, opacity: 0.4 }}>Qty: {nft.quantity}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ──
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Dashboard</div>
          <button onClick={() => router.push("/")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.5)", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
            ← Back
          </button>
        </div>

        {/* Tab Bar */}
        <div style={{ display: "flex", gap: 4, background: "#0d0d0d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: 6, overflowX: "auto" }}>
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
                background: activeTab === key ? "rgba(255,255,255,.08)" : "transparent",
                border: activeTab === key ? "1px solid rgba(255,255,255,.12)" : "1px solid transparent",
                color: activeTab === key ? "#fff" : "rgba(255,255,255,.4)",
              }}>
              <Icon />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 28, minHeight: 380 }}>
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "nfts" && <NFTsTab />}
          {activeTab === "memberships" && <ComingSoonTab label="My Memberships" />}
          {activeTab === "buy" && <ComingSoonTab label="Buy Membership" />}
          {activeTab === "create" && <ComingSoonTab label="Create Membership" />}
        </div>

      </div>
    </main>
  );
}