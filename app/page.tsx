"use client";

import { useState, useEffect } from "react";
import type {} from "@midnight-ntwrk/dapp-connector-api";
import { useDynamicContext, useIsLoggedIn, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useWallet, useWalletList } from "@meshsdk/react";

type Tab = "nfts" | "holder" | "gyms" | "memberships" | "buy" | "create";

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
  return addr.slice(0, 8) + "..." + addr.slice(-6);
}

function ipfsToHttp(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("ipfs://")) return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  return url;
}

// ── Icons ──
const IconNFT = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="2" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/>
  </svg>
);

const IconHolder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconGyms = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
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

const MidnightLogo = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/midnight.png" width={20} height={20} alt="Midnight" style={{ borderRadius: 4, objectFit: "contain", display: "block", opacity: 0.4 }} />
);

const CardanoLogo = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/cardano.png" width={20} height={20} alt="Cardano" style={{ objectFit: "contain", display: "block" }} />
);

const TABS = [
  { key: "nfts" as Tab, label: "My NFTs", Icon: IconNFT },
  { key: "holder" as Tab, label: "Holder Portal", Icon: IconHolder },
  { key: "gyms" as Tab, label: "Partner Gyms", Icon: IconGyms },
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

// ── NFT Card ──
function NFTCard({ name, image, subtitle, badge }: { name: string; image: string | null; subtitle: string; badge?: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ width: "100%", aspectRatio: "1", background: "rgba(255,255,255,.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, position: "relative" }}>
        {image && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} onError={() => setImgError(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : "🖼️"}
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


// ── Copy Button ──
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,.3)", fontStyle: "italic" }}>
        {text.slice(0, 10)}...{text.slice(-6)}
      </span>
      <button onClick={copy}
        style={{ background: copied ? "rgba(74,222,128,.1)" : "rgba(255,255,255,.05)", border: `1px solid ${copied ? "rgba(74,222,128,.25)" : "rgba(255,255,255,.1)"}`, color: copied ? "rgba(74,222,128,.8)" : "rgba(255,255,255,.35)", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap" }}>
        {copied ? "✓ Copied" : "Copy"}
      </button>
    </div>
  );
}

// ── Username Editor ──
function UsernameEditor() {
  const { user } = useDynamicContext();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(user?.username ?? "");
  }, [user?.username]);

  async function save() {
    if (!value.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/update-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value.trim(), userId: user?.userId }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === "Enter" && save()}
          autoFocus
          placeholder="Username"
          style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,.2)", color: "#fff", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", width: 150 }}
        />
        <button onClick={save} disabled={saving}
          style={{ background: "#fff", color: "#000", border: "none", padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "..." : "Save"}
        </button>
        <button onClick={() => setEditing(false)}
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.4)", padding: "6px 10px", borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)}
      style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.4)", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
      ✏️ {saved ? "Saved!" : "Edit username"}
    </button>
  );
}

// ── Token Gate Config ──
const GATE_COLLECTIONS = [
  { name: "fitnight manifesto", chain: "EVM", id: "0x223c97c62B7263aa53E581Ab827565290f5c3149" },
  { name: "The Mallard Order", chain: "Cardano", id: "901ba6e9831b078e131a1cc403d6139af21bda255cea6c9f770f4834" },
];

