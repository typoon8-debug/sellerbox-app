"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/* 가이드 §12 심플 토스트 팝업 규격
 * 400×92px, radius 4px, outline 1px #2E85FF, bg #F1FAFF
 * font 16px Bold #353535, icon 24×24 #2E85FF
 * shadow rgba(0,0,0,0.3) 0 2px 2px
 * 우측 하단 위치 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CircleCheckIcon className="text-primary size-6" />,
        info: <InfoIcon className="text-primary size-6" />,
        warning: <TriangleAlertIcon className="text-alert-red size-6" />,
        error: <OctagonXIcon className="text-alert-red size-6" />,
        loading: <Loader2Icon className="text-primary size-6 animate-spin" />,
      }}
      toastOptions={{
        style: {
          width: "400px",
          minHeight: "92px",
          borderRadius: "4px",
          border: "1px solid var(--primary)",
          backgroundColor: "var(--toast-bg)",
          color: "var(--text-body)",
          fontSize: "16px",
          fontWeight: "700",
          boxShadow: "0 2px 2px rgba(0,0,0,0.3)",
        },
      }}
      style={
        {
          "--border-radius": "4px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
