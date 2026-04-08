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

      <div className="min-h-screen bg-white">
        <br />

        {/* Most Used Service Section */}
        <section className="bg-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Most Used Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "CLEANING SERVICE", image: "https://res.cloudinary.com/dp1sx1dx2/image/upload/v1761568225/cleaning-services-web_1_cvs0dr.jpg" },
                { title: "BEAUTY SERVICE", image: "https://res.cloudinary.com/dp1sx1dx2/image/upload/v1761568224/beauty-service-web_1_qfcfvn.jpg" },
                { title: "APPLIANCE REPAIRS", image: "https://res.cloudinary.com/dp1sx1dx2/image/upload/v1761568225/home-appliances-repair-web_w80ck9.jpg" },
                { title: "LAUNDRY SERVICES", image: "https://res.cloudinary.com/dp1sx1dx2/image/upload/v1761568225/laundry-service-web_2_jzc1jq.jpg" },
              ].map((service, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-center">{service.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Categories Section */}
        <ServiceCategories setShowLocationModal={setShowLocationModal} />

        {/* Why bookMyService Section */}
        <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-10">WHY bookMyService?</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {features.map((item, index) => (
            <div key={index} className="group flex flex-col items-center">
              
              {/* ICON SECTION */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                
                {/* Background Shape */}
                <img
                  src="https://d27vg8jo26ejl7.cloudfront.net/images/why_joboy/services-ball-shape.png"
                  alt="shape"
                  className="absolute w-full h-full object-contain animate-spin-slow"
                />

                {/* Icon */}
                <img
                  src={item.icon}
                  alt={item.title}
                  className="w-10 h-10 object-contain z-10 group-hover:scale-110 transition-transform"
                />
              </div>

              {/* TEXT */}
              <h3 className="mt-4 text-sm font-semibold text-gray-800 leading-tight">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>

        {/* Call to Action Section */}
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="lg:w-1/2 mb-8 lg:mb-0">
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/007/407/128/small/mechanic-technician-fixing-car-engine-free-vector.jpg"
                  alt="Mechanic with car illustration"
                  className="w-full max-w-md mx-auto"
                />
              </div>
              <div className="lg:w-1/2 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Find your nearest
                  <br />
                  Mechanic
                </h2>
                
              </div>
            </div>
          </div>
        </section>
      </div>

      
    </>
  );
}