// ── Holder Portal Tab ──
function HolderPortalTab() {
  const { primaryWallet, user } = useDynamicContext();
  const { connected, wallet } = useWallet();
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  const blockfrostKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY;
  const [access, setAccess] = useState<"loading" | "granted" | "denied" | "no-wallet">("no-wallet");

  useEffect(() => {
    const hasEthWallet = !!primaryWallet?.address;
    const hasCardanoWallet = connected && !!wallet;

    if (!hasEthWallet && !hasCardanoWallet) {
      setAccess("no-wallet");
      return;
    }

    setAccess("loading");

    async function checkAccess() {
      // Check ETH: fitnight manifesto
      if (hasEthWallet && alchemyKey) {
        const res = await fetch(
          `https://eth-mainnet.g.alchemy.com/nft/v3/${alchemyKey}/isHolderOfContract?wallet=${primaryWallet!.address}&contractAddress=0x223c97c62B7263aa53E581Ab827565290f5c3149`
        ).then(r => r.json()).catch(() => ({ isHolderOfContract: false }));
        if (res.isHolderOfContract) return "granted";
      }

      // Check Cardano: The Mallard Order policy ID
      if (hasCardanoWallet && blockfrostKey) {
        try {
          const rawAddr = await wallet!.getChangeAddress();
          let address = rawAddr;
          if (!rawAddr.startsWith("addr")) {
            const { Address } = await import("@emurgo/cardano-serialization-lib-browser");
            address = Address.from_bytes(Buffer.from(rawAddr, "hex")).to_bech32();
          }
          const utxos = await fetch(
            `https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}/utxos`,
            { headers: { project_id: blockfrostKey } }
          ).then(r => r.json());
          const policyId = "901ba6e9831b078e131a1cc403d6139af21bda255cea6c9f770f4834";
          for (const utxo of utxos) {
            for (const amount of utxo.amount ?? []) {
              if (amount.unit !== "lovelace" && amount.unit.startsWith(policyId)) {
                return "granted";
              }
            }
          }
        } catch { /* ignore */ }
      }

      return "denied";
    }

    checkAccess().then(result => setAccess(result)).catch(() => setAccess("denied"));
  }, [primaryWallet?.address, connected, wallet, alchemyKey, blockfrostKey]);

  if (access === "no-wallet") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 14, textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>🔐</div>
        <div style={{ fontSize: 17, fontWeight: 600 }}>Holder Portal</div>
        <div style={{ fontSize: 13, opacity: 0.4, maxWidth: 300 }}>Connect your Ethereum or Cardano wallet to check access.</div>
      </div>
    );
  }

  if (access === "loading") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 320, gap: 14 }}>
        <div style={{ fontSize: 40 }}>⏳</div>
        <div style={{ fontSize: 14, opacity: 0.4 }}>Verifying holder status...</div>
      </div>
    );
  }

  if (access === "denied") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 520, margin: "0 auto", paddingTop: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🚫</div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>Access Denied</div>
          <div style={{ fontSize: 13, opacity: 0.45, maxWidth: 320 }}>
            This area is exclusive to manifesto holders.
            You need at least one manifesto NFT to access this content.
          </div>
          <a href="https://opensea.io/collection/fitnight-manifesto" target="_blank" rel="noopener noreferrer"
            style={{ background: "#fff", color: "#000", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Get manifesto →
          </a>
        </div>

        {/* Eligible collections */}
        <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", opacity: 0.45, marginBottom: 14 }}>
            Eligible collections (including partners)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {GATE_COLLECTIONS.map(({ name, chain, id }) => (
              <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, background: chain === "EVM" ? "rgba(100,150,255,.12)" : "rgba(0,51,173,.2)", color: chain === "EVM" ? "rgba(150,180,255,.8)" : "rgba(100,150,255,.8)", padding: "2px 8px", borderRadius: 20, border: `1px solid ${chain === "EVM" ? "rgba(100,150,255,.2)" : "rgba(0,51,173,.3)"}` }}>
                    {chain}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
                </div>
                <CopyButton text={id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // access === "granted"
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(74,222,128,.1)", border: "1px solid rgba(74,222,128,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✓</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Welcome, {user?.username ? user.username : "Holder"}!</div>
            <div style={{ fontSize: 12, color: "rgba(74,222,128,.8)", marginTop: 2 }}>Access granted · eligible NFT verified</div>
          </div>
        </div>
        <UsernameEditor />
      </div>

      {/* Eligible collections */}
      <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", opacity: 0.45, marginBottom: 14 }}>
          Eligible collections (including partners)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {GATE_COLLECTIONS.map(({ name, chain, id }) => (
            <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, background: chain === "EVM" ? "rgba(100,150,255,.12)" : "rgba(0,51,173,.2)", color: chain === "EVM" ? "rgba(150,180,255,.8)" : "rgba(100,150,255,.8)", padding: "2px 8px", borderRadius: 20, border: `1px solid ${chain === "EVM" ? "rgba(100,150,255,.2)" : "rgba(0,51,173,.3)"}` }}>
                  {chain}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
              </div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,.3)", fontStyle: "italic", userSelect: "all" }}>
                {id}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,.06)" }} />

      {/* Exclusive content */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>

        {/* Manifesto – clickable link */}
        <a href="https://www.fitnight.xyz/assets/manifesto%20final.pdf" target="_blank" rel="noopener noreferrer"
          style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.5)", borderRadius: 14, padding: "20px 18px", textDecoration: "none", color: "#fff", display: "block", transition: "border-color 0.15s, box-shadow 0.15s", cursor: "pointer", boxShadow: "0 0 0 1px rgba(255,255,255,.08)" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.9)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(255,255,255,.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.5)"; e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,.08)"; }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📜</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>View manifesto</div>
          <div style={{ fontSize: 12, opacity: 0.4 }}>Join our movement.</div>
          <div style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,.35)" }}>Read now →</div>
        </a>

        {/* Coming soon */}
        <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "20px 18px" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🌙</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Coming soon</div>
          <div style={{ fontSize: 12, opacity: 0.4 }}>midnight integration, global memberships, partner benefits & more!</div>
        </div>

        {/* Governance */}
        <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "20px 18px" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🗳️</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Governance</div>
          <div style={{ fontSize: 12, opacity: 0.4 }}>Vote on future fitnight features.</div>
          <div style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,.25)", fontStyle: "italic" }}>Coming soon</div>
        </div>

      </div>
    </div>
  );
}

