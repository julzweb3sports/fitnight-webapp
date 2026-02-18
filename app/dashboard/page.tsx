"use client";

import { useState, useEffect } from "react";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useWallet } from "@meshsdk/react";
import { useRouter } from "next/navigation";

type Tab = "profile" | "nfts" | "memberships" | "buy" | "create";

interface EthNFT {
  tokenId: string;
  name: string;
  image: string | null;
  collection: string;
  chain: string;
}

interface CardanoNFT {
  asset: string;
  name: string;
  image: string | null;
  quantity: string;
}

function shortAddr(addr: string) {
  if (!addr) return "";
  return addr.slice(0, 10) + "..." + addr.slice(-8);
}

function ipfsToHttp(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("ipfs://")) return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  return url;
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
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #1a1a1a, #333)", border: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
          👤
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{user?.email ?? user?.username ?? "Fitnight User"}</div>
          <div style={{ fontSize: 12, opacity: 0.45, marginTop: 4 }}>Member since {new Date().getFullYear()}</div>
        </div>
      </div>
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

// ── NFT Card ──
function NFTCard({ name, image, subtitle, badge }: { name: string; image: string | null; subtitle: string; badge?: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ width: "100%", aspectRatio: "1", background: "rgba(255,255,255,.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, position: "relative" }}>
        {image && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          "🖼️"
        )}
        {badge && (
          <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.7)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.7)", fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "2px 7px", borderRadius: 20 }}>
            {badge}
          </div>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name || "Unnamed NFT"}</div>
        <div style={{ fontSize: 11, opacity: 0.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subtitle}</div>
      </div>
    </div>
  );
}

