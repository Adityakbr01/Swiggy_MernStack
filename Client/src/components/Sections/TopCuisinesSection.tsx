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
  count: number;
  tag?: {
    text: string;
    color: "primary" | "secondary" | "accent";
  };
}

const cuisines: Cuisine[] = [
  {
    id: "1",
    name: "Italian",
    image: "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?q=80&w=2070",
    slug: "italian",
    count: 89,
    tag: {
      text: "Popular",
      color: "secondary"
    }
  },
  {
    id: "2",
    name: "Indian",
    image: "https://images.unsplash.com/photo-1601050690597-9d44d5b1cd91?q=80&w=2070",
    slug: "indian",
    count: 76,
    tag: {
      text: "Featured",
      color: "primary"
    }
  },
  {
    id: "3",
    name: "Chinese",
    image: "https://images.unsplash.com/photo-1617093727343-2a7c78153cb6?q=80&w=2070",
    slug: "chinese",
    count: 93,
    tag: {
      text: "Popular",
      color: "secondary"
    }
  },
  {
    id: "4",
    name: "Mexican",
    image: "https://images.unsplash.com/photo-1606787842089-153c634cb21e?q=80&w=2070",
    slug: "mexican",
    count: 67,
    tag: {
      text: "Trending",
      color: "accent"
    }
  },
];

const TopCuisinesSection: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate(); // ✅ Correct Hook for Navigation

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navigateTo = (path: string) => {
    navigate(path); // ✅ Navigate to the path
  };

  if (!isMounted) {
    return (
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-9 w-48 bg-gray-200 rounded-md mx-auto mb-8" />
          <Skeleton className="h-5 w-96 bg-gray-200 rounded-md mx-auto mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-none shadow-lg bg-white rounded-xl">
                <Skeleton className="h-48 w-full bg-gray-200 rounded-t-xl" />
                <CardContent className="p-5">
                  <Skeleton className="h-6 w-1/2 bg-gray-200 rounded-md mb-2" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/3 bg-gray-200 rounded-md" />
                    <Skeleton className="h-5 w-20 bg-gray-200 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold font-sans text-gray-900 tracking-tight mb-3">Explore Top Cuisines</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover amazing restaurants specializing in your favorite cuisines</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cuisines.map((cuisine, index) => (
            <motion.div
              key={cuisine.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card-transition"
            >
              <Card
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-none"
                onClick={() => navigateTo(`/restaurants?cuisine=${cuisine.slug}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigateTo(`/restaurants?cuisine=${cuisine.slug}`);
                  }
                }}
                aria-label={`Explore ${cuisine.name} cuisine`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={cuisine.image}
                    alt={cuisine.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{cuisine.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">{cuisine.count} restaurants</span>
                    {cuisine.tag && (
                      <span className={`${cuisine.tag.color === "primary" ? "bg-primary/10 text-primary" :
                        cuisine.tag.color === "secondary" ? "bg-secondary/10 text-secondary" :
                          "bg-accent/10 text-accent"
                        } px-2 py-1 rounded-full text-xs font-medium`}>
                        {cuisine.tag.text}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <motion.button
            className="px-6 py-3 cursor-pointer bg-white border-2 border-primary text-primary font-medium rounded-full hover:text-white transition duration-300 inline-flex items-center"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.01 }}
            onClick={() => navigateTo("/restaurants")}
          >
            Explore All Cuisines
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default TopCuisinesSection;
