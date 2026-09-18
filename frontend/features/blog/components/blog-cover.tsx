import { BookMarked } from "lucide-react";
import Image from "next/image";

export function BlogCover({ src, alt, priority = false, className = "" }: { src: string | null; alt: string; priority?: boolean; className?: string }) {
  return (
    <div className={`relative isolate overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary ${className}`}>
      <div className="absolute -end-12 -top-16 size-48 rounded-full bg-secondary-bright/25 blur-3xl" aria-hidden="true" />
      {src ? <Image src={src} alt={alt} fill priority={priority} unoptimized sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /> : <BookMarked className="absolute start-6 bottom-6 size-12 text-white/85" aria-hidden="true" />}
      {src ? <div className="absolute inset-0 bg-gradient-to-t from-primary/45 via-transparent to-transparent" aria-hidden="true" /> : null}
    </div>
  );
}
