import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const NotFound = () => {
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-[#020617] via-[#0a1931] to-[#020617] text-white overflow-hidden">
      
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-yellow-400/40" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-yellow-400/20" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-yellow-400/40" />
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-yellow-400/20" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-yellow-400/30" />
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-yellow-400/20" />
      </div>

      {/* Floating glow circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-[15%] left-[10%] w-16 h-16 rounded-full bg-yellow-400/20 blur-xl transition-all duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute bottom-[20%] right-[15%] w-24 h-24 rounded-full bg-yellow-500/20 blur-xl transition-all duration-1000 delay-300 ${mounted ? "opacity-100" : "opacity-0"}`} />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 text-center px-4 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* 404 */}
        <div className="relative inline-block mb-6">
          <h1 className="text-9xl md:text-[12rem] font-black bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-2xl">
            404
          </h1>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(255,215,0,.08)_25%,rgba(255,215,0,.08)_26%,transparent_27%,transparent_74%,rgba(255,215,0,.08)_75%,rgba(255,215,0,.08)_76%,transparent_77%,transparent)] bg-[length:50px_50px]" />
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          Page Not Found
        </h2>

        <p className="text-slate-300 text-lg md:text-xl mb-3 max-w-md mx-auto leading-relaxed">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        <p className="text-slate-400 text-base mb-8">
          Let’s get you back to your services.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-semibold shadow-lg hover:scale-105 hover:shadow-yellow-500/30 transition-all duration-300"
          >
            Go to Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-yellow-400/40 text-yellow-300 hover:bg-yellow-400/10 transition-all duration-300"
          >
            Go Back
          </button>

        </div>

        {/* Help */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-slate-400 text-sm">
            Need help? Contact{" "}
            <a
              href="mailto:support@yourservice.com"
              className="text-yellow-400 hover:text-yellow-300 underline"
            >
              support@yourservice.com
            </a>
          </p>
        </div>
      </div>

      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />

    </div>
  )
}

export default NotFound