export default function CategoryListingSkeleton() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 pt-8 pb-16 md:px-6 md:pt-12 md:pb-20 lg:px-[4vw] lg:pt-14 lg:pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="h-3 w-12 rounded bg-zinc-100" />
          <span className="h-3 w-3 rounded bg-zinc-100" />
          <span className="h-3 w-16 rounded bg-zinc-100" />
          <span className="h-3 w-3 rounded bg-zinc-100" />
          <span className="h-3 w-20 rounded bg-zinc-100" />
        </div>

        {/* Header */}
        <div className="mt-6 flex flex-col gap-3 border-b border-zinc-200 pb-6 md:mt-8 md:flex-row md:items-end md:justify-between md:pb-8">
          <div className="space-y-3">
            <div className="h-8 w-48 rounded bg-zinc-100 sm:h-10 sm:w-64" />
            <div className="h-4 w-72 rounded bg-zinc-100" />
          </div>
          <div className="h-4 w-20 rounded bg-zinc-100" />
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex items-center justify-between gap-3 lg:mt-6">
          <span className="h-9 w-24 rounded-full bg-zinc-100 lg:hidden" />
          <span className="ml-auto h-9 w-40 rounded-full bg-zinc-100" />
        </div>

        {/* Sidebar + grid */}
        <div className="mt-8 grid gap-x-10 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="space-y-6">
              <div className="h-6 w-24 rounded bg-zinc-100" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 w-28 rounded bg-zinc-100" />
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((__, j) => (
                      <div
                        key={j}
                        className="h-3 w-40 rounded bg-zinc-100"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Product grid */}
          <div className="min-w-0">
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-4 md:gap-y-12 lg:gap-x-6 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div
                    className="aspect-[3/4.25]"
                    style={{ backgroundColor: "#F5F1EA" }}
                  />
                  <div className="mx-auto h-3 w-32 rounded bg-zinc-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
