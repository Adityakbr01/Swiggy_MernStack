import HeroSection from "@/components/hero-section"
import NearbyRestaurants from "@/components/NearbyRestaurants"
import PopularDishesNearYou from "@/components/PopularDishesNearYou"

function HomePage() {
  return (
    <div>
      <HeroSection/>
      <NearbyRestaurants/>
      <PopularDishesNearYou/>
    </div>
  )
}

export default HomePage