export default function Loading() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      {/* Navbar Skeleton */}
      <div className="h-16 border-b border-zinc-200 bg-white px-4 sm:px-8 flex items-center justify-between">
        <div className="w-24 h-6 bg-zinc-200 rounded-md animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-8 bg-zinc-100 rounded-full animate-pulse" />
          <div className="w-8 h-8 bg-zinc-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 space-y-8">
        <div className="space-y-3">
          <div className="w-3/4 h-10 bg-zinc-200 rounded-xl animate-pulse" />
          <div className="w-1/2 h-6 bg-zinc-100 rounded-lg animate-pulse" />
        </div>

        <div className="flex items-center gap-4 py-4 border-y border-zinc-100">
          <div className="w-10 h-10 bg-zinc-200 rounded-full animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="w-32 h-4 bg-zinc-200 rounded animate-pulse" />
            <div className="w-24 h-3 bg-zinc-100 rounded animate-pulse" />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="w-full h-48 bg-zinc-100 rounded-2xl animate-pulse" />
          <div className="w-full h-4 bg-zinc-200 rounded animate-pulse" />
          <div className="w-5/6 h-4 bg-zinc-200 rounded animate-pulse" />
          <div className="w-4/5 h-4 bg-zinc-100 rounded animate-pulse" />
        </div>
      </main>
    </div>
  )
}
