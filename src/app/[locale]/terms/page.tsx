import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Git Aquarium',
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16 max-w-2xl mx-auto">
      <h1 className="font-heading text-2xl text-primary mb-2">
        Terms of Service
      </h1>
      <p className="text-foreground/50 text-sm font-mono mb-8">
        Last updated: March 2026
      </p>

      <section className="space-y-6 text-sm leading-relaxed text-foreground/80">
        <div>
          <h2 className="text-foreground font-semibold mb-2">Acceptance</h2>
          <p>
            By using Git Aquarium, you agree to these terms. If you do not
            agree, please discontinue use of the service.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-semibold mb-2">GitHub Data</h2>
          <p>
            Git Aquarium displays public data sourced from the GitHub API in
            accordance with{' '}
            <a
              href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
              className="text-primary underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub&apos;s Terms of Service
            </a>
            . All data displayed is already publicly accessible on GitHub.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-semibold mb-2">
            Limitation of Liability
          </h2>
          <p>
            Git Aquarium is provided &quot;as is&quot; without warranty of any
            kind. We are not liable for any inaccuracies in the displayed data
            or interruptions in service.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-semibold mb-2">Modifications</h2>
          <p>
            We reserve the right to update these terms at any time. Continued
            use of the service constitutes acceptance of the updated terms.
          </p>
        </div>
      </section>
    </main>
  )
}
