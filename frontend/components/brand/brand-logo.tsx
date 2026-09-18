import Image from "next/image";

import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("relative block h-10 w-[175px]", className)}>
      <Image
        src="/brand/athenlio-logo-horizontal.svg"
        alt="Athenlio"
        fill
        priority
        className="object-contain object-start dark:hidden"
        sizes="175px"
      />
      <Image
        src="/brand/athenlio-logo-horizontal-dark.svg"
        alt=""
        aria-hidden="true"
        fill
        priority
        className="hidden object-contain object-start dark:block"
        sizes="175px"
      />
    </span>
  );
}
