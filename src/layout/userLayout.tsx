
import Footer from "@/components/user/shared/Footer";
import Header from "@/components/user/shared/Header";
import { Outlet } from "react-router-dom";


const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <Header />

      {/* Middle content (changes per route) */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer/>
      

    </div>
  );
};

export default UserLayout;