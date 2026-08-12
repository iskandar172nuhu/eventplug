import Link from "next/link"
import { Separator } from "@/components/ui/separator"

const footerLinks = {
  Platform: [
    { label: "About", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Contact", href: "/contact" },
  ],
  "Get Started": [
    { label: "Vendor Registration", href: "/register/vendor" },
    { label: "Customer Registration", href: "/register/customer" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3">EventPlug</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ghana&apos;s trusted marketplace for event services and rentals.
              Connecting customers with verified vendors since 2024.
            </p>
          </div>
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-semibold text-sm mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} EventPlug. All rights reserved.</span>
          <span>
            Built by{" "}
            <a
              href="https://iabestsell.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-brand-primary transition-colors"
            >
              IA Bestsell Solutions
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
