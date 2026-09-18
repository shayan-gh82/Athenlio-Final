import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  async redirects() {
    return [
      ...["login", "register", "courses", "tutors", "blog", "cart", "dashboard"].map((path) => ({ source: `/${path}/:path*`, destination: `/fa/${path}/:path*`, permanent: false })),
      { source: "/:locale(fa|en)/dashboard/student/edit", destination: "/:locale/dashboard/student/profile", permanent: false },
    ];
  },
};

export default nextConfig;
