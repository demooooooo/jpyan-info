import Link from 'next/link'

import { buildCommunityRows } from '@/lib/frontend-data'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function CommunityPage() {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'product-entries',
    depth: 2,
    limit: 200,
    sort: '-publishedAt',
    where: {
      isVisible: {
        equals: true,
      },
    },
  })

  const rows = buildCommunityRows(result.docs)

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-ash tracking-tight leading-tight">Community</h1>
          <p className="text-[14px] text-muted/60 mt-1">Collectors with a username, ranked by packs tried.</p>
        </div>

        <form action="" className="mb-6">
          <button className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-ash text-ink rounded-full text-[14px] font-semibold hover:bg-ash/90 transition-all shadow-card" type="button">
            Sign up to appear on the leaderboard
          </button>
        </form>

        <div>
          <div className="flex items-center gap-1 mb-6 p-1 bg-ink-2 rounded-full w-fit border border-black/[0.05]">
            <button className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 bg-ash text-ink shadow-sm" type="button">
              Collectors
            </button>
            <button className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 text-muted/50 hover:text-ash" type="button">
              Most tried
            </button>
            <button className="px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 text-muted/50 hover:text-ash" type="button">
              Most favorited
            </button>
          </div>

          <div className="space-y-2">
            {rows.map((row, index) => (
              <Link
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-ink-2 border border-black/[0.05] hover:border-black/10 hover:bg-ink transition-all"
                href={row.profilePath}
                key={`${row.authorName}-${index}`}
              >
                <span className="w-6 text-right text-[12px] font-medium text-muted/30 shrink-0 tabular-nums">{index + 1}</span>
                <div className="w-9 h-9 rounded-full bg-ash text-ink flex items-center justify-center text-[15px] font-bold shrink-0">
                  {row.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-ash leading-tight truncate">@{row.authorName}</div>
                </div>
                <div className="flex gap-4 shrink-0 text-right">
                  <div>
                    <div className="text-[15px] font-bold text-ash leading-none">{row.brands}</div>
                    <div className="text-[10px] text-muted/40 mt-0.5">brands</div>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-ash/50 leading-none">{row.tried}</div>
                    <div className="text-[10px] text-muted/40 mt-0.5">tried</div>
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-gold leading-none">{row.favorites}</div>
                    <div className="text-[10px] text-muted/40 mt-0.5">fav</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
