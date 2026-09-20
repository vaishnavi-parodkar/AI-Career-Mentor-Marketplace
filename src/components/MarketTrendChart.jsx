const years = [2021, 2022, 2023, 2024, 2025];

export default function MarketTrendChart({ values = [], title }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const points = values
    .map((value, index) => `${32 + index * 78},${160 - ((value - min) / range) * 118}`)
    .join(" ");
  const chartTitle = `${title} Market Trend Index (2021 = 100)`;

  return (
    <div className="border border-border bg-off-white p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="type-meta text-coral">2021–2025</p>
          <h3 className="mt-1 font-heading text-2xl font-bold leading-tight text-dark-green">{chartTitle}</h3>
        </div>
        <span className="type-meta">Normalized index</span>
      </div>
      <svg
        viewBox="0 0 380 200"
        className="h-auto w-full"
        role="img"
        aria-labelledby="market-trend-chart-title market-trend-chart-description"
      >
        <title id="market-trend-chart-title">{chartTitle}</title>
        <desc id="market-trend-chart-description">
          A five-point line chart showing the normalized market trend values for {title} from 2021 to 2025.
        </desc>
        {[42, 82, 122, 162].map((y) => (
          <line key={y} x1="32" x2="346" y1={y} y2={y} stroke="#E5DFCF" strokeWidth="1" />
        ))}
        <line x1="32" x2="32" y1="30" y2="164" stroke="#20312B" strokeWidth="1" />
        <line x1="32" x2="346" y1="164" y2="164" stroke="#20312B" strokeWidth="1" />
        <polyline points={points} fill="none" stroke="#064C3B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((value, index) => {
          const [x, y] = points.split(" ")[index].split(",");
          return (
            <g key={years[index]}>
              <circle cx={x} cy={y} r="5" fill="#E9877B" />
              <text x={x} y="188" textAnchor="middle" fill="#5B655F" fontSize="11">{years[index]}</text>
              <text x={x} y={Number(y) - 12} textAnchor="middle" fill="#064C3B" fontSize="11" fontWeight="700">{value}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
