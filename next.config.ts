import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // X-Powered-By 헤더 제거 (보안)
  poweredByHeader: false,

  images: {
    // WebP 자동 변환으로 이미지 최적화
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "vhtvokvnkpqkyhguizfr.supabase.co",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
    ],
  },

  experimental: {
    // 대형 패키지 트리셰이킹 힌트 (lucide-react, date-fns)
    optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
    serverActions: {
      // Server Action 요청 바디 크기 제한 (기본값 1MB → 5MB로 확장)
      bodySizeLimit: "5mb",
    },
  },
};

export default withBundleAnalyzer(nextConfig);
