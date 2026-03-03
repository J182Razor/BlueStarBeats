export default function PrivacyPage() {
  return (
    <section className="mx-auto w-full max-w-screen-sm space-y-3 px-4 pb-28 pt-4 text-sm text-slate-200/85">
      <h1 className="font-display text-2xl font-semibold text-white">Privacy</h1>
      <p>BlueStarBeats uses Supabase for authentication and account-linked data storage.</p>
      <p>Stripe processes payment details directly; BlueStarBeats stores purchase metadata and entitlement state.</p>
      <p>We collect functional usage signals such as session counts, presets/programs, and marketplace imports to operate the product.</p>
      <p>Local browser storage is used for fast playback settings and demo-mode state when an authenticated account is not active.</p>
      <p>You can request account data deletion by deleting your account and associated records in Supabase-backed environments.</p>
    </section>
  );
}
