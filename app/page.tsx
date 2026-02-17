"use client";

import { useState } from "react";

type Chain = "eth" | "night" | "xmr";

interface SocialUser {
  name: string;
  handle: string;
  icon: string;
}

interface WalletState {
  eth: string | null;
  night: string | null;
  xmr: string | null;
}

const FAKE_ETH = [
  "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
];
const FAKE_NIGHT = [
  "mn1qxy2kgdygjrsqtzq2n0yrf249xe2fyjeqxv9drx",
  "mn1q7y8kgdygjrsqtzq2n0yrf249xe2fyjeqxv9abc",
];
const FAKE_XMR = [
  "4AdUndXHHZ9pfQj27KRYNqHkJFDNLzDGKBrMwqoSNFpGTXK3J8VEZ6P2WXYQ8pN7iBfJV7hQrjQqAvEHHzDW3cF7FYECpN",
  "48Zc1WNKLH5QpQNzEcNriS9fEzBcBxMPTCHMVPkNgpQCm6eHGi2WVj8H2XZJW3ioAbZ5F6LKtXN9TaePxmFGmWR7jsFD4P",
];
const FAKE_NAMES: Record<string, string[]> = {
  google: ["alex.fitnight@gmail.com", "sarah.k@gmail.com"],
  telegram: ["@fitnight_alex", "@sarah_trains"],
  x: ["@alexfitnight", "@sarah_k"],
};

