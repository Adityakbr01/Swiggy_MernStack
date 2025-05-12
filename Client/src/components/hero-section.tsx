"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import HeroSkeleton from "./HeroSkeleton";

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <HeroSkeleton />}

      <section
        className={`bg-gradient-to-b from-white to-gray-50 py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0 absolute -z-10"
        }`}
      >
        <div className="absolute bg-red-500 h-72 w-72 -top-32 left-1/2 -translate-x-full rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
          <div className="text-center lg:text-left max-w-xl space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl lato-black-italic sm:text-5xl font-extrabold text-gray-900 tracking-tight"
            >
              Delicious Food Delivered To Your Door
            </motion.h1>
            <p className="text-lg text-gray-600">
              Order from your favorite restaurants and track your delivery in real-time.
            </p>
            <div className="flex justify-center lg:justify-start space-x-4">
              <Button
                size="lg"
                className="text-white rounded-full cursor-pointer bg-orange-600 hover:bg-orange-700"
              >
                Order Now
              </Button>
              <Button variant="outline" className="rounded-full cursor-pointer" size="lg">
                View Restaurants
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 custom-cursor-emoji"
          >
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Delicious food"
              onLoad={() => setLoaded(true)}
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </motion.div>
        </div>
      </section>
    </>
  );
}
