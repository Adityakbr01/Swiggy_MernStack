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
  color: "primary" | "secondary" | "accent";
  badge: string;
}

const features: Feature[] = [
  {
    id: "1",
    title: "Fast Delivery",
    description: "Get your food delivered in 30-40 minutes or less, hot and fresh to your doorstep.",
    icon: Truck,
    color: "primary",
    badge: "30-40 min delivery"
  },
  {
    id: "2",
    title: "Wide Variety",
    description: "Choose from hundreds of restaurants and cuisines to satisfy any craving you have.",
    icon: Utensils,
    color: "secondary",
    badge: "500+ restaurants"
  },
  {
    id: "3",
    title: "Trusted Quality",
    description: "We partner with top-rated restaurants to ensure the highest quality dining experience.",
    icon: ShieldCheck,
    color: "accent",
    badge: "Quality guaranteed"
  },
];

const WhyChooseUsSection: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-9 w-48 bg-gray-200 rounded-md mx-auto mb-4" />
          <Skeleton className="h-5 w-96 bg-gray-200 rounded-md mx-auto mb-12" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border-none shadow-lg bg-white rounded-xl">
                <CardContent className="p-8 text-center space-y-6">
                  <Skeleton className="h-16 w-16 bg-gray-200 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-1/2 bg-gray-200 rounded-md mx-auto" />
                  <Skeleton className="h-4 w-3/4 bg-gray-200 rounded-md mx-auto" />
                  <Skeleton className="h-6 w-1/3 bg-gray-200 rounded-full mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold font-sans text-gray-900 tracking-tight mb-3">Why Choose Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">We're committed to providing the best food delivery experience</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card-transition"
            >
              <Card 
                className={`relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full border-t-4 ${feature.color === "primary" ? "border-primary" : feature.color === "secondary" ? "border-secondary" : "border-accent"} border-none`}
              >
                <CardContent className="p-8 text-center space-y-6">
                  <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 flex items-center justify-center ${
                      feature.color === "primary" ? "bg-primary/10" :
                      feature.color === "secondary" ? "bg-secondary/10" :
                      "bg-accent/10"
                    } rounded-full`}>
                      <feature.icon className={`h-10 w-10 ${
                        feature.color === "primary" ? "text-primary" :
                        feature.color === "secondary" ? "text-secondary" :
                        "text-accent"
                      }`} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  
                  <div className="mt-6 flex justify-center">
                    <div className={`flex items-center px-3 py-1 ${
                      feature.color === "primary" ? "bg-primary/10" :
                      feature.color === "secondary" ? "bg-secondary/10" :
                      "bg-accent/10"
                    } rounded-full`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${
                        feature.color === "primary" ? "text-primary" :
                        feature.color === "secondary" ? "text-secondary" :
                        "text-accent"
                      } mr-1`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {feature.id === "1" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : feature.id === "2" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        )}
                      </svg>
                      <span className={`${
                        feature.color === "primary" ? "text-primary" :
                        feature.color === "secondary" ? "text-secondary" :
                        "text-accent"
                      } text-xs font-medium`}>{feature.badge}</span>
                    </div>
                  </div>
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