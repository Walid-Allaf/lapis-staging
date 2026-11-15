import Image from "next/image";

type SiteLogoProps = {
  className?: string;
  variant?: "dark" | "white" | "whiteGold";
};

const logoByVariant = {
  dark: "/brand/logo-dark.png",
  white: "/brand/logo-white.png",
  whiteGold: "/brand/logo-white-gold.png",
} as const;

export function SiteLogo({ className = "", variant = "dark" }: SiteLogoProps) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={`block h-auto w-auto ${className}`}
      height={490}
      src={logoByVariant[variant]}
      width={1183}
    />
  );
}
