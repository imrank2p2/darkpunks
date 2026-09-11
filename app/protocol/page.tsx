import "./protocol.css";

const steps = [
  {
    number: "01",
    title: "MINT A DARK PUNK",
    text: "Mint your DARK PUNK. Every Punk begins in its RAW state.",
  },
  {
    number: "02",
    title: "ACTIVATE",
    text: "Activation is coming. Holders will be able to activate their DARK PUNK through the DARK Protocol.",
  },
  {
    number: "03",
    title: "BUILD WEIGHT",
    text: "Activated DARK PUNKS will enter the protocol and participate in the future reward system.",
  },
  {
    number: "04",
    title: "REWARD EPOCHS",
    text: "Future reward epochs will distribute supported on-chain reward assets to eligible participants.",
  },
];

const stocks = [
  ["SPY", "SPDR S&P 500", "/stocks/spy.png"],
  ["TSLA", "Tesla", "/stocks/tsla.png"],
  ["MSTR", "Strategy", "/stocks/mstr.png"],
  ["SPCX", "SpaceX", "/stocks/spcx.png"],
  ["PLTR", "Palantir", "/stocks/pltr.png"],
  ["GME", "GameStop", "/stocks/gme.png"],
  ["NVDA", "NVIDIA", "/stocks/nvda.png"],
  ["AAPL", "Apple", "/stocks/aapl.png"],
  ["NFLX", "Netflix", "/stocks/nflx.png"],
  ["RDDT", "Reddit", "/stocks/rddt.png"],
];

export default function ProtocolPage() {
  return (
    <main className="protocol-page">

      <section className="protocol-hero">
        <div className="protocol-wrap">

          <div className="protocol-badge">
            <span />
            PROTOCOL UNDER DEVELOPMENT
          </div>

          <h1>
            THE DARK<br />
            <strong>PROTOCOL.</strong>
          </h1>

          <p className="protocol-intro">
            DARK PUNKS are more than a collection.
            <br /><br />
            Every Punk begins RAW. What happens next is being built.
            Activation, protocol weight and future reward epochs are coming.
          </p>

          <div className="protocol-buttons">
            <a
              href="https://opensea.io/collection/darkpunks01"
              target="_blank"
              rel="noopener noreferrer"
              className="protocol-mint-btn"
            >
              MINT DARK PUNK
            </a>

            <a href="#how-it-works" className="protocol-outline-btn">
              HOW IT WORKS ↓
            </a>
          </div>

        </div>
      </section>

      <section id="how-it-works" className="protocol-section">
        <div className="protocol-wrap">

          <div className="section-label">THE FLOW</div>

          <h2>HOW IT WILL WORK.</h2>

          <div className="steps-grid">
            {steps.map((step) => (
              <div className="step-card" key={step.number}>
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="protocol-section dark-path-section">
        <div className="protocol-wrap">

          <div className="section-label">THE DARK PATH</div>

          <h2>FROM RAW TO REWARD.</h2>

          <div className="path-grid">
            {[
              "RAW PUNK",
              "ACTIVATE",
              "BUILD WEIGHT",
              "REWARD EPOCH",
              "CLAIM",
            ].map((item, index) => (
              <div className="path-item" key={item}>
                <span>STEP {index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>

        </div>
      </section>

      <section className="protocol-section rewards-section">
        <div className="protocol-wrap">

          <div className="reward-heading">
            <div className="section-label">FUTURE REWARD ASSETS</div>

            <h2>
              WHAT COULD BE<br />
              IN THE FIELD.
            </h2>

            <p>
              The DARK Protocol is being designed to support future
              on-chain reward assets, including supported Robinhood Chain
              Stock Tokens.
            </p>
          </div>

          <div className="stocks-grid">
            {stocks.map(([ticker, name, logo]) => (
              <div className="stock-card" key={ticker}>

                <div className="stock-coming">COMING</div>

                <div className="stock-logo">
                  <img
                    src={logo}
                    alt={name}
                  />
                </div>

                <div className="stock-ticker">{ticker}</div>
                <div className="stock-name">{name}</div>

              </div>
            ))}
          </div>

          <div className="protocol-note">
            FINAL REWARD ASSETS, ELIGIBILITY, EPOCHS AND DISTRIBUTION
            MECHANICS ARE STILL UNDER DEVELOPMENT AND MAY CHANGE BEFORE
            PROTOCOL LAUNCH.
          </div>

        </div>
      </section>

      <section className="protocol-final">
        <div className="protocol-wrap">

          <div className="final-box">

            <div className="protocol-badge">
              COMING SOON
            </div>

            <h2>
              MINT IT.<br />
              <strong>HOLD IT RAW.</strong>
            </h2>

            <p>
              The protocol is being built.
              <br />
              Activation is coming.
              <br />
              The Field is coming.
              <br />
              Future reward epochs are coming.
            </p>

            <a
              href="https://opensea.io/collection/darkpunks01"
              target="_blank"
              rel="noopener noreferrer"
              className="protocol-mint-btn"
            >
              MINT DARK PUNK
            </a>

          </div>

        </div>
      </section>

    </main>
  );
}