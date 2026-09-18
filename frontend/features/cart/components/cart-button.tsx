"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useLocale } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCourseCart } from "@/features/cart/cart-store";

export function AddToCartButton({ courseId, className }: { courseId: number; className?: string }) {
  const locale = useLocale();
  const fa = locale === "fa";
  const cart = useCourseCart();
  const added = cart.includes(courseId);

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      disabled={!cart.isReady || added}
      onClick={() => {
        cart.add(courseId);
        toast.success(fa ? "دوره به سبد خرید اضافه شد." : "Course added to your cart.");
      }}
    >
      {added ? <Check aria-hidden="true" /> : <ShoppingCart aria-hidden="true" />}
      {added ? (fa ? "در سبد خرید" : "In cart") : (fa ? "افزودن به سبد" : "Add to cart")}
    </Button>
  );
}
