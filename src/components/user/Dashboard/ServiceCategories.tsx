import { authService } from "@/api/AuthService";
import type { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // adjust path if needed

interface ServiceCategory {
  _id: string;
  category: string;
  image?: string;
  slug?: string;
}

interface Props {
  setShowLocationModal: (show: boolean) => void;
}

export const ServiceCategories = ({ setShowLocationModal }: Props) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const navigate = useNavigate();

  const location = useSelector(
    (state: RootState) => state.userTokenSlice.location
  );
  console.log(location)

  const city = location?.city || "";
  const lat = location?.lat ?? 0;
  const lng = location?.lng ?? 0;

  useEffect(() => {
    if (!city || !lat || !lng) {
     console.log("location")
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await authService.getUserServices({ city, lat, lng });
        console.log(res)
        setCategories(res.data.services || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, [city, lat, lng]);

  const handleClick = (category: ServiceCategory) => {
    navigate(category.slug ? `/services/${category.slug}` : `/services/${category._id}`);
  };

  // If location is missing, show placeholder content with a button
  if (!city || !lat || !lng) {
    return (
      <section className="py-12 bg-white text-center">
        <div className="max-w-md mx-auto px-4">
          <h2 className="text-xl font-semibold mb-4">
            We need your location to show available services
          </h2>
          <p className="text-gray-600 mb-6">
            Please allow your location or set your city to see services in your area.
          </p>
          <Button onClick={() => setShowLocationModal(true)}>Set Location</Button>
        </div>
      </section>
    );
  }

  // If location exists, show categories
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              onClick={() => handleClick(category)}
              className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.category}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                )}
              </div>
              <span className="text-xs text-center font-medium text-gray-700">
                {category.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
