import { useState, useEffect } from "react";

import Footer from "@/components/user/shared/Footer";
import Header from "@/components/user/shared/Header";
import { ServiceCategories } from "@/components/user/Dashboard/ServiceCategories";
import { LocationModal } from "@/components/user/Dashboard/LocationModal";
import { useDispatch,useSelector } from "react-redux";
import { updateLocation } from "@/redux/slice/userTokenSlice";
import type { RootState } from "@/redux/store";

const features = [
  {
    title: "On Demand / Scheduled",
    icon: "https://d27vg8jo26ejl7.cloudfront.net/images/why_joboy/On-Demand-Scheduled.webp",
  },
  {
    title: "Verified Partners",
    icon: "https://d27vg8jo26ejl7.cloudfront.net/images/why_joboy/Verified-Partners.webp",
  },
  {
    title: "Service Warranty",
    icon: "https://d27vg8jo26ejl7.cloudfront.net/images/why_joboy/Service-Warranty.webp",
  },
  {
    title: "Transparent Pricing",
    icon: "https://d27vg8jo26ejl7.cloudfront.net/images/why_joboy/Transparent-Pricing.webp",
  },
  {
    title: "Online Payments",
    icon: "https://d27vg8jo26ejl7.cloudfront.net/images/why_joboy/Online-Payments.webp",
  },
  {
    title: "Support",
    icon: "https://d27vg8jo26ejl7.cloudfront.net/images/why_joboy/customer-support.webp",
  },
];

export default function Homepage() {
  const location=useSelector((state:RootState)=>state.userTokenSlice.location)
  const user=useSelector((state:RootState)=>state.userTokenSlice.user)
  console.log(location)
  console.log(user)
  const dispatch = useDispatch();
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Show modal automatically when page loads
  useEffect(() => {
    if(!location){
      setShowLocationModal(true);
    }
  }, []);

  const handleLocationConfirm = (locationData: {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
    pincode?: string;
  }) => {
    dispatch(updateLocation(locationData));
    setShowLocationModal(false);
  };

  const handleLocationSkip = () => {
    setShowLocationModal(false);
  };

  return (
    <>
     

      {/* Location Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onConfirm={handleLocationConfirm}
        onSkip={handleLocationSkip}
      />

      <div className="min-h-screen bg-slate-50 pt-16">
        {/* Most Used Service Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                Most Used Services
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-slate-500">
                Explore our highest-rated and most frequently requested household services.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Cleaning Services", image: "https://res.cloudinary.com/dp1sx1dx2/image/upload/v1761568225/cleaning-services-web_1_cvs0dr.jpg" },
                { title: "Beauty & Wellness", image: "https://res.cloudinary.com/dp1sx1dx2/image/upload/v1761568224/beauty-service-web_1_qfcfvn.jpg" },
                { title: "Appliance Repairs", image: "https://res.cloudinary.com/dp1sx1dx2/image/upload/v1761568225/home-appliances-repair-web_w80ck9.jpg" },
                { title: "Laundry Services", image: "https://res.cloudinary.com/dp1sx1dx2/image/upload/v1761568225/laundry-service-web_2_jzc1jq.jpg" },
              ].map((service, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="overflow-hidden aspect-video relative bg-slate-100">
                    <img
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-base">{service.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Categories Section */}
        <div className="bg-white border-y border-slate-100 shadow-sm">
          <ServiceCategories setShowLocationModal={setShowLocationModal} />
        </div>

        {/* Why bookMyService Section */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex flex-col items-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                Why bookMyService?
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-slate-500">
                Experience hassle-free booking with our customer-first commitment.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
              {features.map((item, index) => (
                <div key={index} className="group flex flex-col items-center p-4 rounded-2xl hover:bg-white hover:shadow-md transition duration-300">
                  {/* ICON SECTION */}
                  <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                    {/* Background Shape */}
                    <img
                      src="https://d27vg8jo26ejl7.cloudfront.net/images/why_joboy/services-ball-shape.png"
                      alt="shape"
                      className="absolute w-full h-full object-contain animate-spin-slow opacity-80"
                    />
                    {/* Icon */}
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="w-9 h-9 object-contain z-10 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {/* TEXT */}
                  <h3 className="text-sm font-semibold text-slate-800 leading-tight">
                    {item.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="lg:w-1/2">
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/007/407/128/small/mechanic-technician-fixing-car-engine-free-vector.jpg"
                  alt="Mechanic fixing car engine"
                  className="w-full max-w-md mx-auto rounded-3xl"
                />
              </div>
              <div className="lg:w-1/2 text-center lg:text-left space-y-6">
                <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight leading-tight">
                  Find Your Nearest
                  <br />
                  Professional Partner
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed">
                  Connect instantly with qualified mechanics, electricians, cleaners, and beauty professionals. Safe, secure, and right at your doorstep.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      
    </>
  );
}
