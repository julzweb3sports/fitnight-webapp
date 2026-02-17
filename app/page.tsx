"use client";

import { useState } from "react";
import Image from "next/image";

type Chain = "eth" | "night";

interface SocialUser {
  name: string;
  handle: string;
  icon: string;
}

interface WalletState {
  eth: string | null;
  night: string | null;
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

// ── Social Logos ──
const GoogleLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const TelegramLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#229ED9"/>
    <path d="M17.5 7L5.5 11.5l3.5 1.5 1.5 4.5 2-2.5 3.5 2.5 2-10z" fill="white" opacity="0.9"/>
    <path d="M9 13l-.5 3.5 2-2.5" fill="white" opacity="0.7"/>
  </svg>
);

const XLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// ── Wallet Logos ──
const EthereumLogo = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#627EEA"/>
    <path d="M16 5v8.5l7 3.1L16 5z" fill="white" opacity="0.6"/>
    <path d="M16 5L9 16.6l7-3.1V5z" fill="white"/>
    <path d="M16 21.8v5.2l7-9.7-7 4.5z" fill="white" opacity="0.6"/>
    <path d="M16 27v-5.2l-7-4.5L16 27z" fill="white"/>
    <path d="M16 20.6l7-4.1-7-3.1v7.2z" fill="white" opacity="0.6"/>
    <path d="M9 16.5l7 4.1v-7.2L9 16.5z" fill="white" opacity="0.2"/>
  </svg>
);

const MidnightLogo = () => (
  <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="50" fill="#0a0a0a"/>
    <circle cx="50" cy="50" r="38" fill="#1a0533"/>
    <path d="M50 15 C30 15 15 30 15 50 C15 70 30 85 50 85 C45 70 43 60 43 50 C43 40 45 30 50 15Z" fill="#7B2FBE"/>
    <path d="M50 15 C70 15 85 30 85 50 C85 70 70 85 50 85 C55 70 57 60 57 50 C57 40 55 30 50 15Z" fill="#4a1a8a"/>
    <circle cx="50" cy="50" r="8" fill="#9B4FDE"/>
    <circle cx="50" cy="22" r="3" fill="#C77DFF"/>
    <circle cx="72" cy="33" r="2" fill="#C77DFF" opacity="0.7"/>
    <circle cx="28" cy="33" r="2" fill="#C77DFF" opacity="0.7"/>
  </svg>
);

const MetaMaskLogo = () => (
  <svg width="22" height="22" viewBox="0 0 35 33" fill="none">
    <path d="M32.958 1.184L19.824 10.903l2.443-5.732 10.691-3.987z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.049 1.184l13.022 9.809-2.328-5.822L2.049 1.184z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M28.23 23.533l-3.485 5.339 7.469 2.059 2.148-7.281-6.132-.117z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M0.648 23.65l2.136 7.281 7.457-2.059-3.473-5.339-6.12.117z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.855 14.515L7.767 17.65l7.391.35-.247-7.976-5.056 4.491z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M25.154 14.515l-5.107-4.587-.169 8.072 7.392-.35-2.116-3.135z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.253 28.872l4.449-2.176-3.843-2.996-.606 5.172z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.307 26.696l4.437 2.176-.594-5.172-3.843 2.996z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24.744 28.872l-4.437-2.176.35 2.891-.039 1.196 4.126-1.911z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.253 28.872l4.126 1.911-.026-1.196.337-2.891-4.437 2.176z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.379 21.67l-3.701-1.09 2.62-1.196 1.081 2.286z" fill="#233447" stroke="#233447" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.63 21.67l1.08-2.286 2.633 1.196-3.713 1.09z" fill="#233447" stroke="#233447" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.253 28.872l.632-5.339-4.105.117 3.473 5.222z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24.112 23.533l.632 5.339 3.473-5.222-4.105-.117z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M27.216 17.65l-7.392.35.685 3.67 1.08-2.286 2.633 1.196 3.000-2.93h-.006z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.678 19.58l2.62-1.196 1.081 2.286.698-3.67-7.392-.35 3.000 2.93-.007-.0z" fill="#CC6228" stroke="#CC6228" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.767 17.65l3.104 6.053-.104-3.123-3.000-2.93z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24.24 20.58l-0.117 3.123 3.104-6.053-2.987 2.93z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.158 18l-.698 3.67.88 4.528.196-5.977-.378-2.22z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.851 18l-.365 2.208.183 5.99.88-4.528-.698-3.67z" fill="#E27525" stroke="#E27525" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.63 21.67l-.88 4.528.633.442 3.843-2.996.117-3.123-3.713 1.15z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.678 19.58l.104 3.123 3.843 2.996.632-.442-.867-4.528-3.712-1.15z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.67 30.783l.039-1.196-.326-.286h-4.776l-.312.286.026 1.196-4.126-1.911 1.444 1.183 2.918 2.02h5.003l2.93-2.02 1.43-1.183-4.25 1.911z" fill="#C0AC9D" stroke="#C0AC9D" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.307 26.696l-.632-.442h-3.648l-.632.442-.337 2.891.312-.286h4.776l.326.286-.365-2.891z" fill="#161616" stroke="#161616" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M33.52 11.3l1.08-5.222-1.639-4.894-12.154 9.03 4.671 3.943 6.599 1.924 1.457-1.703-.63-.455 1.003-.917-.776-.598 1.003-.767-.612-.26h-.002z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M0.4 6.078l1.093 5.222-.696.26 1.003.767-.763.598 1.003.917-.63.455 1.444 1.703 6.599-1.924 4.671-3.943L1.924 1.184 0.4 6.078z" fill="#763E1A" stroke="#763E1A" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32.077 16.08l-6.599-1.924 1.99 2.99-2.987 6.053 3.946-.052h5.897l-2.247-7.067z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.53 14.156L2.93 16.08.683 23.147h5.884l3.934.052-2.974-6.053 1.99-2.99h.013z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.824 10.903l.416 7.097 1.964 5.067 1.964-5.067.416-7.097-2.38-2.832-2.38 2.832z" fill="#F5841F" stroke="#F5841F" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CtrlWalletLogo = () => (
  <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill="#0f0f1a"/>
    <rect x="8" y="8" width="84" height="84" rx="16" fill="#1a1a35"/>
    <path d="M50 20C33.43 20 20 33.43 20 50s13.43 30 30 30 30-13.43 30-30S66.57 20 50 20z" fill="#2d1f5e"/>
    <path d="M50 28C37.85 28 28 37.85 28 50s9.85 22 22 22 22-9.85 22-22S62.15 28 50 28z" fill="#3d2a7a"/>
    <path d="M38 50l9 9 18-18" stroke="#A78BFA" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="50" r="3" fill="#C4B5FD"/>
  </svg>
);

