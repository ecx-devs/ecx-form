"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "../../lib/cn";

interface LogoProps {
  variant?: "light" | "dark" | "colored";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  href?: string;
}

const sizeConfig = {
  sm: { height: 28, width: 120 },
  md: { height: 36, width: 155 },
  lg: { height: 48, width: 205 },
};

export function Logo({
  variant = "colored",
  size = "md",
  showText = true,
  className,
  href = "/",
}: LogoProps) {
  const config = sizeConfig[size];

  const LogoContent = () => (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/ecx-forms-logo.png"
        alt="ECX Forms"
        width={config.width}
        height={config.height}
        className={cn(
          "object-contain",
          variant === "dark" && "brightness-0 invert",
        )}
        priority
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}
