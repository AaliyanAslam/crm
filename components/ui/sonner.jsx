"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(142.1 76.2% 36.3%)",
          "--success-text": "hsl(142.1 70.6% 97.3%)",
          "--success-border": "hsl(142.1 76.2% 36.3%)",
          "--error-bg": "hsl(0 84.2% 60.2%)",
          "--error-text": "hsl(0 0% 100%)",
          "--error-border": "hsl(0 84.2% 60.2%)",
          "--warning-bg": "hsl(38.6 92.1% 50.2%)",
          "--warning-text": "hsl(0 0% 3.6%)",
          "--warning-border": "hsl(38.6 92.1% 50.2%)",
          "--info-bg": "hsl(217.2 91.2% 59.8%)",
          "--info-text": "hsl(0 0% 100%)",
          "--info-border": "hsl(217.2 91.2% 59.8%)",
          "--border-radius": "var(--radius)"
        }
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          success: "!bg-green-600 !text-white !border-green-600",
          error: "!bg-red-600 !text-white !border-red-600",
          warning: "!bg-amber-500 !text-black !border-amber-500",
          info: "!bg-blue-600 !text-white !border-blue-600",
        },
      }}
      {...props} />
  );
}

export { Toaster }
