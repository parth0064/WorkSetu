import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: number;
}

const RatingStars = ({ rating, max = 5, size = 16 }: RatingStarsProps) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.floor(rating)
              ? "fill-primary text-primary"
              : i < rating
              ? "fill-primary/50 text-primary"
              : "text-muted-foreground/30"
          }
        />
      ))}
      <span className="ml-1.5 text-sm font-medium text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default RatingStars;