// ── NFTs Tab ──
function NFTsTab() {
  const { primaryWallet } = useDynamicContext();
  const { connected, wallet } = useWallet();

  const [ethNFTs, setEthNFTs] = useState<EthNFT[]>([]);
  const [cardanoNFTs, setCardanoNFTs] = useState<CardanoNFT[]>([]);
  const [ethLoading, setEthLoading] = useState(false);
  const [cardanoLoading, setCardanoLoading] = useState(false);
  const [ethError, setEthError] = useState<string | null>(null);
  const [cardanoError, setCardanoError] = useState<string | null>(null);

  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const blockfrostKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;

  // Load ETH NFTs via Alchemy (multi-chain)
  useEffect(() => {
    if (!primaryWallet?.address || !alchemyKey) return;
    setEthLoading(true);
    setEthError(null);

    const chains = [
      { name: "Ethereum", base: `https://eth-mainnet.g.alchemy.com/nft/v3/${alchemyKey}` },
      { name: "Polygon", base: `https://polygon-mainnet.g.alchemy.com/nft/v3/${alchemyKey}` },
      { name: "Base", base: `https://base-mainnet.g.alchemy.com/nft/v3/${alchemyKey}` },
    ];

    Promise.all(
      chains.map(({ name, base }) =>
        fetch(`${base}/getNFTsForOwner?owner=${primaryWallet.address}&withMetadata=true&pageSize=50`)
          .then((r) => r.json())
          .then((data) => {
            const items = data.ownedNfts ?? [];
            return items.map((nft: any) => ({
              tokenId: nft.tokenId,
              name: nft.name ?? nft.contract?.name ?? "Unnamed NFT",
              image: ipfsToHttp(nft.image?.cachedUrl ?? nft.image?.originalUrl ?? null),
              collection: nft.contract?.name ?? "Unknown Collection",
              chain: name,
            }));
          })
          .catch(() => [] as EthNFT[])
      )
    ).then((results) => {
      setEthNFTs(results.flat());
      setEthLoading(false);
    }).catch(() => {
      setEthError("Could not load Ethereum NFTs.");
      setEthLoading(false);
    });
  }, [primaryWallet?.address, alchemyKey]);

  // Load Cardano NFTs via Blockfrost
  useEffect(() => {
    if (!connected || !wallet || !blockfrostKey) return;
    setCardanoLoading(true);
    setCardanoError(null);

    wallet.getChangeAddress().then(async (address) => {
      const res = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}/utxos`, {
        headers: { project_id: blockfrostKey },
      });
      const utxos = await res.json();

      // Collect all non-lovelace assets
      const assetMap = new Map<string, number>();
      for (const utxo of utxos) {
        for (const amount of utxo.amount ?? []) {
          if (amount.unit !== "lovelace") {
            assetMap.set(amount.unit, (assetMap.get(amount.unit) ?? 0) + Number(amount.quantity));
          }
        }
      }

      // Fetch metadata for each asset
      const nfts: CardanoNFT[] = await Promise.all(
        Array.from(assetMap.entries()).map(async ([unit, qty]) => {
          try {
            const metaRes = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/assets/${unit}`, {
              headers: { project_id: blockfrostKey },
            });
            const meta = await metaRes.json();
            const onchain = meta.onchain_metadata ?? {};
            const rawImage = onchain.image ?? meta.metadata?.image ?? null;
            const imageUrl = Array.isArray(rawImage) ? rawImage.join("") : rawImage;
            return {
              asset: unit,
              name: onchain.name ?? meta.asset_name ?? unit.slice(0, 16),
              image: ipfsToHttp(imageUrl),
              quantity: String(qty),
            };
          } catch {
            return { asset: unit, name: unit.slice(0, 16), image: null, quantity: String(qty) };
          }
        })
      );

      setCardanoNFTs(nfts);
      setCardanoLoading(false);
    }).catch(() => {
      setCardanoError("Could not load Cardano NFTs.");
      setCardanoLoading(false);
    });
  }, [connected, wallet, blockfrostKey]);

  const totalCount = ethNFTs.length + cardanoNFTs.length;
  const loading = ethLoading || cardanoLoading;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ETH NFTs */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", opacity: 0.45, marginBottom: 14 }}>
          Ethereum / EVM {ethLoading ? "· Loading..." : `· ${ethNFTs.length} NFTs`}
        </div>
        {!primaryWallet?.address ? (
          <div style={{ fontSize: 13, opacity: 0.3, fontStyle: "italic" }}>No Ethereum wallet connected.</div>
        ) : ethError ? (
          <div style={{ fontSize: 13, color: "rgba(255,100,100,.6)" }}>{ethError}</div>
        ) : ethLoading ? (
          <div style={{ fontSize: 13, opacity: 0.3 }}>Fetching from Ethereum, Polygon, Base...</div>
        ) : ethNFTs.length === 0 ? (
          <div style={{ fontSize: 13, opacity: 0.3, fontStyle: "italic" }}>No NFTs found on Ethereum, Polygon or Base.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }}>
            {ethNFTs.map((nft, i) => (
              <NFTCard key={`eth-${i}`} name={nft.name} image={nft.image} subtitle={nft.collection} badge={nft.chain} />
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,.06)" }} />

      {/* Cardano NFTs */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", opacity: 0.45, marginBottom: 14 }}>
          Cardano {cardanoLoading ? "· Loading..." : `· ${cardanoNFTs.length} NFTs`}
        </div>
        {!connected ? (
          <div style={{ fontSize: 13, opacity: 0.3, fontStyle: "italic" }}>No Cardano wallet connected.</div>
        ) : cardanoError ? (
          <div style={{ fontSize: 13, color: "rgba(255,100,100,.6)" }}>{cardanoError}</div>
        ) : cardanoLoading ? (
          <div style={{ fontSize: 13, opacity: 0.3 }}>Fetching from Blockfrost...</div>
        ) : cardanoNFTs.length === 0 ? (
          <div style={{ fontSize: 13, opacity: 0.3, fontStyle: "italic" }}>No NFTs found in this Cardano wallet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }}>
            {cardanoNFTs.map((nft, i) => (
              <NFTCard key={`ada-${i}`} name={nft.name} image={nft.image} subtitle={`Qty: ${nft.quantity}`} badge="Cardano" />
            ))}
          </div>
        )}
      </div>

      {!loading && totalCount === 0 && primaryWallet?.address && connected && (
        <div style={{ textAlign: "center", opacity: 0.3, fontSize: 13, marginTop: 8 }}>No NFTs found across all connected wallets.</div>
      )}
    </div>
  );
}

// ── Main Dashboard ──
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const isLoggedIn = useIsLoggedIn();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Dashboard</div>
          <button onClick={() => router.push("/")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.5)", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
            ← Back
          </button>
        </div>

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