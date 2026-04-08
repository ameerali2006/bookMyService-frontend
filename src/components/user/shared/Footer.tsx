import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Open Designers Column */}
          <div>
            <h3 className="text-lg font-bold mb-4">Open Designers</h3>
            <p className="text-gray-300 text-sm mb-4">
              Open Service is second-hand free to provide fresh design and development services to help you achieve your
              goals and objectives. We are committed to providing the best service to our clients and partners.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 cursor-pointer hover:text-yellow-400 transition-colors" />
              <Twitter className="w-5 h-5 cursor-pointer hover:text-yellow-400 transition-colors" />
              <Instagram className="w-5 h-5 cursor-pointer hover:text-yellow-400 transition-colors" />
              <Linkedin className="w-5 h-5 cursor-pointer hover:text-yellow-400 transition-colors" />
            </div>
          </div>

          {/* Explore Column */}
          <div>
            <h3 className="text-lg font-bold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Explore Designers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Explore Design
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Explore Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Explore Projects
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Reports
                </a>
              </li>
            </ul>
          </div>

          {/* Innovate Column */}
          <div>
            <h3 className="text-lg font-bold mb-4">Innovate</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  App
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Plan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Cloud Services
                </a>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="text-lg font-bold mb-4">About</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Company
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  Terms of service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-wrap gap-6 text-sm text-gray-300 mb-4 md:mb-0">
              <a href="#" className="hover:text-yellow-400 transition-colors">
                Categories
              </a>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                Community
              </a>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                Resources
              </a>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                Contact
              </a>
            </div>
            <div className="text-sm text-gray-400">© 2024 bookMyService. All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
