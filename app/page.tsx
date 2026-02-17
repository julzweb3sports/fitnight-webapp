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
];
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

const s = (obj: Record<string, string | number | boolean | undefined>) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}) as React.CSSProperties;

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

  const fakeAddrs: Record<Chain, string[]> = {
    eth: FAKE_ETH,
    night: FAKE_NIGHT,
    xmr: FAKE_XMR,
  };

  function connectWallet(chain: Chain, walletName: string) {
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
    },
    {
      chain: "eth" as Chain,
      label: "Ethereum",
      sub: "EVM-compatible · ERC-1155 NFTs",
      icon: "⟠",
      iconBg: "rgba(98,126,234,.15)",
      placeholder: "0x...",
      options: ["MetaMask", "WalletConnect", "Coinbase Wallet"],
    },
    {
      chain: "xmr" as Chain,
      label: "Monero (XMR)",
      sub: "Privacy coin · Untraceable",
      icon: "ɱ",
      iconBg: "rgba(255,102,0,.15)",
      placeholder: "4...",
      options: ["Feather Wallet", "Cake Wallet"],
    },
  ];

  const SOCIAL_OPTIONS = [
    { key: "google", label: "Google", icon: "🔵" },
    { key: "telegram", label: "Telegram", icon: "✈️" },
    { key: "x", label: "X", icon: "🐦" },
  ];

  const SUMMARY_ROWS = [
    { label: "Social Login", value: social?.handle ?? null },
    { label: "Midnight Address", value: wallets.night },
    { label: "Ethereum Address", value: wallets.eth },
    { label: "Monero Address", value: wallets.xmr },
  ];

  return (
    <main style={s({ fontFamily: "'Outfit', sans-serif", background: "#000", color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" })}>

      <div style={s({ textAlign: "center", marginBottom: "40px" })}>
        <div style={s({ fontSize: "13px", fontWeight: 600, letterSpacing: "4px", textTransform: "uppercase", opacity: 0.5, marginBottom: "14px" })}>Fitnight</div>
        <h1 style={s({ fontSize: "34px", fontWeight: 700, marginBottom: "10px" })}>Connect Wallet or Create Account</h1>
        <p style={s({ fontSize: "15px", opacity: 0.5, maxWidth: "420px", margin: "0 auto", lineHeight: "1.6" })}>
          Choose any option below to get started — you only need one to use Fitnight.
        </p>
      </div>

      <div style={s({ width: "100%", maxWidth: "760px", display: "flex", flexDirection: "column", gap: "16px" })}>

        <div style={s({ fontSize: "11px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", opacity: 0.35 })}>Option 1 – Social Login</div>

        <div style={s({ background: "#0d0d0d", border: social ? "1px solid rgba(255,255,255,.35)" : "1px solid rgba(255,255,255,.1)", borderRadius: "16px", padding: "24px 28px" })}>
          <div style={s({ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" })}>
            <div style={s({ display: "flex", alignItems: "center", gap: "12px" })}>
              <div style={s({ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" })}>🔑</div>
              <div>
                <div style={s({ fontSize: "17px", fontWeight: 600 })}>Sign in with Social</div>
                <div style={s({ fontSize: "12px", opacity: 0.45, marginTop: "2px" })}>No wallet required · Quick and easy</div>
              </div>
            </div>
            <div style={s({ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", opacity: 0.5 })}>
              <div style={s({ width: "7px", height: "7px", borderRadius: "50%", background: social ? "#4ade80" : "#444" })} />
              {social ? "Signed in" : socialLoading ? "Connecting..." : "Not signed in"}
            </div>
          </div>

          {social ? (
            <div style={s({ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,.04)", borderRadius: "10px", padding: "12px 16px" })}>
              <div style={s({ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" })}>
                <div style={s({ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" })}>{social.icon}</div>
                <div>
                  <div style={s({ fontWeight: 600 })}>{social.handle}</div>
                  <div style={s({ fontSize: "11px", opacity: 0.4, marginTop: "1px" })}>via {social.name}</div>
                </div>
              </div>
              <button onClick={socialLogout} style={s({ background: "transparent", border: "1px solid rgba(255,100,100,.25)", color: "rgba(255,100,100,.6)", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer" })}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={s({ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" })}>
              {SOCIAL_OPTIONS.map((opt) => (
                <button key={opt.key} onClick={() => socialLogin(opt.label, opt.icon, opt.key)}
                  style={s({ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", padding: "16px 12px", borderRadius: "12px", fontSize: "13px", fontWeight: 500, fontFamily: "inherit", cursor: "pointer" })}>
                  <span style={s({ fontSize: "24px" })}>{opt.icon}</span>
                  {socialLoading === opt.key ? "Connecting..." : opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={s({ display: "flex", alignItems: "center", gap: "12px", margin: "4px 0" })}>
          <div style={s({ flex: 1, height: "1px", background: "rgba(255,255,255,.08)" })} />
          <span style={s({ fontSize: "11px", opacity: 0.3 })}>or connect a wallet directly</span>
          <div style={s({ flex: 1, height: "1px", background: "rgba(255,255,255,.08)" })} />
        </div>

        <div style={s({ fontSize: "11px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", opacity: 0.35 })}>Option 2 – Link Wallets</div>

        <div style={s({ display: "flex", gap: "16px", flexWrap: "wrap" })}>
          {WALLET_CONFIGS.map(({ chain, label, sub, icon, iconBg, placeholder, options }) => (
            <div key={chain} style={s({ flex: 1, minWidth: "240px", background: "#0d0d0d", border: wallets[chain] ? "1px solid rgba(255,255,255,.35)" : "1px solid rgba(255,255,255,.1)", borderRadius: "16px", padding: "22px" })}>
              <div style={s({ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" })}>
                <div style={s({ width: "40px", height: "40px", borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" })}>{icon}</div>
                <div>
                  <div style={s({ fontSize: "16px", fontWeight: 600 })}>{label}</div>
                  <div style={s({ fontSize: "12px", opacity: 0.45, marginTop: "2px" })}>{sub}</div>
                </div>
              </div>

              <div style={s({ display: "flex", alignItems: "center", gap: "8px", padding: "9px 13px", borderRadius: "8px", background: "rgba(255,255,255,.04)", fontSize: "13px", marginBottom: "14px" })}>
                <div style={s({ width: "7px", height: "7px", borderRadius: "50%", background: wallets[chain] ? "#4ade80" : walletLoading === chain ? "#f59e0b" : "#444" })} />
                {wallets[chain] ? "Connected" : walletLoading === chain ? "Connecting..." : "Not connected"}
              </div>

              <div style={s({ background: "#000", border: "1px solid rgba(255,255,255,.12)", borderRadius: "8px", padding: "10px 12px", fontSize: "11px", fontFamily: wallets[chain] ? "monospace" : "inherit", wordBreak: "break-all", color: wallets[chain] ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.25)", minHeight: "42px", display: "flex", alignItems: "center", marginBottom: "14px", fontStyle: wallets[chain] ? "normal" : "italic" })}>
                {wallets[chain] ?? "No address linked yet"}
              </div>

              {wallets[chain] ? (
                <button onClick={() => disconnect(chain)} style={s({ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.35)", padding: "9px", borderRadius: "8px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer" })}>
                  Disconnect wallet
                </button>
              ) : (
                <div>
                  <div style={s({ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "12px" })}>
                    {options.map((w) => (
                      <button key={w} onClick={() => connectWallet(chain, w)} style={s({ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", padding: "10px 13px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, fontFamily: "inherit", cursor: "pointer" })}>
                        <span style={s({ flex: 1 })}>{w}</span>
                        <span style={s({ opacity: 0.4, fontSize: "12px" })}>{"→"}</span>
                      </button>
                    ))}
                  </div>
                  <div style={s({ fontSize: "12px", opacity: 0.4, marginBottom: "6px", textAlign: "center" })}>or paste address manually</div>
                  <div style={s({ display: "flex", gap: "8px" })}>
                    <input
                      value={manualInputs[chain]}
                      onChange={(e) => setManualInputs((prev) => ({ ...prev, [chain]: e.target.value }))}
                      placeholder={placeholder}
                      style={s({ flex: 1, background: "#000", border: "1px solid rgba(255,255,255,.15)", color: "#fff", padding: "9px 12px", borderRadius: "8px", fontSize: "12px", fontFamily: "inherit", outline: "none" })}
                    />
                    <button onClick={() => manualConnect(chain)} style={s({ background: "#fff", color: "#000", border: "none", padding: "9px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer" })}>
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={s({ fontSize: "11px", fontWeight: 600, letterSpacing: "3px", textTransform: "uppercase", opacity: 0.35, marginTop: "4px" })}>Account Summary</div>
        <div style={s({ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.1)", borderRadius: "16px", padding: "20px 28px" })}>
          {SUMMARY_ROWS.map(({ label, value }) => (
            <div key={label} style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.06)", fontSize: "13px" })}>
              <span style={s({ opacity: 0.5 })}>{label}</span>
              <span style={s({ fontFamily: value ? "monospace" : "inherit", fontSize: value ? "11px" : "12px", opacity: value ? 0.8 : 0.3, fontStyle: value ? "normal" : "italic" })}>
                {value ? shortAddr(value) : "Not linked"}
              </span>
            </div>
          ))}
          <div style={s({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", fontSize: "13px" })}>
            <span style={s({ opacity: 0.5 })}>Status</span>
            <span style={s({ background: hasAny ? "rgba(74,222,128,.1)" : "rgba(255,255,255,.04)", color: hasAny ? "#4ade80" : "rgba(255,255,255,.3)", border: hasAny ? "1px solid rgba(74,222,128,.2)" : "1px solid rgba(255,255,255,.08)", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 })}>
              {hasAny ? "Ready" : "Incomplete"}
            </span>
          </div>
        </div>

        <div style={s({ textAlign: "center", marginTop: "8px", marginBottom: "40px" })}>
          <button disabled={!hasAny} style={s({ background: "#fff", color: "#000", border: "none", padding: "16px 40px", borderRadius: "10px", fontSize: "16px", fontWeight: 700, fontFamily: "inherit", cursor: hasAny ? "pointer" : "not-allowed", opacity: hasAny ? 1 : 0.25 })}>
            Save and Continue
          </button>
          <div style={s({ fontSize: "12px", opacity: 0.35, marginTop: "10px" })}>{ctaNote()}</div>
        </div>

      </div>

      {toast && (
        <div style={s({ position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", border: "1px solid rgba(255,255,255,.15)", color: "#fff", padding: "11px 20px", borderRadius: "10px", fontSize: "13px", zIndex: 999, whiteSpace: "nowrap" })}>
          {toast}
        </div>
      )}

    </main>
  );
}