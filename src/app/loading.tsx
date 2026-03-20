export default function Loading() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[14px] text-[#5f6368]">Loading…</p>
      </div>
    </section>
  );
}
