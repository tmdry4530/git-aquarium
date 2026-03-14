import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Git Aquarium',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16 max-w-2xl mx-auto">
      <h1 className="font-heading text-2xl text-primary mb-2">
        Privacy Policy
      </h1>
      <p className="text-foreground/50 text-sm font-mono mb-8">
        Last updated: March 2026
      </p>

      <section className="space-y-6 text-sm leading-relaxed text-foreground/80">
        <div>
          <h2 className="text-foreground font-semibold mb-2">Data We Use</h2>
          <p>
            Git Aquarium fetches publicly available GitHub data via the GitHub
            API. This includes repository names, star counts, programming
            languages, and contribution history. We do not access private
            repositories or personal authentication tokens.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-semibold mb-2">Caching</h2>
          <p>
            API responses are cached in Redis for up to 30 minutes to reduce
            GitHub API usage. No personal data beyond your public GitHub profile
            is stored.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-semibold mb-2">Analytics</h2>
          <p>
            We may collect anonymized usage analytics (page views, feature
            interactions) to improve the service. No personally identifiable
            information is collected.
          </p>
        </div>

        <div>
          <h2 className="text-foreground font-semibold mb-2">Contact</h2>
          <p>For privacy concerns, open an issue on our GitHub repository.</p>
        </div>
      </section>
    </main>
  )
}
