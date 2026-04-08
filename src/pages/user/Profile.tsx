"use client";

import { Button } from "@/components/ui/button";
import { AddressesSection } from "@/components/user/Profile/AddressSection";
import { ProfileSection } from "@/components/user/Profile/ProfileSection";
import { ProfileSidebar } from "@/components/user/Profile/ProfileSideBar";
import { ReviewsSection } from "@/components/user/Profile/ReviewSection";
import { ServicesSection } from "@/components/user/Profile/ServiceSection";
import Header from "@/components/user/shared/Header";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserWallet from "./UserWallet";

type Section =
  | "profile"
  | "services-taken"
  | "wallet"
  | "reviews"
  | "addresses";

export function ProfilePage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection />;
      case "services-taken":
        return <ServicesSection type="taken" />;
      case "wallet":
        return <UserWallet />;
      case "reviews":
        return <ReviewsSection />;
      case "addresses":
        return <AddressesSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <>
      <Header />

      
        <div className="min-h-screen bg-background pt-15">
          <ProfileSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <main className="bg-white p-6 lg:p-10 ml-64 min-h-screen">
            <div className="max-w-6xl">{renderContent()}</div>
          </main>
        </div>
      
    </>
  );
}
