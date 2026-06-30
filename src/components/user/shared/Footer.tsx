import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Logo & About Column */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-xl font-extrabold text-white tracking-tight">bookMyService</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Premium and transparent home services on demand. Connecting you with verified local service providers for plumbing, electrical, cleaning, and beauty jobs.
            </p>
            <div className="flex space-x-4 pt-2">
              <Facebook className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              <Twitter className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              <Instagram className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              <Linkedin className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          {/* Quick links Column */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cleaning Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Beauty & Salon
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Appliance Repair
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Pest Control
                </a>
              </li>
            </ul>
          </div>

          {/* Business Column */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">For Partners</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Register as a Partner
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Partner Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Service Standards
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">
                Safety Center
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Help & Support
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Sitemap
              </a>
            </div>
            <div className="text-sm text-slate-500">© 2026 bookMyService. All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
