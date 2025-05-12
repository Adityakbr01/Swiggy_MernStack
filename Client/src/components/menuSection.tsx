import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useParams } from "react-router-dom"; // ← Use react-router-dom instead of next/navigation

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/redux/feature/cartSlice";
import { useAppDispatch } from "@/redux/hook";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  isVeg: boolean;
  isBestseller: boolean;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
}

export function MenuSection({ title, items }: MenuSectionProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const dispatch = useAppDispatch();
  const { id: restaurantId } = useParams();

  const handleAddToCart = (menuItem: MenuItem) => {
    dispatch(addToCart({ ...menuItem, quantity: 1, restaurantId }));
  };

  return (
    <motion.div variants={item} className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <motion.div
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {items.map((menuItem) => (
          <motion.div
            key={menuItem.id}
            className="flex gap-4 pb-4 border-b"
            variants={item}
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {menuItem.isVeg ? (
                  <div className="h-4 w-4 border border-green-500 p-0.5">
                    <div className="h-full w-full rounded-full bg-green-500"></div>
                  </div>
                ) : (
                  <div className="h-4 w-4 border border-red-500 p-0.5">
                    <div className="h-full w-full rounded-full bg-red-500"></div>
                  </div>
                )}
                <h3 className="font-medium">{menuItem.name}</h3>
                {menuItem.isBestseller && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                    }}
                  >
                    <Badge
                      variant="outline"
                      className="text-amber-500 border-amber-200 bg-amber-50"
                    >
                      Bestseller
                    </Badge>
                  </motion.div>
                )}
              </div>
              <p className="text-sm font-medium mb-1">{menuItem.price}</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {menuItem.description}
              </p>
            </div>
            <div className="relative">
              <div className="relative h-20 w-20 rounded-md overflow-hidden">
                <img
                  src={
                    menuItem.image ||
                    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop"
                  }
                  alt={menuItem.name}
                  className="object-cover h-full w-full"
                />
              </div>
              <motion.div
                onClick={() => handleAddToCart(menuItem)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  size="icon"
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full"
                >
                  <Plus className="h-4 w-4 " color="#fff" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
