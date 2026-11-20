export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2 pb-4 border-b border-neutral-800">
        <div className="h-7 w-72 rounded-lg bg-neutral-800" />
        <div className="h-3.5 w-96 max-w-full rounded bg-neutral-900" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-neutral-900/60 border border-neutral-800 p-5 flex flex-col justify-between"
          >
            <div className="h-3 w-24 rounded bg-neutral-800" />
            <div className="h-7 w-20 rounded bg-neutral-800" />
          </div>
        ))}
      </div>

      <div className="h-96 rounded-2xl bg-neutral-900/60 border border-neutral-800 p-6 space-y-4">
        <div className="h-5 w-48 rounded bg-neutral-800" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((r) => (
            <div key={r} className="h-12 rounded-xl bg-neutral-800/50" />
          ))}
        </div>
      </div>
    </div>
  )
}
