"use client";

import { useState } from "react";
import { BrowserProvider } from "ethers";

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

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

const FAKE_NIGHT = [
  "mn1qxy2kgdygjrsqtzq2n0yrf249xe2fyjeqxv9drx",
  "mn1q7y8kgdygjrsqtzq2n0yrf249xe2fyjeqxv9abc",
];
const FAKE_XMR = [
  "4AdUndXHHZ9pfQj27KRYNqHkJFDNLzDGKBrMwqoSNFpGTXK3J8VEZ6P2WXYQ8pN7iBfJV7hQrjQqAvEHHzDW3cF7FYECpN",
];
const FAKE_NAMES: Record<string, string[]> = {
  google: ["alex.fitnight@gmail.com", "sarah.k@gmail.com"],
  telegram: ["@fitnight_alex", "@sarah_trains"],
  x: ["@alexfitnight", "@sarah_k"],
};

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shortAddr(addr: string) {
  return addr.slice(0, 8) + "..." + addr.slice(-6);
}

const WALLET_CONFIGS = [
  {
    chain: "night" as Chain,
    label: "Midnight (NIGHT)",
    sub: "Privacy chain · ZK-powered",
    icon: "🌙",
    iconBg: "rgba(160,100,255,.15)",
    placeholder: "mn1...",
    options: ["Ctrl Wallet", "Lace Wallet"],
    real: false,
  },
  {
    chain: "eth" as Chain,
    label: "Ethereum",
    sub: "EVM-compatible · ERC-1155 NFTs",
    icon: "⟠",
    iconBg: "rgba(98,126,234,.15)",
    placeholder: "0x...",
    options: ["MetaMask"],
    real: true,
  },
  {
    chain: "xmr" as Chain,
    label: "Monero (XMR)",
    sub: "Privacy coin · Untraceable",
    icon: "ɱ",
    iconBg: "rgba(255,102,0,.15)",
    placeholder: "4...",
    options: ["Feather Wallet", "Cake Wallet"],
    real: false,
  },
];

const SOCIAL_OPTIONS = [
  { key: "google", label: "Google", icon: "🔵" },
  { key: "telegram", label: "Telegram", icon: "✈️" },
  { key: "x", label: "X", icon: "🐦" },
];

