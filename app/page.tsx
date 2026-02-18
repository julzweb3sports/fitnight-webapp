"use client";

import { useState, useEffect } from "react";
import { useDynamicContext, useIsLoggedIn, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useWallet, useWalletList } from "@meshsdk/react";
import { useRouter } from "next/navigation";

interface WalletState {
  eth: string | null;
  cardano: string | null;
}

function shortAddr(addr: string) {
  return addr.slice(0, 8) + "..." + addr.slice(-6);
}

const MidnightLogo = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/midnight.png" width={22} height={22} alt="Midnight" style={{ borderRadius: 4, objectFit: "contain", display: "block" }} />
);

const CardanoLogo = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#0033AD"/>
    <path d="M16 7a1.2 1.2 0 1 1 0 2.4A1.2 1.2 0 0 1 16 7zm-5.5 2.5a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zm11 0a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zM8 14a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm16 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-13.5 4.5a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zm11 0a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zM16 22.6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" fill="white" opacity="0.9"/>
  </svg>
);

export default function LoginPage() {
  const [wallets, setWallets] = useState<WalletState>({ eth: null, cardano: null });
  const [toast, setToast] = useState<string | null>(null);
  const [cardanoError, setCardanoError] = useState<string | null>(null);

  const router = useRouter();
  const { primaryWallet, handleLogOut, user } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { connect, disconnect: meshDisconnect, connected, wallet } = useWallet();
  const availableWallets = useWalletList();

  useEffect(() => {
    if (isLoggedIn && primaryWallet?.address) {
      setWallets((prev) => ({ ...prev, eth: primaryWallet.address }));
    } else {
      setWallets((prev) => ({ ...prev, eth: null }));
    }
  }, [isLoggedIn, primaryWallet]);

  useEffect(() => {
    if (connected && wallet) {
      wallet.getChangeAddress().then((addr) => {
        setWallets((prev) => ({ ...prev, cardano: addr }));
      }).catch(() => {
        setWallets((prev) => ({ ...prev, cardano: null }));
      });
    } else {
      setWallets((prev) => ({ ...prev, cardano: null }));
    }
  }, [connected, wallet]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  async function connectCardanoWallet(walletKey: string, walletName: string) {
    setCardanoError(null);
    try {
      await connect(walletKey);
      const api = await (window as any).cardano[walletKey].enable();
      const addresses = await api.getUsedAddresses();
      const hexAddr = addresses[0] ?? await api.getChangeAddress();
      const { Address } = await import("@emurgo/cardano-serialization-lib-browser");
      const readable = Address.from_bytes(Buffer.from(hexAddr, "hex")).to_bech32();
      setWallets((prev) => ({ ...prev, cardano: readable }));
      showToast(walletName + " linked successfully");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not connect wallet";
      setCardanoError(msg);
      showToast("Connection failed");
    }
  }

  async function disconnectCardano() {
    await meshDisconnect();
    setWallets((prev) => ({ ...prev, cardano: null }));
    showToast("Cardano wallet disconnected");
  }

  async function logout() {
    await handleLogOut();
    showToast("Signed out");
  }

  const hasAny = !!(isLoggedIn || wallets.cardano);

  function ctaNote() {
    if (isLoggedIn && wallets.cardano) return "All set — social login + Cardano wallet linked!";
    if (isLoggedIn) return "Ready! You can also link your Cardano wallet.";
    if (wallets.cardano) return "Cardano linked. You can also sign in socially.";
    return "Choose at least one option above to continue.";
  }

  const SUMMARY_ROWS = [
    { label: "Social / ETH Login", value: isLoggedIn ? (user?.email ?? primaryWallet?.address ?? null) : null },
    { label: "ETH Wallet (embedded)", value: wallets.eth },
    { label: "Cardano Address", value: wallets.cardano },
  ];

  const dot = (on: boolean) => ({
    width: 7, height: 7, borderRadius: "50%",
    background: on ? "#4ade80" : "#444",
    boxShadow: on ? "0 0 6px #4ade80" : "none",
  } as React.CSSProperties);

  return (
    <main style={{ background: "#000", color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", gap: 20 }}>

        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Welcome to Fitnight</div>
          <div style={{ fontSize: 14, opacity: 0.65, marginTop: 6 }}>Sign in with social or connect your wallet</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", opacity: .55 }}>Option 1 – Social Login</div>
          {isLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,.04)", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{user?.email ?? user?.username ?? "Connected"}</div>
                  <div style={{ fontSize: 11, opacity: .4, marginTop: 1 }}>ETH: {wallets.eth ? shortAddr(wallets.eth) : "creating..."}</div>
                </div>
              </div>
              <button onClick={logout} style={{ background: "transparent", border: "1px solid rgba(255,100,100,.25)", color: "rgba(255,100,100,.6)", padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <DynamicWidget />
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
          <span style={{ fontSize: 11, opacity: .5 }}>or connect a wallet directly</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", opacity: .55 }}>Option 2 – Link Wallets</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>

          {/* Midnight Preview Panel */}
          <div style={{ flex: 1, minWidth: 280, background: "#0d0d0d", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 24, opacity: 0.5, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.5)", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "3px 9px", borderRadius: 20 }}>Coming Soon</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <MidnightLogo />
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Midnight (NIGHT)</div>
                <div style={{ fontSize: 12, opacity: .45, marginTop: 2 }}>Privacy chain · ZK-powered</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", borderRadius: 8, background: "rgba(255,255,255,.04)", fontSize: 13, marginBottom: 14 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#444" }} />Not available yet
            </div>
            <div style={{ background: "#000", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "rgba(255,255,255,.2)", minHeight: 42, display: "flex", alignItems: "center", marginBottom: 14, fontStyle: "italic" }}>No address linked yet</div>
            <button disabled style={{ width: "100%", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", color: "rgba(255,255,255,.2)", padding: 9, borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "not-allowed" }}>Coming soon</button>
          </div>

          {/* Cardano Panel */}
          <div style={{ flex: 1, minWidth: 280, background: "#0d0d0d", border: connected ? "1px solid rgba(255,255,255,.35)" : "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <CardanoLogo />
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Cardano (ADA)</div>
                <div style={{ fontSize: 12, opacity: .45, marginTop: 2 }}>Powered by Mesh SDK</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", borderRadius: 8, background: "rgba(255,255,255,.04)", fontSize: 13, marginBottom: 14 }}>
              <div style={dot(connected)} />{connected ? "Connected" : "Not connected"}
            </div>
            <div style={{ background: "#000", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, padding: "10px 12px", fontSize: 11, fontFamily: wallets.cardano ? "monospace" : "inherit", wordBreak: "break-all", color: wallets.cardano ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.25)", minHeight: 42, display: "flex", alignItems: "center", marginBottom: 14, fontStyle: wallets.cardano ? "normal" : "italic" }}>
              {wallets.cardano ?? "No address linked yet"}
            </div>
            {cardanoError && (
              <div style={{ fontSize: 11, color: "rgba(255,100,100,.7)", marginBottom: 10, padding: "8px 12px", background: "rgba(255,50,50,.07)", borderRadius: 8, border: "1px solid rgba(255,50,50,.15)" }}>{cardanoError}</div>
            )}
            {connected ? (
              <button onClick={disconnectCardano} style={{ width: "100%", background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.35)", padding: 9, borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>Disconnect wallet</button>
            ) : availableWallets.length === 0 ? (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)", textAlign: "center", padding: "12px 0", fontStyle: "italic" }}>No Cardano wallet detected. Install Eternl, Nami or Lace.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {availableWallets.map((w) => (
                  <button key={w.id} onClick={() => connectCardanoWallet(w.id, w.name)}
                    style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", padding: "12px 14px", borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.icon} width={22} height={22} alt={w.name} style={{ borderRadius: 4, objectFit: "contain" }} />
                    <span style={{ flex: 1 }}>{w.name}</span>
                    <span style={{ opacity: .3, fontSize: 12 }}>→</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", opacity: .55, marginTop: 4 }}>Account Summary</div>
        <div style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: "20px 28px" }}>
          {SUMMARY_ROWS.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,.06)", fontSize: 13 }}>
              <span style={{ opacity: .7 }}>{label}</span>
              <span style={{ fontFamily: value ? "monospace" : "inherit", fontSize: value ? 11 : 12, opacity: value ? .8 : .3, fontStyle: value ? "normal" : "italic" }}>
                {value ? shortAddr(value) : "Not linked"}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", fontSize: 13 }}>
            <span style={{ opacity: .7 }}>Status</span>
            <span style={{ background: hasAny ? "rgba(74,222,128,.1)" : "rgba(255,255,255,.04)", color: hasAny ? "#4ade80" : "rgba(255,255,255,.3)", border: hasAny ? "1px solid rgba(74,222,128,.2)" : "1px solid rgba(255,255,255,.08)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
              {hasAny ? "Ready" : "Incomplete"}
            </span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 8, marginBottom: 40 }}>
          <button
            disabled={!hasAny}
            onClick={() => router.push("/dashboard")}
            style={{ background: "#fff", color: "#000", border: "none", padding: "16px 40px", borderRadius: 10, fontSize: 16, fontWeight: 700, fontFamily: "inherit", cursor: hasAny ? "pointer" : "not-allowed", opacity: hasAny ? 1 : .25 }}>
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