import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-8">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-block">
          <h1 className="text-2xl font-bold text-primary">
            EventPlug
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Find the best vendors for your events
          </p>
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