const LaceWalletLogo = () => (
  <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill="#0D0D0D"/>
    <path d="M50 10L85 72H15L50 10Z" fill="#00E8C6"/>
    <path d="M50 32L68 62H32L50 32Z" fill="#0D0D0D"/>
    <circle cx="50" cy="52" r="6" fill="#00E8C6" opacity="0.5"/>
  </svg>
);

const WALLET_CONFIGS = [
  {
    chain: "night" as Chain,
    label: "Midnight (NIGHT)",
    sub: "Privacy chain · ZK-powered",
    ChainLogo: MidnightLogo,
    options: [
      { name: "Ctrl Wallet", Logo: CtrlWalletLogo, live: false },
      { name: "Lace Wallet", Logo: LaceWalletLogo, live: false },
    ],
  },
  {
    chain: "eth" as Chain,
    label: "Ethereum",
    sub: "EVM-compatible · ERC-1155 NFTs",
    ChainLogo: EthereumLogo,
    options: [
      { name: "MetaMask", Logo: MetaMaskLogo, live: true },
    ],
  },
];

const SOCIAL_OPTIONS = [
  { key: "google", label: "Google", Logo: GoogleLogo },
  { key: "telegram", label: "Telegram", Logo: TelegramLogo },
  { key: "x", label: "X", Logo: XLogo },
];

