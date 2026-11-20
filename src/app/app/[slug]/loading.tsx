export default function TenantLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-white/10" />
          <div className="h-7 w-64 rounded-lg bg-white/10" />
          <div className="h-3.5 w-80 max-w-full rounded bg-white/[0.06]" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-white/[0.07]" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-[#0D0E15] border border-white/[0.06] p-5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-white/10" />
              <div className="w-8 h-8 rounded-lg bg-white/[0.07]" />
            </div>
            <div className="h-6 w-28 rounded bg-white/10" />
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 h-80 rounded-2xl bg-[#0D0E15] border border-white/[0.06] p-5 space-y-4">
          <div className="h-5 w-44 rounded bg-white/10" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="h-12 rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 h-80 rounded-2xl bg-[#0D0E15] border border-white/[0.06] p-5 space-y-4">
          <div className="h-5 w-36 rounded bg-white/10" />
          <div className="space-y-3">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-16 rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
