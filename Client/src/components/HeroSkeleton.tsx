export default function HeroSkeleton() {
    return (
      <section className="bg-gradient-to-b from-white to-gray-50 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute bg-red-300 h-72 w-72 -top-32 left-1/2 -translate-x-full rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
  
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 animate-pulse">
          {/* Left Skeleton */}
          <div className="space-y-6 w-full lg:w-1/2">
            <div className="h-10 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="flex space-x-4 mt-4">
              <div className="h-10 w-32 bg-gray-300 rounded-full"></div>
              <div className="h-10 w-40 bg-gray-300 rounded-full"></div>
            </div>
          </div>
  
          {/* Right Skeleton Image */}
          <div className="w-full lg:w-1/2 h-64 bg-gray-300 rounded-2xl shadow-lg"></div>
        </div>
      </section>
    );
  }
  