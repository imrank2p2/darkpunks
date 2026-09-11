"use client";

import { useEffect, useMemo, useState } from "react";


import {
  ACTIVATION_CONTRACT_ADDRESS,
  ACTIVATION_COST_DARK,
  CONTRACT_ADDRESS,
  DARK_TOKEN_ADDRESS,
} from "@/lib/contract";

import {
  activatePunk,
  claimPunkRewards,
  readActivationState,
  readDarkBalance,
} from "@/lib/activation";

import {
  connectWallet,
  ensureRobinhoodChain,
  getConnectedAccount,
  readOwnedTokenIds,
} from "@/lib/wallet";

const SHOWCASE_IDS = [311, 689, 1043, 1753];


function PunkVideo({
  id,
  className = "",
}: {
  id: number;
  className?: string;
}) {
  
  return (
    <video
      className={className}
      src={`/nft/${id}.mp4`}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
    />
  );
}

export default function Home() {
  const [wallet, setWallet] = useState("");
  const [ids, setIds] = useState<number[]>([]);
  const [selected, setSelected] = useState<number>(311);
  const [active, setActive] = useState<number[]>([]);
  const [darkBalance, setDarkBalance] = useState("0");
  const [claimableEth, setClaimableEth] = useState("0");
  const [weight, setWeight] = useState("0.00X");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showConsent, setShowConsent] = useState(true);

  const isActive = active.includes(selected);

  const visiblePunks = useMemo(() => {
    return ids.length ? ids.slice(0, 18) : SHOWCASE_IDS;
  }, [ids]);

  async function loadOwnedPunks(account: string) {
    const result = await readOwnedTokenIds(account);

    setIds(result.ids);

    if (result.ids[0] !== undefined) {
      setSelected(result.ids[0]);
    }

    try {
      const balance = await readDarkBalance(account);
      setDarkBalance(balance.formatted);
    } catch {
      setDarkBalance("0");
    }
  }

  async function refreshSelectedState(tokenId: number) {
    if (!ACTIVATION_CONTRACT_ADDRESS) {
      setClaimableEth("0");
      setWeight("0.00X");
      setActive([]);
      return;
    }

    try {
      const state = await readActivationState(tokenId);

      setClaimableEth(state.pendingEth);
      setWeight(state.weight);

      setActive(
        state.activated
          ? [tokenId]
          : []
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not read activation state"
      );
    }
  }

  useEffect(() => {
    let cancelled = false;

    getConnectedAccount().then(async (account) => {
      if (!account || cancelled) return;

      setWallet(account);

      try {
        await ensureRobinhoodChain();

        if (!cancelled) {
          await loadOwnedPunks(account);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Could not load DARK PUNKS"
          );
        }
      }
    });

    const ethereum = window.ethereum;

    const handleAccountsChanged = (accounts: unknown) => {
      const next = Array.isArray(accounts)
        ? String(accounts[0] || "")
        : "";

      setWallet(next);
      setIds([]);
      setActive([]);

      if (!next) return;

      loadOwnedPunks(next).catch((e) => {
        setError(
          e instanceof Error
            ? e.message
            : "Could not load DARK PUNKS"
        );
      });
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    ethereum?.on?.(
      "accountsChanged",
      handleAccountsChanged
    );

    ethereum?.on?.(
      "chainChanged",
      handleChainChanged
    );

    return () => {
      cancelled = true;

      ethereum?.removeListener?.(
        "accountsChanged",
        handleAccountsChanged
      );

      ethereum?.removeListener?.(
        "chainChanged",
        handleChainChanged
      );
    };
  }, []);

  useEffect(() => {
    const accepted =
      window.localStorage.getItem(
        "darkpunks-disclaimer-accepted"
      );

    if (!accepted) {
      setShowDisclaimer(true);
    }
  }, []);

  function acceptDisclaimer() {
    window.localStorage.setItem(
      "darkpunks-disclaimer-accepted",
      "true"
    );

    setShowDisclaimer(false);
  }

  useEffect(() => {
    if (
      selected &&
      ACTIVATION_CONTRACT_ADDRESS
    ) {
      refreshSelectedState(selected);
    }
  }, [selected]);

  async function connect() {
    setBusy(true);
    setError("");

    try {
      const account = await connectWallet();

      setWallet(account);

      await loadOwnedPunks(account);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Wallet connection failed"
      );
    } finally {
      setBusy(false);
    }
  }

  async function activate() {
    if (!wallet) {
      setError("CONNECT WALLET FIRST");
      return;
    }

    if (!ids.includes(selected)) {
      setError(
        "SELECT AN OWNED DARK PUNK FIRST"
      );
      return;
    }

    if (!ACTIVATION_CONTRACT_ADDRESS) {
      setError(
        "ACTIVATION CONTRACT NOT DEPLOYED YET"
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await activatePunk(selected);

      await refreshSelectedState(selected);

      const balance =
        await readDarkBalance(wallet);

      setDarkBalance(
        balance.formatted
      );

      setActiveStep(3);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "ACTIVATION FAILED"
      );
    } finally {
      setBusy(false);
    }
  }

  async function claim() {
    if (!wallet) {
      setError("CONNECT WALLET FIRST");
      return;
    }

    if (!ACTIVATION_CONTRACT_ADDRESS) {
      setError(
        "ACTIVATION CONTRACT NOT DEPLOYED YET"
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await claimPunkRewards(selected);

      await refreshSelectedState(selected);

      setActiveStep(4);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "CLAIM FAILED"
      );
    } finally {
      setBusy(false);
    }
  }

  function goToStep(step: number) {
    setActiveStep(step);

    const targets: Record<number, string> = {
      1: "field",
      2: "activation",
      3: "rewards",
      4: "rewards",
    };

    const target =
      document.getElementById(
        targets[step]
      );

    target?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <>
      <main className="site-shell">

      {showDisclaimer && (
        <div
          className="disclaimer-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-title"
        >
          <div className="disclaimer-modal">

            <div className="modal-status">
              <span>
                <i /> PROTOCOL ACCESS WARNING
              </span>

              <span>
                READ BEFORE ENTERING
              </span>
            </div>

            <h2 id="disclaimer-title">
              DARK PUNKS
              <br />
              RISK DISCLOSURE
            </h2>

            <p>
              DARK PUNKS IS AN EXPERIMENTAL
              DIGITAL-ASSET PROTOCOL.
              NFTS, TOKENS, SMART CONTRACTS,
              AND BLOCKCHAIN TRANSACTIONS
              INVOLVE RISK.
            </p>

            <ul>
              <li>
                $DARK MAY LOSE SOME OR ALL OF
                ITS VALUE.
              </li>

              <li>
                ACTIVATION REQUIRES $DARK TO
                BE BURNED AND THE BURN IS
                IRREVERSIBLE.
              </li>

              <li>
                REWARDS, UTILITY, VALUE, AND
                AVAILABILITY ARE NOT
                GUARANTEED.
              </li>

              <li>
                SMART CONTRACTS, WALLETS, AND
                BLOCKCHAIN NETWORKS CAN FAIL
                OR BE COMPROMISED.
              </li>

              <li>
                NOTHING ON THIS WEBSITE IS
                FINANCIAL, INVESTMENT, OR
                LEGAL ADVICE.
              </li>
            </ul>

            <div className="disclaimer-links">
              <a href="#how-it-works">
                HOW IT WORKS
              </a>

              <a href="#docs">
                PROTOCOL DOCS
              </a>

              <a href="#legal">
                LEGAL TERMS
              </a>
            </div>

            <button
              className="disclaimer-enter"
              onClick={acceptDisclaimer}
            >
              I UNDERSTAND. ENTER PROTOCOL.
            </button>

          </div>
        </div>
      )}

      <header className="topbar">
        <div className="brand">
          DARK PUNKS
        </div>

        <nav>
          <a href="#lab">LAB</a>
          <a href="#field">FIELD</a>
          <a href="#rewards">REWARDS</a>

          <a href="/protocol">PROTOCOL</a>

          <a href="#how-it-works">HOW IT WORKS</a>
          <a href="#docs">DOCS</a>
          <a href="#legal">LEGAL</a>
          <a href="#chain">CHAIN</a>
        </nav>

        <button
          className="wallet-button"
          onClick={connect}
        >
          {busy
            ? "CONNECTING"
            : wallet
              ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
              : "CONNECT WALLET"}
        </button>
      </header>

      <div className="statusbar">
        <span>
          <i /> SYSTEM ONLINE
        </span>

        <span>
          ROBINHOOD CHAIN
        </span>

        <span>
          CHAIN ID 4663
        </span>

        <span>
          DARK PUNKS PROTOCOL V1.0
        </span>

        <span className="epoch">
          NEXT EPOCH : --:--:--
        </span>
      </div>

      {error && (
        <div className="error">
          ERROR // {error}
        </div>
      )}

      <section
        className="hero"
        id="terminal"
      >
        <div className="hero-terminal">

          <div className="hero-copy">

            <div className="eyebrow">
              DARK PUNKS // REWARD ENGINE
            </div>

            <h1>
              DARK PUNKS
            </h1>

            <p>
              2222 PUNKS. ONE COLLECTION.
            </p>

            <p>
              SELECT A PUNK, ACTIVATE IT WITH{" "}
              <strong>$DARK</strong>,
              {" "}AND ENTER THE ENGINE.
            </p>

            <div className="hero-steps">
              <button
                type="button"
                className={`hero-step ${activeStep === 1 ? "selected" : ""}`}
                onClick={() => goToStep(1)}
                aria-pressed={activeStep === 1}
              >
                <span>01</span>
                <span>SELECT PUNK</span>
              </button>

              <button
                type="button"
                className={`hero-step ${activeStep === 2 ? "selected" : ""}`}
                onClick={() => goToStep(2)}
                aria-pressed={activeStep === 2}
              >
                <span>02</span>
                <span>ACTIVATE</span>
              </button>

              <button
                type="button"
                className={`hero-step ${activeStep === 3 ? "selected" : ""}`}
                onClick={() => goToStep(3)}
                aria-pressed={activeStep === 3}
              >
                <span>03</span>
                <span>BUILD WEIGHT</span>
              </button>

              <button
                type="button"
                className={`hero-step ${activeStep === 4 ? "selected" : ""}`}
                onClick={() => goToStep(4)}
                aria-pressed={activeStep === 4}
              >
                <span>04</span>
                <span>CLAIM</span>
              </button>
            </div>

            <button
              className="terminal-connect"
              onClick={connect}
            >
              {wallet
                ? "WALLET CONNECTED"
                : "CONNECT WALLET"}
            </button>

          </div>

          <div className="retro-computer">

            <div className="crt-monitor">

              <div className="crt-bezel">

                <div className="crt-screen">

                  <div className="crt-scanlines" />
                  <div className="crt-noise" />
                  <div className="crt-glitch glitch-one" />
                  <div className="crt-glitch glitch-two" />

                  <div className="crt-header">
                    <span>
                      SELECTED PUNK
                    </span>

                    <span>
                      STATUS: {isActive ? "ACTIVE" : "RAW"}
                    </span>
                  </div>

                  <div className="crt-content">
                    <PunkVideo id={selected} />
                  </div>

                  <div className="crt-bottom">
                    <span>
                      #{selected}
                    </span>

                    <span>
                      DARK PUNK
                    </span>
                  </div>

                  <div className="crt-info">
                    <span>
                      PUNK ID : {selected}
                    </span>

                    <span>
                      WEIGHT : {isActive ? weight : "0.00X"}
                    </span>
                  </div>

                </div>

              </div>

              <div className="crt-panel">
                <div className="crt-slot">
                  <div className="slot-dark" />
                </div>

                <div className="crt-light" />
              </div>

            </div>

            <div className="retro-keyboard">
              {Array.from({ length: 48 }).map((_, index) => (
                <div
                  className="keyboard-key"
                  key={index}
                />
              ))}
            </div>

            <div className="retro-mouse" />

          </div>

        </div>

        <div className="feature-strip">

  <div className="feature-item">
    <img
      src="/punk.png"
      alt="The Punk"
      className="feature-icon-png"
    />
    <span>THE PUNK</span>
  </div>

  <div className="feature-item">
    <img
      src="/activation.png"
      alt="The Activation"
      className="feature-icon-png"
    />
    <span>THE ACTIVATION</span>
  </div>

  <div className="feature-item">
    <img
      src="/reward.png"
      alt="The Reward Engine"
      className="feature-icon-png"
    />
    <span>THE REWARD ENGINE</span>
  </div>

  <div className="feature-item">
    <img
      src="/field.png"
      alt="The Field"
      className="feature-icon-png"
    />
    <span>THE FIELD</span>
  </div>



</div>

      </section>

      <section className="section census">

        <div className="section-kicker">
          THE CENSUS
        </div>

        <p className="section-note">
          A DARK PUNK IS AN NFT.
          ACTIVATION UNLOCKS ITS PLACE
          IN THE REWARD ENGINE.
        </p>

        <div className="stat-row">

          <article>
            <b>
              2,222
            </b>

            <span>
              TOTAL PUNKS
            </span>
          </article>

          <article>
            <b>
              {wallet
                ? String(ids.length).padStart(4, "0")
                : "0000"}
            </b>

            <span>
              YOUR PUNKS
            </span>
          </article>

          <article>
            <b>
              {ACTIVATION_COST_DARK.toLocaleString()}
            </b>

            <span>
              $DARK TO ACTIVATE
            </span>
          </article>

          <article>
            <b>
              {wallet
                ? String(active.length).padStart(2, "0")
                : "00"}
            </b>

            <span>
              ACTIVE IN WALLET
            </span>
          </article>

        </div>

      </section>


      <section
        className="section dark-buy-section"
        id="buy-dark"
      >

        <div className="section-kicker">
          GET $DARK
        </div>

        <p className="section-note">
          ACQUIRE $DARK TO ACTIVATE
          YOUR DARK PUNK.
        </p>

        <div className="dark-buy-card">

          <div className="dark-buy-token">
         < div className="dark-token-gif">
  <img
    src="/DarkPunk.gif"
    alt="DARK Punk"
  />
</div>

            <div>
              <b>$DARK</b>

              <span>
                PROTOCOL ACTIVATION TOKEN
              </span>
            </div>
          </div>

          <div className="dark-buy-copy">
            <b>
              NEED $DARK?
            </b>

            <span>
              OPEN THE $DARK LAUNCH PAGE TO ACQUIRE TOKENS BEFORE ACTIVATION.
            </span>
          </div>

          <a
            className="buy-dark-button"
            href="https://www.ponsfamily.com/launchpad/0x1318A45dDeCd1d22064ce859462be4f40CCD0a21"
            target="_blank"
            rel="noopener noreferrer"
          >
            BUY $DARK ↗
          </a>

        </div>

      </section>

      <section
        className="section activation"
        id="activation"
      >

        <div className="section-kicker">
          THE ACTIVATION
        </div>

        <p className="section-note">
          ONE PUNK. ONE ACTIVATION.
          ONE PLACE IN THE ENGINE.
        </p>

        <div className="activation-grid">

          <div className="activation-punk">

            <div className="activation-video">
              <PunkVideo
                id={selected}
              />
            </div>

            <b>
              DARK PUNK #{selected}
            </b>

          </div>

          <div className="activation-console">

            <div className="console-line">
              <span>
                PROTOCOL
              </span>

              <b>
                DARK PUNKS / REWARD ENGINE
              </b>
            </div>

            <div className="console-line">
              <span>
                TARGET
              </span>

              <b>
                PUNK #{selected}
              </b>
            </div>

            <div className="console-line">
              <span>
                YOUR $DARK
              </span>

              <b>
                {Number(
                  darkBalance || 0
                ).toLocaleString()}{" "}
                $DARK
              </b>
            </div>

            <div className="console-line">
              <span>
                REQUIRED
              </span>

              <b>
                {ACTIVATION_COST_DARK.toLocaleString()}{" "}
                $DARK
              </b>
            </div>

            <div className="console-line">
              <span>
                STATE
              </span>

              <b>
                {isActive
                  ? "ACTIVE"
                  : "RAW"}
              </b>
            </div>

            <button
              className="activate-button"
              onClick={activate}
              disabled={
                isActive || busy
              }
            >
              {busy
                ? "PROCESSING..."
                : isActive
                  ? "PUNK ACTIVE"
                  : `ACTIVATE FOR ${ACTIVATION_COST_DARK.toLocaleString()} $DARK`}
            </button>

            <small>
              {ACTIVATION_CONTRACT_ADDRESS
                ? "ON-CHAIN ACTIVATION ENABLED. APPROVE, THEN BURN $DARK TO ACTIVATE."
                : "DEPLOYMENT-SAFE MODE. ADD NEXT_PUBLIC_ACTIVATION_CONTRACT AFTER DEPLOYMENT."}
            </small>

          </div>

        </div>

      </section>

      <section
        className="section rewards"
        id="rewards"
      >

        <div className="section-kicker">
          THE REWARD TAPE
        </div>

        <p className="section-note">
          EVERY ACTIVE PUNK BUILDS WEIGHT.
          REWARDS ARE CLAIMED FROM THE VAULT.
        </p>

        <div className="reward-layout">

          <div className="tape">

            <div className="tape-title">
              DARK PUNKS // REWARD IDLE
            </div>

            <div className="weight-line">
              {[
                "2%",
                "0.5X",
                "0.75X",
                "1.00X",
                "1.25X",
              ].map((label) => (
                <div key={label}>
                  <b>
                    {label}
                  </b>

                  <span>
                    0.000
                  </span>
                </div>
              ))}
            </div>

            <div className="tape-actions">

              <button
                onClick={() =>
                  goToStep(1)
                }
              >
                SELECT PUNK
              </button>

              <button
                onClick={() =>
                  refreshSelectedState(
                    selected
                  )
                }
              >
                REFRESH WEIGHT
              </button>

              <button
                onClick={claim}
                disabled={
                  !isActive || busy
                }
              >
                CLAIM REWARDS
              </button>

            </div>

          </div>

          <aside className="claim-panel">

            <button
              onClick={claim}
              disabled={
                !isActive || busy
              }
            >
              {busy
                ? "PROCESSING..."
                : "CLAIM REWARDS"}
            </button>

            <div className="claim-stats">

              <div>
                <b>
                  {Number(
                    claimableEth || 0
                  ).toFixed(6)}
                </b>

                <span>
                  CLAIMABLE ETH
                </span>
              </div>

              <div>
                <b>
                  {isActive
                    ? weight
                    : "0.00X"}
                </b>

                <span>
                  YOUR WEIGHT
                </span>
              </div>

            </div>

            <div className="epoch-box">

              <b>
                CURRENT EPOCH
              </b>

              <span>
                {isActive
                  ? "ACTIVE PUNK READY FOR NEXT EPOCH"
                  : "ACTIVATE A PUNK TO JOIN THE REWARD ENGINE."}
              </span>

            </div>

          </aside>

        </div>

      </section>

      <section
        className="section field"
        id="field"
      >

        <div className="section-kicker">
          THE FIELD
        </div>

        <p className="section-note">
          YOUR WALLET IS THE FIELD.
          SELECT A DARK PUNK TO VIEW DETAILS.
        </p>

        <div className="field-layout">

          <div className="field-grid">

            {visiblePunks.map((id) => (

              <button
                key={id}
                className={
                  selected === id
                    ? "field-card selected"
                    : "field-card"
                }
                onClick={() => {
                  setSelected(id);
                  setActiveStep(2);
                }}
              >

                <PunkVideo
                  id={id}
                />

                <span>
                  #{id}
                </span>

              </button>

            ))}

          </div>

          <div className="selected-unit">

            <span>
              SELECTED UNIT
            </span>

            <b>
              DARK PUNK #{selected}
            </b>

            <small>
              {wallet
                ? "OWNED PUNK LOADED"
                : "CONNECT WALLET TO LOAD OWNED PUNKS"}
            </small>

          </div>

        </div>

      </section>

      <section
        className="contract-strip"
        id="network"
      >

        <article>
          <span>
            NFT CONTRACT
          </span>

          <code>
            {CONTRACT_ADDRESS}
          </code>
        </article>

        <article>
          <span>
            $DARK CONTRACT
          </span>

          <code>
            {DARK_TOKEN_ADDRESS}
          </code>
        </article>

        <article>
          <span>
            ACTIVATION VAULT
          </span>

          <code>
            {ACTIVATION_CONTRACT_ADDRESS ||
              "NOT DEPLOYED"}
          </code>
        </article>

        <article>
          <span>
            NETWORK
          </span>

          <b>
            ROBINHOOD CHAIN
          </b>

          <small>
            CHAIN ID : 4663
          </small>
        </article>

      </section>

      <section
        className="section protocol-section"
        id="how-it-works"
      >

        <div className="section-kicker">
          HOW IT WORKS
        </div>

        <p className="section-note">
          THE DARK PUNKS PROTOCOL IN
          SEVEN SIMPLE STEPS.
        </p>

        <div className="protocol-steps">

          <article>
            <span>01</span>
            <h3>OWN A DARK PUNK</h3>
            <p>
              HOLD A DARK PUNK NFT IN THE
              CONNECTED WALLET.
            </p>
          </article>

          <article>
            <span>02</span>
            <h3>ACQUIRE $DARK</h3>
            <p>
              $DARK IS THE PROTOCOL TOKEN
              USED FOR ACTIVATION.
            </p>
          </article>

          <article>
            <span>03</span>
            <h3>APPROVE</h3>
            <p>
              APPROVE THE ACTIVATION
              CONTRACT TO USE THE REQUIRED
              $DARK AMOUNT.
            </p>
          </article>

          <article>
            <span>04</span>
            <h3>ACTIVATE</h3>
            <p>
              THE CONNECTED WALLET MUST
              OWN THE SELECTED DARK PUNK.
            </p>
          </article>

          <article>
            <span>05</span>
            <h3>BURN $DARK</h3>
            <p>
              50,000 $DARK IS BURNED AS
              PART OF ACTIVATION.
            </p>
          </article>

          <article>
            <span>06</span>
            <h3>BUILD WEIGHT</h3>
            <p>
              THE ACTIVATED PUNK ENTERS
              THE REWARD ENGINE STATE.
            </p>
          </article>

          <article>
            <span>07</span>
            <h3>CLAIM</h3>
            <p>
              CLAIM FUNCTIONS ARE ONLY
              AVAILABLE WHEN ENABLED BY
              THE PROTOCOL.
            </p>
          </article>

        </div>

      </section>

      <section
        className="section protocol-section"
        id="docs"
      >

        <div className="section-kicker">
          PROTOCOL DOCUMENTATION
        </div>

        <p className="section-note">
          CURRENT ON-CHAIN ARCHITECTURE
          AND CORE PROTOCOL RULES.
        </p>

        <div className="docs-grid">

          <article>
            <h3>THE COLLECTION</h3>
            <p>
              DARK PUNKS IS A COLLECTION
              OF 2,222 NFTS.
            </p>
          </article>

          <article>
            <h3>ACTIVATION</h3>
            <p>
              ONLY THE CURRENT OWNER OF A
              DARK PUNK CAN ACTIVATE THAT
              TOKEN ID.
            </p>
          </article>

          <article>
            <h3>ACTIVATION COST</h3>
            <p>
              CURRENT ACTIVATION COST IS
              50,000 $DARK.
            </p>
          </article>

          <article>
            <h3>PERMANENT BURN</h3>
            <p>
              ACTIVATION SENDS THE
              REQUIRED $DARK THROUGH THE
              BURN FLOW. THIS ACTION IS
              NOT REVERSIBLE.
            </p>
          </article>

          <article>
            <h3>ONE-TIME STATE</h3>
            <p>
              A DARK PUNK CAN ONLY BE
              ACTIVATED ONCE.
            </p>
          </article>

          <article>
            <h3>NFT OWNERSHIP</h3>
            <p>
              ACTIVATION DOES NOT TRANSFER
              THE NFT AWAY FROM THE USER.
            </p>
          </article>

          <article>
            <h3>REWARD ENGINE</h3>
            <p>
              REWARD DISTRIBUTION DEPENDS
              ON THE FUNCTIONS AND FUNDING
              THAT ARE ACTUALLY ENABLED
              ON-CHAIN.
            </p>
          </article>

          <article>
            <h3>NETWORK</h3>
            <p>
              DARK PUNKS OPERATES ON
              ROBINHOOD CHAIN,
              CHAIN ID 4663.
            </p>
          </article>

        </div>

        <div className="protocol-contracts">

          <article>
            <span>NFT CONTRACT</span>
            <code>{CONTRACT_ADDRESS}</code>
          </article>

          <article>
            <span>$DARK CONTRACT</span>
            <code>{DARK_TOKEN_ADDRESS}</code>
          </article>

          <article>
            <span>ACTIVATION CONTRACT</span>
            <code>
              {ACTIVATION_CONTRACT_ADDRESS ||
                "NOT DEPLOYED"}
            </code>
          </article>

        </div>

      </section>

      <section
        className="section protocol-section legal-section"
        id="legal"
      >

        <div className="section-kicker">
          LEGAL + RISK DISCLOSURE
        </div>

        <p className="section-note">
          READ THESE TERMS BEFORE USING
          THE WEBSITE OR SMART CONTRACTS.
        </p>

        <div className="legal-grid">

          <article>
            <h3>NO FINANCIAL ADVICE</h3>
            <p>
              NOTHING ON THIS WEBSITE IS
              FINANCIAL, INVESTMENT, TAX,
              OR LEGAL ADVICE.
            </p>
          </article>

          <article>
            <h3>DIGITAL ASSET RISK</h3>
            <p>
              NFTS AND TOKENS MAY BE
              VOLATILE, ILLIQUID, OR LOSE
              ALL VALUE.
            </p>
          </article>

          <article>
            <h3>NO GUARANTEE</h3>
            <p>
              NO GUARANTEE IS MADE ABOUT
              VALUE, REWARDS, UTILITY,
              AVAILABILITY, OR FUTURE
              DEVELOPMENT.
            </p>
          </article>

          <article>
            <h3>IRREVERSIBLE TRANSACTIONS</h3>
            <p>
              BLOCKCHAIN TRANSACTIONS,
              INCLUDING TOKEN BURNS, MAY
              BE FINAL AND CANNOT BE
              REVERSED.
            </p>
          </article>

          <article>
            <h3>WALLET RESPONSIBILITY</h3>
            <p>
              USERS ARE RESPONSIBLE FOR
              THEIR OWN WALLET, PRIVATE
              KEYS, TRANSACTION APPROVALS,
              AND NETWORK SELECTION.
            </p>
          </article>

          <article>
            <h3>SMART CONTRACT RISK</h3>
            <p>
              SMART CONTRACTS CAN CONTAIN
              BUGS OR UNEXPECTED BEHAVIOR.
              USE IS AT YOUR OWN RISK.
            </p>
          </article>

          <article>
            <h3>THIRD-PARTY SERVICES</h3>
            <p>
              WALLETS, EXPLORERS, MARKETS,
              RPC PROVIDERS, AND OTHER
              THIRD-PARTY SERVICES ARE NOT
              CONTROLLED BY THIS WEBSITE.
            </p>
          </article>

          <article>
            <h3>PROTOCOL CHANGES</h3>
            <p>
              WEBSITE FEATURES AND
              OFF-CHAIN INFORMATION MAY
              CHANGE. ON-CHAIN CODE IS
              GOVERNED BY ITS DEPLOYED
              IMPLEMENTATION.
            </p>
          </article>

        </div>

      </section>

      <footer>
        <b>
          DARK PUNKS
        </b>

        <span>
          OWN THE PUNK.
          BURN THE DARK.
          ENTER THE ENGINE.
        </span>
      </footer>

      </main>

    {showConsent && (
      <div className="consent-overlay">
        <div className="consent-modal">

          <div className="consent-warning">
            ⚠ EXPERIMENTAL SOFTWARE: PLEASE READ
          </div>

          <p>
            DARK PUNKS is experimental software on Robinhood Chain.
            Nothing here is financial advice or an offer of securities.
            Tokens and NFTs are volatile and can go to zero.
          </p>

          <p>
            <strong>Activating burns $DARK irreversibly.</strong>
            Burned tokens cannot be recovered.
          </p>

          <p>
            NFTs, tokens and protocol mechanics may change, fail or
            have no value. You are responsible for your own decisions.
          </p>

          <button
            className="consent-button"
            onClick={() => setShowConsent(false)}
          >
            I UNDERSTAND & AGREE
          </button>

        </div>
      </div>
    )}
  </>
);
}