// ── Partner Gyms Tab ──
function PartnerGymsTab() {
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Partner Gyms</div>
          <div style={{ fontSize: 12, opacity: 0.4, marginTop: 3 }}>fitnight partner locations worldwide</div>
        </div>
        <div style={{ background: "rgba(255,200,50,.08)", border: "1px solid rgba(255,200,50,.2)", color: "rgba(255,200,50,.8)", fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>
          Currently acquiring
        </div>
      </div>

      {/* Map */}
      <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", position: "relative" }}>
        {mapsKey ? (
          <iframe
            title="Partner Gyms Map"
            width="100%"
            height="420"
            style={{ border: 0, display: "block", filter: "invert(90%) hue-rotate(180deg)" }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/view?key=${mapsKey}&center=48.8566,2.3522&zoom=3`}
          />
        ) : (
          <div style={{ height: 420, display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0d0d", fontSize: 13, opacity: 0.3 }}>
            Map unavailable – check API key
          </div>
        )}
      </div>

      {/* Empty state */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 0", opacity: 0.35, textAlign: "center" }}>
        <div style={{ fontSize: 28 }}>🏋️</div>
        <div style={{ fontSize: 13 }}>No partner gyms yet – we're working on it!</div>
        <div style={{ fontSize: 11 }}>Partner locations will appear on the map once confirmed.</div>
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
          .then((data) => (data.ownedNfts ?? []).map((nft: any) => ({
            tokenId: nft.tokenId,
            name: nft.name ?? nft.contract?.name ?? "Unnamed NFT",
            image: ipfsToHttp(nft.image?.cachedUrl ?? nft.image?.originalUrl ?? null),
            collection: nft.contract?.name ?? "Unknown Collection",
            chain: name,
          })))
          .catch(() => [] as EthNFT[])
      )
    ).then((results) => { setEthNFTs(results.flat()); setEthLoading(false); })
     .catch(() => { setEthError("Could not load Ethereum NFTs."); setEthLoading(false); });
  }, [primaryWallet?.address, alchemyKey]);

  useEffect(() => {
    if (!connected || !wallet || !blockfrostKey) return;
    setCardanoLoading(true);
    setCardanoError(null);
    wallet.getChangeAddress().then(async (rawAddress) => {
      let address = rawAddress;
      if (!rawAddress.startsWith("addr")) {
        const { Address } = await import("@emurgo/cardano-serialization-lib-browser");
        address = Address.from_bytes(Buffer.from(rawAddress, "hex")).to_bech32();
      }
      const res = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}/utxos`, {
        headers: { project_id: blockfrostKey },
      });
      const utxos = await res.json();
      const assetMap = new Map<string, number>();
      for (const utxo of utxos) {
        for (const amount of utxo.amount ?? []) {
          if (amount.unit !== "lovelace") {
            assetMap.set(amount.unit, (assetMap.get(amount.unit) ?? 0) + Number(amount.quantity));
          }
        }
      }
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
            return { asset: unit, name: onchain.name ?? meta.asset_name ?? unit.slice(0, 16), image: ipfsToHttp(imageUrl), quantity: String(qty) };
          } catch {
            return { asset: unit, name: unit.slice(0, 16), image: null, quantity: String(qty) };
          }
        })
      );
      setCardanoNFTs(nfts);
      setCardanoLoading(false);
    }).catch(() => { setCardanoError("Could not load Cardano NFTs."); setCardanoLoading(false); });
  }, [connected, wallet, blockfrostKey]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", opacity: 0.45, marginBottom: 14 }}>
          Ethereum / EVM · {ethLoading ? "Loading..." : `${ethNFTs.length} NFTs`}
        </div>
        {!primaryWallet?.address ? (
          <div style={{ fontSize: 13, opacity: 0.3, fontStyle: "italic" }}>Connect your Ethereum wallet to see NFTs.</div>
        ) : ethError ? (
          <div style={{ fontSize: 13, color: "rgba(255,100,100,.6)" }}>{ethError}</div>
        ) : ethLoading ? (
          <div style={{ fontSize: 13, opacity: 0.3 }}>Fetching from Ethereum, Polygon, Base...</div>
        ) : ethNFTs.length === 0 ? (
          <div style={{ fontSize: 13, opacity: 0.3, fontStyle: "italic" }}>No NFTs found on Ethereum, Polygon or Base.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {ethNFTs.map((nft, i) => <NFTCard key={`eth-${i}`} name={nft.name} image={nft.image} subtitle={nft.collection} badge={nft.chain} />)}
          </div>
        )}
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,.06)" }} />

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", opacity: 0.45, marginBottom: 14 }}>
          Cardano · {cardanoLoading ? "Loading..." : `${cardanoNFTs.length} NFTs`}
        </div>
        {!connected ? (
          <div style={{ fontSize: 13, opacity: 0.3, fontStyle: "italic" }}>Connect your Cardano wallet to see NFTs.</div>
        ) : cardanoError ? (
          <div style={{ fontSize: 13, color: "rgba(255,100,100,.6)" }}>{cardanoError}</div>
        ) : cardanoLoading ? (
          <div style={{ fontSize: 13, opacity: 0.3 }}>Fetching from Blockfrost...</div>
        ) : cardanoNFTs.length === 0 ? (
          <div style={{ fontSize: 13, opacity: 0.3, fontStyle: "italic" }}>No NFTs found in this Cardano wallet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
            {cardanoNFTs.map((nft, i) => <NFTCard key={`ada-${i}`} name={nft.name} image={nft.image} subtitle={`Qty: ${nft.quantity}`} badge="Cardano" />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Midnight Wallet Button ──
function MidnightWalletButton() {
  const [connected, setConnected] = useState(false);
  const [addr, setAddr] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function connect() {
    setError(null);
    setLoading(true);
    try {
      const api = await (window as any).midnight.mnLace.connect("preview");
      if (api) {
        setConnected(true);
        const state = await api.state();
        const address = state.address ?? state.coinPublicKey ?? "Connected";
        setAddr(address);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }

  function disconnect() {
    setConnected(false);
    setAddr(null);
  }

  if (connected && addr) {
    return (
      <button onClick={disconnect}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "#fff", padding: "8px 14px", borderRadius: 10, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
        <MidnightLogo />
        <span style={{ fontSize: 11 }}>Preview · Connected</span>
      </button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button onClick={connect} disabled={loading}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "#fff", padding: "8px 14px", borderRadius: 10, fontSize: 12, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
        <MidnightLogo />
        {loading ? "Connecting..." : "Connect Midnight"}
      </button>
      {error && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#111", border: "1px solid rgba(255,100,100,.2)", color: "rgba(255,100,100,.7)", padding: "8px 12px", borderRadius: 8, fontSize: 11, whiteSpace: "nowrap", zIndex: 100 }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ── Cardano Wallet Button ──
function CardanoWalletButton() {
  const { connect, disconnect, connected, wallet } = useWallet();
  const availableWallets = useWalletList();
  const [addr, setAddr] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connected && wallet) {
      wallet.getChangeAddress().then(async (raw) => {
        if (!raw.startsWith("addr")) {
          const { Address } = await import("@emurgo/cardano-serialization-lib-browser");
          setAddr(Address.from_bytes(Buffer.from(raw, "hex")).to_bech32());
        } else {
          setAddr(raw);
        }
      }).catch(() => setAddr(null));
    } else {
      setAddr(null);
    }
  }, [connected, wallet]);

  async function handleConnect(walletKey: string, walletName: string) {
    setError(null);
    try {
      await connect(walletKey);
      setShowList(false);
    } catch {
      setError("Could not connect " + walletName);
    }
  }

  if (connected && addr) {
    return (
      <div style={{ position: "relative" }}>
        <button onClick={() => disconnect()} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "#fff", padding: "8px 14px", borderRadius: 10, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
          <CardanoLogo />
          <span style={{ fontSize: 11 }}>Preview · Connected</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setShowList(!showList)} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "#fff", padding: "8px 14px", borderRadius: 10, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
        <CardanoLogo />
        Connect Cardano
      </button>
      {showList && availableWallets.length > 0 && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#111", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: 8, zIndex: 100, minWidth: 180, display: "flex", flexDirection: "column", gap: 4 }}>
          {availableWallets.map((w) => (
            <button key={w.id} onClick={() => handleConnect(w.id, w.name)}
              style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", color: "#fff", padding: "9px 12px", borderRadius: 8, fontSize: 13, fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={w.icon} width={20} height={20} alt={w.name} style={{ borderRadius: 4 }} />
              {w.name}
            </button>
          ))}
          {error && <div style={{ fontSize: 11, color: "rgba(255,100,100,.7)", padding: "4px 12px" }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("nfts");
  const { user, primaryWallet, handleLogOut, setShowAuthFlow } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { connected } = useWallet();

  const hasAnyConnection = isLoggedIn || connected;

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "0 20px" }}>

      {/* Top Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,.07)", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>fitnight</div>
          <a href="https://www.fitnight.xyz/" target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.45)", padding: "5px 11px", borderRadius: 8, fontSize: 11, fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}>
            ← Website
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Midnight – Lace Devnet */}
          <MidnightWalletButton />

          {/* Cardano – Mesh */}
          <CardanoWalletButton />

          {/* ETH + Social – Dynamic */}
          {isLoggedIn ? (
            <DynamicWidget />
          ) : (
            <button onClick={() => setShowAuthFlow(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", color: "#000", border: "none", padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
              Wallet and Social Login
            </button>
          )}
        </div>
      </nav>

      <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

        {!hasAnyConnection ? (
          /* Not connected state */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>Welcome to fitnight</div>
            <div style={{ fontSize: 15, opacity: 0.45, maxWidth: 360 }}>Connect your wallet or sign in with social to get started.</div>
          </div>
        ) : (
          <>
            {/* Profile strip */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0d0d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "14px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.email ?? user?.username ?? "Fitnight User"}</div>
                  <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>
                    {primaryWallet?.address ? `ETH: ${shortAddr(primaryWallet.address)}` : ""}
                  </div>
                </div>
              </div>
              {isLoggedIn && (
                <button onClick={handleLogOut} style={{ background: "transparent", border: "1px solid rgba(255,100,100,.2)", color: "rgba(255,100,100,.6)", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontFamily: "inherit", cursor: "pointer" }}>
                  Sign out
                </button>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, background: "#0d0d0d", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: 6 }}>
              {TABS.map(({ key, label, Icon }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s", background: activeTab === key ? "rgba(255,255,255,.08)" : "transparent", border: activeTab === key ? "1px solid rgba(255,255,255,.12)" : "1px solid transparent", color: activeTab === key ? "#fff" : "rgba(255,255,255,.4)" }}>
                  <Icon />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 28, minHeight: 380 }}>
              {activeTab === "nfts" && <NFTsTab />}
              {activeTab === "holder" && <HolderPortalTab />}
              {activeTab === "gyms" && <PartnerGymsTab />}
              {activeTab === "memberships" && <ComingSoonTab label="My Memberships" />}
              {activeTab === "buy" && <ComingSoonTab label="Buy Membership" />}
              {activeTab === "create" && <ComingSoonTab label="Create Membership" />}
            </div>
          </>
        )}
      </div>
    </main>
  );
}