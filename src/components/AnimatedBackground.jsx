export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b0f19]">
      <div className="absolute -left-40 -top-40 h-[600px] w-[600px] animate-pulse rounded-full bg-brand-600/20 blur-[140px]" />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse rounded-full bg-blue-600/15 blur-[140px] [animation-delay:1s]" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
    </div>
  )
}