const rand = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export default function LoginPage() {
  const [social, setSocial] = useState<SocialUser | null>(null);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletState>({ eth: null, night: null, xmr: null });
  const [walletLoading, setWalletLoading] = useState<Chain | null>(null);
  const [manualInputs, setManualInputs] = useState({ eth: "", night: "", xmr: "" });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  // ── Social Login ──
  const socialLogin = (name: string, icon: string, key: string) => {
    setSocialLoading(key);
    setTimeout(() => {
      setSocial({ name, handle: rand(FAKE_NAMES[key]), icon });
      setSocialLoading(null);
      showToast(`✓ Signed in with ${name}`);
    }, 1200);
  };

  const socialLogout = () => {
    setSocial(null);
    showToast("Signed out");
  };

  // ── Wallet ──
  const fakeAddrs: Record<Chain, string[]> = { eth: FAKE_ETH, night: FAKE_NIGHT, xmr: FAKE_XMR };

  const connectWallet = (chain: Chain, walletName: string) => {
    setWalletLoading(chain);
    setTimeout(() => {
      setWallets(prev => ({ ...prev, [chain]: rand(fakeAddrs[chain]) }));
      setWalletLoading(null);
      showToast(`✓ ${walletName} linked successfully`);
    }, 1400);
  };

  const manualConnect = (chain: Chain) => {
    const val = manualInputs[chain].trim();
    if (!val) { showToast("Please enter an address"); return; }
    if (chain === "eth" && !val.startsWith("0x")) { showToast("ETH address must start with 0x"); return; }
    if (chain === "night" && !val.startsWith("mn")) { showToast("Midnight address must start with mn"); return; }
    if (chain === "xmr" && !val.startsWith("4")) { showToast("Monero address must start with 4"); return; }
    setWallets(prev => ({ ...prev, [chain]: val }));
    setManualInputs(prev => ({ ...prev, [chain]: "" }));
    showToast("✓ Wallet linked successfully");
  };

  const disconnect = (chain: Chain) => {
    setWallets(prev => ({ ...prev, [chain]: null }));
    showToast("Wallet disconnected");
  };

  const hasAny = social || wallets.eth || wallets.night || wallets.xmr;
  const short = (addr: string) => addr.slice(0, 8) + "..." + addr.slice(-6);

  const ctaNote = () => {
    const hasWallet = wallets.eth || wallets.night || wallets.xmr;
    if (social && wallets.eth && wallets.night && wallets.xmr) return "All set — social login + all wallets linked!";
    if (social && hasWallet) return "Ready! You can also link more wallets.";
    if (social) return "Signed in via social. You can also link wallets.";
    if (hasWallet) return "Wallet linked. You can also sign in socially.";
    return "Choose at least one option above to continue.";
  };

  return (
    <main style={{ fontFamily: "'Outfit', sans-serif", background: "#000", color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", opacity: .5, marginBottom: 14 }}>Fitnight</div>
        <h1 style={{ fontSize: 34, fontWeight: 700, marginBottom: 10 }}>Connect Wallet or Create Account</h1>
        <p style={{ fontSize: 15, opacity: .5, maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>Choose any option below to get started — you only need one to use Fitnight.</p>
      </div>

      <div style={{ width: "100%", maxWidth: 760, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Option 1: Social ── */}
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", opacity: .35 }}>Option 1 – Social Login</div>
        <div style={{ background: "#0d0d0d", border: `1px solid ${social ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.1)"}`, borderRadius: 16, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔑</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600 }}>Sign in with Social</div>
                <div style={{ fontSize: 12, opacity: .45, marginTop: 2 }}>No wallet required · Quick & easy</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, opacity: .5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: social ? "#4ade80" : "#444", boxShadow: social ? "0 0 6px #4ade80" : "none" }} />
              {social ? "Signed in" : socialLoading ? `Connecting...` : "Not signed in"}
            </div>
          </div>

          {!social ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[
                { key: "google", label: "Google", icon: "🔵" },
                { key: "telegram", label: "Telegram", icon: "✈️" },
                { key: "x", label: "X", icon: "🐦" },
              ].map(s => (
                <button key={s.key} onClick={() => socialLogin(s.label, s.icon, s.key)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", padding: "16px 12px", borderRadius: 12, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  {socialLoading === s.key ? "Connecting..." : s.label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>{social.icon}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{social.handle}</div>
                  <div style={{ fontSize: 11, opacity: .4, marginTop: 1 }}>via {social.name}</div>
                </div>
              </div>
              <button onClick={socialLogout} style={{ background: "transparent", border: "1px solid rgba(255,100,100,.25)", color: "rgba(255,100,100,.6)", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Sign out</button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
          <span style={{ fontSize: 11, opacity: .3 }}>or connect a wallet directly</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
        </div>

        {/* ── Option 2: Wallets ── */}
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", opacity: .35 }}>Option 2 – Link Wallets</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {([
            { chain: "night" as Chain, label: "Midnight (NIGHT)", sub: "Privacy chain · ZK-powered", icon: "🌙", iconBg: "rgba(160,100,255,.15)", placeholder: "mn1...", wallets: ["Ctrl Wallet", "Lace Wallet"] },
            { chain: "eth" as Chain, label: "Ethereum", sub: "EVM-compatible · ERC-1155 NFTs", icon: "⟠", iconBg: "rgba(98,126,234,.15)", placeholder: "0x...", wallets: ["MetaMask", "WalletConnect", "Coinbase Wallet"] },
            { chain: "xmr" as Chain, label: "Monero (XMR)", sub: "Privacy coin · Untraceable", icon: "ɱ", iconBg: "rgba(255,102,0,.15)", placeholder: "4...", wallets: ["Feather Wallet", "Cake Wallet"] },
          ]).map(({ chain, label, sub, icon, iconBg, placeholder, wallets: wOpts }) => (
            <div key={chain} style={{ flex: 1, minWidth: 240, background: "#0d0d0d", border: `1px solid ${wallets[chain] ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.1)"}`, borderRadius: 16, padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 12, opacity: .45, marginTop: 2 }}>{sub}</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", borderRadius: 8, background: "rgba(255,255,255,.04)", fontSize: 13, marginBottom: 14 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: wallets[chain] ? "#4ade80" : walletLoading === chain ? "#f59e0b" : "#444", boxShadow: wallets[chain] ? "0 0 6px #4ade80" : "none" }} />
                {wallets[chain] ? "Connected" : walletLoading === chain ? "Connecting..." : "Not connected"}
              </div>

              <div style={{ background: "#000", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, padding: "10px 12px", fontSize: 11, fontFamily: "monospace", wordBreak: "break-all", color: wallets[chain] ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.25)", minHeight: 42, display: "flex", alignItems: "center", marginBottom: 14, fontStyle: wallets[chain] ? "normal" : "italic", letterSpacing: wallets[chain] ? .5 : 0 }}>
                {wallets[chain] ?? "No address linked yet"}
              </div>

              {!wallets[chain] ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
                    {wOpts.map(w => (
                      <button key={w} onClick={() => connectWallet(chain, w)}
                        style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", padding: "10px 13px", borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", textAlign: "left" }}>
                        <span style={{ flex: 1 }}>{w}</span>
                        <span style={{ opacity: .4, fontSize: 12 }}>→</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, opacity: .4, marginBottom: 6, textAlign: "center" }}>— or paste address manually —</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={manualInputs[chain]} onChange={e => setManualInputs(prev => ({ ...prev, [chain]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ flex: 1, background: "#000", border: "1px solid rgba(255,255,255,.15)", color: "#fff", padding: "9px 12px", borderRadius: 8, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                    <button onClick={() => manualConnect(chain)}
                      style={{ background: "#fff", color: "#000", border: "none", padding: "9px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Save</button>
                  </div>
                </>
              ) : (
                <button onClick={() => disconnect(chain)}
                  style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.35)", padding: 9, borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
                  Disconnect wallet
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ── Summary ── */}
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", opacity: .35, marginTop: 4 }}>Account Summary</div>
        <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: "20px 28px" }}>
          {[
            { label: "Social Login", value: social?.handle ?? null },
            { label: "Midnight Address", value: wallets.night },
            { label: "Ethereum Address", value: wallets.eth },
            { label: "Monero Address", value: wallets.xmr },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.06)", fontSize: 13 }}>
              <span style={{ opacity: .5 }}>{label}</span>
              <span style={{ fontFamily: value ? "monospace" : "inherit", fontSize: value ? 11 : 12, opacity: value ? .8 : .3, fontStyle: value ? "normal" : "italic" }}>
                {value ? short(value) : "Not linked"}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", fontSize: 13 }}>
            <span style={{ opacity: .5 }}>Status</span>
            <span style={{ background: hasAny ? "rgba(74,222,128,.1)" : "rgba(255,255,255,.04)", color: hasAny ? "#4ade80" : "rgba(255,255,255,.3)", border: `1px solid ${hasAny ? "rgba(74,222,128,.2)" : "rgba(255,255,255,.08)"}`, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
              {hasAny ? "✓ Ready" : "Incomplete"}
            </span>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button disabled={!hasAny}
            style={{ background: "#fff", color: "#000", border: "none", padding: "16px 40px", borderRadius: 10, fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: hasAny ? "pointer" : "not-allowed", opacity: hasAny ? 1 : .25, transition: "all .3s" }}>
            Save & Continue →
          </button>
          <div style={{ fontSize: 12, opacity: .35, marginTop: 10 }}>{ctaNote()}</div>
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", border: "1px solid rgba(255,255,255,.15)", color: "#fff", padding: "11px 20px", borderRadius: 10, fontSize: 13, zIndex: 999, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </main>
  );
}
      </main>
    </div>
  );
}
