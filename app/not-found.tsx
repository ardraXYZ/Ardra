import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-6 py-24 text-center">
      <div>
        <p className="text-sm text-white/50">404</p>
        <h2 className="mt-2 text-2xl font-semibold">Page not found</h2>
        <p className="mt-2 text-white/60">The requested route does not exist.</p>
        <Link href="/" className="mt-6 inline-block text-cyan-300 hover:underline">
          Back to home
        </Link>
      </div>
    </div>
  )
}
