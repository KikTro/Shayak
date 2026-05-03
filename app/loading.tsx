export default function Loading() {
  return (
    <div className="py-20">
      <div className="sahayak-container">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton mt-6 h-20 w-3/4" />
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-48 border border-border" />
          ))}
        </div>
      </div>
    </div>
  );
}
