import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck, Utensils, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Define Types
interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const features: Feature[] = [
  {
    id: "1",
    title: "Fast Delivery",
    description: "Get your food delivered in 30-40 minutes or less.",
    icon: Truck,
  },
  {
    id: "2",
    title: "Wide Variety",
    description: "Choose from hundreds of restaurants and cuisines.",
    icon: Utensils,
  },
  {
    id: "3",
    title: "Trusted Quality",
    description: "We partner with top-rated restaurants for the best experience.",
    icon: ShieldCheck,
  },
];

const WhyChooseUsSection: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-9 w-48 bg-gray-200 rounded-md mx-auto mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border-none shadow-lg bg-white rounded-xl">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-12 w-12 bg-gray-200 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-1/2 bg-gray-200 rounded-md mx-auto" />
                  <Skeleton className="h-4 w-3/4 bg-gray-200 rounded-md mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-extrabold font-sans text-gray-900 tracking-tight text-center mb-8"
        >
          Why Choose Us
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-xl">
                <CardContent className="p-5 space-y-3 text-center">
                  <feature.icon className="h-12 w-12 text-orange-600 mx-auto" />
                  <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;