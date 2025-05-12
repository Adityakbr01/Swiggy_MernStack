import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
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
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    quote: "The food was delivered so fast, and it was still hot! Amazing service.",
    name: "Amit Sharma",
    rating: 5,
  },
  {
    id: "2",
    quote: "I love the variety of restaurants available. Something for everyone!",
    name: "Priya Singh",
    rating: 4,
  },
  {
    id: "3",
    quote: "Tracking my order in real-time was super convenient. Highly recommend!",
    name: "Rahul Verma",
    rating: 5,
  },
];

const TestimonialsSection: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto py-5">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-9 w-48 bg-gray-200 rounded-md" />
          </div>
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
            className="pb-10 py-6"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <SwiperSlide key={index}>
                <div className="w-80 mx-auto">
                  <Card className="overflow-hidden border-none shadow-lg bg-white rounded-xl">
                    <CardContent className="p-5 space-y-3">
                      <Skeleton className="h-4 w-3/4 bg-gray-200 rounded-md" />
                      <Skeleton className="h-4 w-full bg-gray-200 rounded-md" />
                      <Skeleton className="h-4 w-2/3 bg-gray-200 rounded-md" />
                      <div className="flex items-center space-x-1">
                        <Skeleton className="h-5 w-12 bg-gray-200 rounded-md" />
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
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto py-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-extrabold font-sans text-gray-900 tracking-tight text-center mb-8"
        >
          What Our Customers Say
        </motion.h2>
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
                className="w-80 mx-auto py-8"
              >
                <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-xl">
                  <CardContent className="p-5 space-y-3">
                    <Quote className="h-6 w-6 text-orange-600" />
                    <p className="text-sm text-gray-600 line-clamp-3">{testimonial.quote}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-900">{testimonial.name}</span>
                      <div className="flex items-center bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <Star className="h-3.5 w-3.5 mr-1 fill-green-800 stroke-green-800" />
                        {testimonial.rating}
                      </div>
                    </div>
                  </CardContent>
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