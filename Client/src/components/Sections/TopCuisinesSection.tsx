import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

// Define Types
interface Cuisine {
  id: string;
  name: string;
  image: string;
  slug: string;
}

const cuisines: Cuisine[] = [
  {
    id: "1",
    name: "Italian",
    image: "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?q=80&w=2070",
    slug: "italian",
  },
  {
    id: "2",
    name: "Indian",
    image: "https://images.unsplash.com/photo-1601050690597-9d44d5b1cd91?q=80&w=2070",
    slug: "indian",
  },
  {
    id: "3",
    name: "Chinese",
    image: "https://images.unsplash.com/photo-1617093727343-2a7c78153cb6?q=80&w=2070",
    slug: "chinese",
  },
  {
    id: "4",
    name: "Mexican",
    image: "https://images.unsplash.com/photo-1606787842089-153c634cb21e?q=80&w=2070",
    slug: "mexican",
  },
];

const TopCuisinesSection: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-9 w-48 bg-gray-200 rounded-md mx-auto mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-none shadow-lg bg-white rounded-xl">
                <Skeleton className="h-40 w-full bg-gray-200 rounded-t-xl" />
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-1/2 bg-gray-200 rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-extrabold font-sans text-gray-900 tracking-tight text-center mb-8"
        >
          Explore Top Cuisines
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cuisines.map((cuisine) => (
            <motion.div
              key={cuisine.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-xl cursor-pointer"
                onClick={() => navigate(`/restaurants?cuisine=${cuisine.slug}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/restaurants?cuisine=${cuisine.slug}`);
                  }
                }}
                aria-label={`Explore ${cuisine.name} cuisine`}
              >
                <div className="relative h-40 w-full group">
                  <img
                    src={cuisine.image}
                    alt={cuisine.name}
                    className="object-cover h-full w-full rounded-t-xl transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-5 text-center">
                  <h3 className="text-lg font-bold text-gray-900">{cuisine.name}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopCuisinesSection;