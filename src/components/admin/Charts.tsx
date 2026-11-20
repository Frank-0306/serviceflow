/**
 * Small, dependency-free charts for the admin overview.
 * Single series → one hue (navy), no legend; every mark has a hover tooltip,
 * and each chart ships an equivalent table for screen readers.
 */

type Daily = { date: string; count: number };

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export function DailyBars({ data, title }: { data: Daily[]; title: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const ticks = max <= 4 ? Array.from({ length: max + 1 }, (_, i) => i) : [0, Math.round(max / 2), max];
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <figure>
      <figcaption className="sr-only">{title}</figcaption>
      <div className="flex gap-3">
        {/* y axis */}
        <div aria-hidden="true" className="relative h-44 w-6 shrink-0 text-right text-[0.7rem] tabular-nums text-muted">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 leading-none" style={{ bottom: `${(t / max) * 100}%`, transform: "translateY(50%)" }}>
              {t}
            </span>
          ))}
        </div>
        <div className="relative h-44 flex-1">
          {/* gridlines */}
          {ticks.map((t) => (
            <div key={t} aria-hidden="true" className="absolute inset-x-0 border-t border-line/70" style={{ bottom: `${(t / max) * 100}%` }} />
          ))}
          <ol className="absolute inset-0 flex items-end gap-[2px]" aria-hidden="true">
            {data.map((d) => (
              <li key={d.date} className="group relative flex h-full flex-1 items-end justify-center">
                {/* generous hit area: the whole column */}
                <span
                  className="block w-full max-w-[14px] rounded-t-[4px] bg-navy transition-colors group-hover:bg-moss"
                  style={{ height: d.count ? `${(d.count / max) * 100}%` : "2px", opacity: d.count ? 1 : 0.18 }}
                />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-xs)] bg-ink px-2 py-1 text-xs text-ivory shadow group-hover:block">
                  {shortDate(d.date)}: {d.count} {d.count === 1 ? "request" : "requests"}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div aria-hidden="true" className="ml-9 mt-2 flex justify-between text-[0.7rem] text-muted">
        <span>{shortDate(data[0]?.date ?? "")}</span>
        <span>{shortDate(data[Math.floor(data.length / 2)]?.date ?? "")}</span>
        <span>Today</span>
      </div>
      {/* Tables ignore the 1px sr-only width, so the wrapper does the hiding (prevents sideways scroll on phones). */}
      <div className="sr-only">
      <table>
        <caption>
          {title}. {total} requests in total.
        </caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Requests</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{shortDate(d.date)}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}

type BarItem = { label: string; value: number; display: string; href?: string };

/** Horizontal bars with labels and values written out, so color is never needed to read them. */
export function BarList({ items, title }: { items: BarItem[]; title: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <figure>
      <figcaption className="sr-only">{title}</figcaption>
      <ul className="space-y-3.5">
        {items.map((item) => {
          const row = (
            <>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ink">{item.label}</span>
                <span className="tabular-nums text-muted">{item.display}</span>
              </div>
              <div className="mt-1.5 h-2 bg-line/50" aria-hidden="true">
                <div className="h-full rounded-r-[4px] bg-navy transition-colors group-hover:bg-moss" style={{ width: `${(item.value / max) * 100}%`, minWidth: item.value ? 4 : 0 }} />
              </div>
            </>
          );
          return (
            <li key={item.label}>
              {item.href ? (
                <a href={item.href} className="group block">
                  {row}
                </a>
              ) : (
                <div className="group">{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
