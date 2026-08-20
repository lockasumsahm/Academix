import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSignedUrl } from "@/lib/storage";

interface Props {
  initials: string;
  src?: string | null;
  verified?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-9 h-9 text-[11px]",
  md: "w-11 h-11 text-sm",
  lg: "w-20 h-20 text-xl",
  xl: "w-28 h-28 text-3xl",
};

export const Avatar = ({ initials, src, verified, size = "md", className }: Props) => {
  const url = useSignedUrl(src);

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-full bg-secondary border border-border flex items-center justify-center font-semibold text-primary tracking-tight",
          sizes[size],
        )}
      >
        {url ? (
          <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          initials
        )}
      </div>
      {verified && (
        <BadgeCheck
          className={cn(
            "absolute -bottom-0.5 -right-0.5 text-accent fill-background",
            size === "lg" || size === "xl" ? "w-6 h-6" : "w-4 h-4",
          )}
          aria-label="Verified"
        />
      )}
    </div>
  );
};
