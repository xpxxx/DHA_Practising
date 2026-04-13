export function AboutPage() {
  return (
    <div className="stack">
      <section className="card">
        <h1 className="h1">About</h1>
        <p className="muted">
          This is a static website for DHA interview revision and mock oral practice. Questions are shipped as
          JSON with the site, and your learning data stays in your browser.
        </p>
      </section>

      <section className="card">
        <h2 className="h2">Disclaimer</h2>
        <ul className="list">
          <li>This website is for study and interview practice only. It is not medical advice.</li>
          <li>Please follow official policies, workplace requirements, and local laws/regulations.</li>
          <li>Keep PDF/file + page references for verification when importing your own materials.</li>
        </ul>
      </section>
    </div>
  )
}