export default function LoginPage() {
  const [social, setSocial] = useState<SocialUser | null>(null);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletState>({ eth: null, night: null, xmr: null });
  const [walletLoading, setWalletLoading] = useState<Chain | null>(null);
  const [manualInputs, setManualInputs] = useState({ eth: "", night: "", xmr: "" });
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  function socialLogin(name: string, icon: string, key: string) {
    setSocialLoading(key);
    setTimeout(() => {
      setSocial({ name, handle: rand(FAKE_NAMES[key]), icon });
      setSocialLoading(null);
      showToast("Signed in with " + name);
    }, 1200);
  }

  function socialLogout() {
    setSocial(null);
    showToast("Signed out");
  }

  async function connectMetaMask() {
    if (typeof window === "undefined" || !window.ethereum) {
      showToast("MetaMask not found – please install it first");
      return;
    }
    try {
      setWalletLoading("eth");
      const provider = new BrowserProvider(window.ethereum as Parameters<typeof BrowserProvider>[0]);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = (accounts as string[])[0];
      setWallets((prev) => ({ ...prev, eth: address }));
      showToast("MetaMask connected successfully");
    } catch {
      showToast("MetaMask connection cancelled");
    } finally {
      setWalletLoading(null);
    }
  }

  function connectWallet(chain: Chain, walletName: string) {
    const fakeAddrs: Record<Chain, string[]> = {
      eth: [],
      night: FAKE_NIGHT,
      xmr: FAKE_XMR,
    };
    setWalletLoading(chain);
    setTimeout(() => {
      setWallets((prev) => ({ ...prev, [chain]: rand(fakeAddrs[chain]) }));
      setWalletLoading(null);
      showToast(walletName + " linked successfully");
    }, 1400);
  }

  function manualConnect(chain: Chain) {
    const val = manualInputs[chain].trim();
    if (!val) { showToast("Please enter an address"); return; }
    if (chain === "eth" && !val.startsWith("0x")) { showToast("ETH address must start with 0x"); return; }
    if (chain === "night" && !val.startsWith("mn")) { showToast("Midnight address must start with mn"); return; }
    if (chain === "xmr" && !val.startsWith("4")) { showToast("Monero address must start with 4"); return; }
    setWallets((prev) => ({ ...prev, [chain]: val }));
    setManualInputs((prev) => ({ ...prev, [chain]: "" }));
    showToast("Wallet linked successfully");
  }

  function disconnect(chain: Chain) {
    setWallets((prev) => ({ ...prev, [chain]: null }));
    showToast("Wallet disconnected");
  }

  const hasAny = !!(social || wallets.eth || wallets.night || wallets.xmr);

  function ctaNote() {
    const hasWallet = wallets.eth || wallets.night || wallets.xmr;
    if (social && wallets.eth && wallets.night && wallets.xmr) return "All set — social login + all wallets linked!";
    if (social && hasWallet) return "Ready! You can also link more wallets.";
    if (social) return "Signed in via social. You can also link wallets.";
    if (hasWallet) return "Wallet linked. You can also sign in socially.";
    return "Choose at least one option above to continue.";
  }

  const c: React.CSSProperties = { fontFamily: "'Outfit', sans-serif" };

  const SUMMARY_ROWS = [
    { label: "Social Login", value: social?.handle ?? null },
    { label: "Midnight Address", value: wallets.night },
    { label: "Ethereum Address", value: wallets.eth },
    { label: "Monero Address", value: wallets.xmr },
  ];

  return (
    <main style={{ ...c, background: "#000", color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", opacity: .5, marginBottom: 14 }}>Fitnight</div>
        <h1 style={{ fontSize: 34, fontWeight: 700, marginBottom: 10 }}>Connect Wallet or Create Account</h1>
        <p style={{ fontSize: 15, opacity: .5, maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
          Choose any option below to get started — you only need one to use Fitnight.
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: 760, display: "flex", flexDirection: "column", gap: 16 }}>

        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", opacity: .35 }}>Option 1 – Social Login</div>
        <div style={{ background: "#0d0d0d", border: social ? "1px solid rgba(255,255,255,.35)" : "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔑</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600 }}>Sign in with Social</div>
                <div style={{ fontSize: 12, opacity: .45, marginTop: 2 }}>No wallet required · Quick and easy</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, opacity: .5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: social ? "#4ade80" : "#444", boxShadow: social ? "0 0 6px #4ade80" : "none" }} />
              {social ? "Signed in" : socialLoading ? "Connecting..." : "Not signed in"}
            </div>
          </div>

          {social ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>{social.icon}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{social.handle}</div>
                  <div style={{ fontSize: 11, opacity: .4, marginTop: 1 }}>via {social.name}</div>
                </div>
              </div>
              <button onClick={socialLogout} style={{ ...c, background: "transparent", border: "1px solid rgba(255,100,100,.25)", color: "rgba(255,100,100,.6)", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {SOCIAL_OPTIONS.map((opt) => (
                <button key={opt.key} onClick={() => socialLogin(opt.label, opt.icon, opt.key)}
                  style={{ ...c, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", padding: "16px 12px", borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  <span style={{ fontSize: 24 }}>{opt.icon}</span>
                  {socialLoading === opt.key ? "Connecting..." : opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
          <span style={{ fontSize: 11, opacity: .3 }}>or connect a wallet directly</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", opacity: .35 }}>Option 2 – Link Wallets</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {WALLET_CONFIGS.map(({ chain, label, sub, icon, iconBg, placeholder, options, real }) => (
            <div key={chain} style={{ flex: 1, minWidth: 240, background: "#0d0d0d", border: wallets[chain] ? "1px solid rgba(255,255,255,.35)" : "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: 22 }}>
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

              <div style={{ background: "#000", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, padding: "10px 12px", fontSize: 11, fontFamily: wallets[chain] ? "monospace" : "inherit", wordBreak: "break-all", color: wallets[chain] ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.25)", minHeight: 42, display: "flex", alignItems: "center", marginBottom: 14, fontStyle: wallets[chain] ? "normal" : "italic" }}>
                {wallets[chain] ?? "No address linked yet"}
              </div>

              {wallets[chain] ? (
                <button onClick={() => disconnect(chain)} style={{ ...c, width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.35)", padding: 9, borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
                  Disconnect wallet
                </button>
              ) : (
                <div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
                    {options.map((w) => (
                      <button key={w}
                        onClick={() => real && w === "MetaMask" ? connectMetaMask() : connectWallet(chain, w)}
                        style={{ ...c, display: "flex", alignItems: "center", gap: 10, background: real && w === "MetaMask" ? "rgba(255,153,0,.08)" : "rgba(255,255,255,.05)", border: real && w === "MetaMask" ? "1px solid rgba(255,153,0,.3)" : "1px solid rgba(255,255,255,.1)", color: "#fff", padding: "10px 13px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                        <span style={{ fontSize: 16 }}>{w === "MetaMask" ? "🦊" : w === "Ctrl Wallet" ? "🛡️" : w === "Lace Wallet" ? "🃏" : w === "Feather Wallet" ? "🪶" : "🎂"}</span>
                        <span style={{ flex: 1 }}>{w}</span>
                        {real && w === "MetaMask" && <span style={{ fontSize: 10, opacity: .6, background: "rgba(255,153,0,.15)", padding: "2px 6px", borderRadius: 4 }}>LIVE</span>}
                        <span style={{ opacity: .4, fontSize: 12 }}>{"→"}</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, opacity: .4, marginBottom: 6, textAlign: "center" }}>or paste address manually</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={manualInputs[chain]}
                      onChange={(e) => setManualInputs((prev) => ({ ...prev, [chain]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ flex: 1, background: "#000", border: "1px solid rgba(255,255,255,.15)", color: "#fff", padding: "9px 12px", borderRadius: 8, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                    <button onClick={() => manualConnect(chain)} style={{ ...c, background: "#fff", color: "#000", border: "none", padding: "9px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", opacity: .35, marginTop: 4 }}>Account Summary</div>
        <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: "20px 28px" }}>
          {SUMMARY_ROWS.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.06)", fontSize: 13 }}>
              <span style={{ opacity: .5 }}>{label}</span>
              <span style={{ fontFamily: value ? "monospace" : "inherit", fontSize: value ? 11 : 12, opacity: value ? .8 : .3, fontStyle: value ? "normal" : "italic" }}>
                {value ? shortAddr(value) : "Not linked"}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", fontSize: 13 }}>
            <span style={{ opacity: .5 }}>Status</span>
            <span style={{ background: hasAny ? "rgba(74,222,128,.1)" : "rgba(255,255,255,.04)", color: hasAny ? "#4ade80" : "rgba(255,255,255,.3)", border: hasAny ? "1px solid rgba(74,222,128,.2)" : "1px solid rgba(255,255,255,.08)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
              {hasAny ? "Ready" : "Incomplete"}
            </span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 8, marginBottom: 40 }}>
          <button disabled={!hasAny} style={{ ...c, background: "#fff", color: "#000", border: "none", padding: "16px 40px", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: hasAny ? "pointer" : "not-allowed", opacity: hasAny ? 1 : .25 }}>
            Save and Continue
          </button>
          <div style={{ fontSize: 12, opacity: .35, marginTop: 10 }}>{ctaNote()}</div>
        </div>

      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", border: "1px solid rgba(255,255,255,.15)", color: "#fff", padding: "11px 20px", borderRadius: 10, fontSize: 13, zIndex: 999, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

    </main>
  );
}
