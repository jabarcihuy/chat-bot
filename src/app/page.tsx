import type { Metadata } from "next";
import { LandingContent } from "@/components/landing/landing-content";

export const metadata: Metadata = {
  title: "Nexus AI - The AI Workspace for Developers",
  description: "Build, document, debug, and plan software projects with AI-powered tools designed to accelerate your workflow. Multiple AI tools, one unified workspace.",
  metadataBase: new URL("https://portobar.web.id"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Nexus AI - The AI Workspace for Developers",
    description: "Multiple AI tools. One unified workspace. Faster development. Build, document, debug, and plan software projects with AI designed for developers.",
    type: "website",
    locale: "en_US",
    url: "https://portobar.web.id",
    siteName: "Nexus AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nexus AI - The AI Workspace for Developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexus AI - The AI Workspace for Developers",
    description: "Multiple AI tools. One unified workspace. Faster development. Build, document, debug, and plan software projects with AI designed for developers.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Nexus AI",
    "operatingSystem": "All",
    "applicationCategory": "DeveloperApplication, BusinessApplication",
    "description": "The AI Workspace for Developers. Multiple AI tools. One unified workspace. Faster development. Build, document, debug, and plan software projects.",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingContent />
    </>
  );
}
