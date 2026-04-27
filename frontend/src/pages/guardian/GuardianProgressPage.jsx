export default function GuardianProgressPage() {
  return (
    <section className="max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">Track progress (future)</h2>
      <p className="mt-2 text-sm text-slate-600">
        This page is reserved for upcoming progress tracking features.
      </p>
      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        Planned tracking includes:
        <ul className="mt-2 list-disc pl-5">
          <li>Job applications submitted on behalf</li>
          <li>School/training enrollment status</li>
          <li>Therapy and training booking timeline</li>
          <li>NGO support requests and follow-ups</li>
        </ul>
      </div>
    </section>
  )
}