export default function LoginPage() {
  const [social, setSocial] = useState<SocialUser | null>(null);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletState>({ eth: null, night: null });
  const [walletLoading, setWalletLoading] = useState<Chain | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  function socialLogin(name: string, key: string) {
    setSocialLoading(key);
    setTimeout(() => {
      setSocial({ name, handle: rand(FAKE_NAMES[key]), icon: key });
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
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      setWallets((prev) => ({ ...prev, eth: accounts[0] }));
      showToast("MetaMask connected successfully");
    } catch {
      showToast("MetaMask connection cancelled");
    } finally {
      setWalletLoading(null);
    }
  }

  function connectWallet(chain: Chain, walletName: string) {
    setWalletLoading(chain);
    setTimeout(() => {
      setWallets((prev) => ({ ...prev, [chain]: rand(FAKE_NIGHT) }));
      setWalletLoading(null);
      showToast(walletName + " linked successfully");
    }, 1400);
  }

  function disconnect(chain: Chain) {
    setWallets((prev) => ({ ...prev, [chain]: null }));
    showToast("Wallet disconnected");
  }

  const hasAny = !!(social || wallets.eth || wallets.night);

  function ctaNote() {
    const hasWallet = wallets.eth || wallets.night;
    if (social && wallets.eth && wallets.night) return "All set — social login + both wallets linked!";
    if (social && hasWallet) return "Ready! You can also link the other wallet.";
    if (social) return "Signed in via social. You can also link a wallet.";
    if (hasWallet) return "Wallet linked. You can also sign in socially.";
    return "Choose at least one option above to continue.";
  }

  const SUMMARY_ROWS = [
    { label: "Social Login", value: social?.handle ?? null },
    { label: "Midnight Address", value: wallets.night },
    { label: "Ethereum Address", value: wallets.eth },
  ];

  const dot = (on: boolean, loading?: boolean) => ({
    width: 7, height: 7, borderRadius: "50%",
    background: on ? "#4ade80" : loading ? "#f59e0b" : "#444",
    boxShadow: on ? "0 0 6px #4ade80" : "none",
  } as React.CSSProperties);

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", opacity: .5, marginBottom: 14 }}>Fitnight</div>
        <h1 style={{ fontSize: 34, fontWeight: 700, marginBottom: 10 }}>Connect Wallet or Create Account</h1>
        <p style={{ fontSize: 15, opacity: .5, maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
          Choose any option below to get started — you only need one to use Fitnight.
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: 760, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Option 1 – Social */}
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
              <div style={dot(!!social)} />
              {social ? "Signed in" : socialLoading ? "Connecting..." : "Not signed in"}
            </div>
          </div>

          {social ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {social.icon === "google" ? <GoogleLogo /> : social.icon === "telegram" ? <TelegramLogo /> : <XLogo />}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{social.handle}</div>
                  <div style={{ fontSize: 11, opacity: .4, marginTop: 1 }}>via {social.name}</div>
                </div>
              </div>
              <button onClick={socialLogout} style={{ background: "transparent", border: "1px solid rgba(255,100,100,.25)", color: "rgba(255,100,100,.6)", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {SOCIAL_OPTIONS.map(({ key, label, Logo }) => (
                <button key={key} onClick={() => socialLogin(label, key)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", padding: "18px 12px", borderRadius: 12, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
                  <Logo />
                  {socialLoading === key ? "Connecting..." : label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
          <span style={{ fontSize: 11, opacity: .3 }}>or connect a wallet directly</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
        </div>

        {/* Option 2 – Wallets */}
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", opacity: .35 }}>Option 2 – Link Wallets</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {WALLET_CONFIGS.map(({ chain, label, sub, ChainLogo, options }) => (
            <div key={chain} style={{ flex: 1, minWidth: 280, background: "#0d0d0d", border: wallets[chain] ? "1px solid rgba(255,255,255,.35)" : "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: 24 }}>

              {/* Chain Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <ChainLogo />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 12, opacity: .45, marginTop: 2 }}>{sub}</div>
                </div>
              </div>

              {/* Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", borderRadius: 8, background: "rgba(255,255,255,.04)", fontSize: 13, marginBottom: 14 }}>
                <div style={dot(!!wallets[chain], walletLoading === chain)} />
                {wallets[chain] ? "Connected" : walletLoading === chain ? "Connecting..." : "Not connected"}
              </div>

              {/* Address */}
              <div style={{ background: "#000", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, padding: "10px 12px", fontSize: 11, fontFamily: wallets[chain] ? "monospace" : "inherit", wordBreak: "break-all", color: wallets[chain] ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.25)", minHeight: 42, display: "flex", alignItems: "center", marginBottom: 14, fontStyle: wallets[chain] ? "normal" : "italic" }}>
                {wallets[chain] ?? "No address linked yet"}
              </div>

              {wallets[chain] ? (
                <button onClick={() => disconnect(chain)} style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.35)", padding: 9, borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
                  Disconnect wallet
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {options.map(({ name, Logo, live }) => (
                    <button key={name}
                      onClick={() => live ? connectMetaMask() : connectWallet(chain, name)}
                      style={{ display: "flex", alignItems: "center", gap: 12, background: live ? "rgba(255,153,0,.08)" : "rgba(255,255,255,.05)", border: live ? "1px solid rgba(255,153,0,.3)" : "1px solid rgba(255,255,255,.1)", color: "#fff", padding: "12px 14px", borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
                      <Logo />
                      <span style={{ flex: 1 }}>{name}</span>
                      {live && <span style={{ fontSize: 10, opacity: .7, background: "rgba(255,153,0,.15)", padding: "2px 8px", borderRadius: 4, color: "#f59e0b" }}>LIVE</span>}
                      <span style={{ opacity: .3, fontSize: 12 }}>→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
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

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 8, marginBottom: 40 }}>
          <button disabled={!hasAny} style={{ background: "#fff", color: "#000", border: "none", padding: "16px 40px", borderRadius: 10, fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: hasAny ? "pointer" : "not-allowed", opacity: hasAny ? 1 : .25 }}>
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
