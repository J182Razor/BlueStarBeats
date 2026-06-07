export default function PrivacyPage() {
  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-3 px-5 pb-32 pt-6 text-sm leading-relaxed text-ink-muted">
      <h1 className="h-display text-[1.75rem] text-ink">Privacy</h1>
      <p>Your account and library are stored with our managed database provider when you sign in.</p>
      <p>Payments are processed directly by Stripe. We keep purchase records and your plan status, never your card details.</p>
      <p>We collect functional usage signals, such as session counts and saved items, to operate the product. We do not sell your data.</p>
      <p>When you are not signed in, your settings and library live in your browser storage on your own device.</p>
      <p>You can request deletion of your account and all associated records at any time.</p>
    </section>
  );
}
