import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Define Types
interface Testimonial {
  id: string;
  quote: string;
  name: string;
  rating: number;
  restaurant: string;
  timeAgo: string;
  userType: string;
  initials: string;
  profileColor: "primary" | "secondary" | "accent";
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    quote: "The food was delivered so fast, and it was still hot! Amazing service. I'll definitely be ordering again soon.",
    name: "Amit Sharma",
    rating: 5,
    restaurant: "Italian Restaurant",
    timeAgo: "3 days ago",
    userType: "Loyal customer",
    initials: "AS",
    profileColor: "primary"
  },
  {
    id: "2",
    quote: "I love the variety of restaurants available. Something for everyone! The app is so easy to use too.",
    name: "Priya Singh",
    rating: 4,
    restaurant: "Chinese Restaurant",
    timeAgo: "1 week ago",
    userType: "Foodie explorer",
    initials: "PS",
    profileColor: "secondary"
  },
  {
    id: "3",
    quote: "Tracking my order in real-time was super convenient. Highly recommend! The delivery person was also very polite.",
    name: "Rahul Verma",
    rating: 5,
    restaurant: "Indian Restaurant",
    timeAgo: "2 days ago",
    userType: "Regular user",
    initials: "RV",
    profileColor: "accent"
  },
];

const TestimonialsSection: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-5 w-5 ${i < rating ? 'text-secondary fill-secondary' : 'text-gray-300'}`} 
      />
    ));
  };

  if (!isMounted) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-9 w-64 bg-gray-200 rounded-md mx-auto mb-4" />
          <Skeleton className="h-5 w-96 bg-gray-200 rounded-md mx-auto mb-12" />
          
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            navigation
            pagination={{ clickable: true }}
            className="pb-10"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <SwiperSlide key={index}>
                <div className="px-4 py-6">
                  <Card className="overflow-hidden border-none shadow-lg bg-white rounded-xl">
                    <CardContent className="p-6 relative">
                      <Skeleton className="h-10 w-10 bg-gray-200 rounded-full mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-gray-200 rounded-md" />
                        <Skeleton className="h-3 w-24 bg-gray-200 rounded-md" />
                      </div>
                      <div className="my-4">
                        <div className="flex mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-5 w-5 mr-1 bg-gray-200 rounded-full" />
                          ))}
                        </div>
                        <Skeleton className="h-4 w-full bg-gray-200 rounded-md mb-2" />
                        <Skeleton className="h-4 w-full bg-gray-200 rounded-md mb-2" />
                        <Skeleton className="h-4 w-2/3 bg-gray-200 rounded-md" />
                      </div>
                      <div className="flex justify-between mt-6">
                        <Skeleton className="h-4 w-24 bg-gray-200 rounded-md" />
                        <Skeleton className="h-4 w-20 bg-gray-200 rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold font-sans text-gray-900 tracking-tight mb-3">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Read testimonials from our satisfied customers</p>
        </motion.div>
        
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          navigation
          pagination={{ clickable: true }}
          className="pb-10"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-6"
              >
                <Card className="card-transition bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl p-6 relative border-none">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-2xl flex items-center justify-center">
                    <Quote className="h-8 w-8 text-primary/30" />
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className={`${
                      testimonial.profileColor === "primary" ? "bg-primary/10" :
                      testimonial.profileColor === "secondary" ? "bg-secondary/10" :
                      "bg-accent/10"
                    } h-10 w-10 rounded-full flex items-center justify-center mr-3`}>
                      <span className={`${
                        testimonial.profileColor === "primary" ? "text-primary" :
                        testimonial.profileColor === "secondary" ? "text-secondary" :
                        "text-accent"
                      } font-bold`}>{testimonial.initials}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-500 text-sm">{testimonial.userType}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex mb-2">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-gray-700 italic">{`"${testimonial.quote}"`}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-6">
                    <span>{testimonial.restaurant}</span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 text-accent mr-1" />
                      {testimonial.timeAgo}
                    </span>
                  </div>
                </Card>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialsSection;