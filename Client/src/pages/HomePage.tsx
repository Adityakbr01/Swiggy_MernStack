import HeroSection from "@/components/hero-section"
import Footer from "@/components/Layout/Footer"
import NearbyRestaurants from "@/components/NearbyRestaurants"
// import PopularDishesNearYou from "@/components/PopularDishesNearYou"
import TestimonialsSection from "@/components/Sections/TestimonialsSection"
import WhyChooseUsSection from "@/components/Sections/WhyChooseUsSection"
// import TopCuisinesSection from "@/components/Sections/TopCuisinesSection"

function HomePage() {
  return (
    <div>
      <HeroSection />
      <NearbyRestaurants />
      {/* <PopularDishesNearYou /> */}
      <TestimonialsSection />
      <WhyChooseUsSection />
      {/* < TopCuisinesSection/> */}
      <Footer />
    </div>
  )
}

export default HomePage