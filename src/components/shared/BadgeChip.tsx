import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        topRated: "bg-primary/10 text-primary border border-primary/20",
        reliable: "bg-success/10 text-success border border-success/20",
        verified: "bg-accent/10 text-accent border border-accent/20",
        new: "bg-warning/10 text-warning border border-warning/20",
      },
    },
    defaultVariants: { variant: "verified" },
  }
);

interface BadgeChipProps extends VariantProps<typeof badgeVariants> {
  label: string;
  icon?: string;
  className?: string;
}

const BadgeChip = ({ label, icon, variant, className }: BadgeChipProps) => (
  <span className={cn(badgeVariants({ variant }), className)}>
    {icon && <span>{icon}</span>}
    {label}
  </span>
);

export default BadgeChip;
