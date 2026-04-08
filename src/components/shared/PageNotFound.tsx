import { Home } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full bg-white text-[#0A1A44] overflow-hidden flex items-center justify-center relative">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#F7C948] rounded-full opacity-20 animate-float" />
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-[#0A1A44] rounded-full opacity-10 animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#F7C948] rounded-full opacity-15 animate-float-slower" />

        {/* Floating squares */}
        <div
          className="absolute top-1/3 right-1/4 w-20 h-20 bg-[#0A1A44] rounded-lg opacity-10 animate-float"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-[#F7C948] rounded-lg opacity-20 animate-float-delayed"
          style={{ animationDelay: "0.2s" }}
        />

        {/* Floating decorative elements */}
        <div
          className="absolute top-40 right-1/3 w-4 h-4 bg-[#F7C948] rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-[#0A1A44] rounded-full animate-float-delayed"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 text-center max-w-2xl">
        {/* Main 404 text with animation */}
        <div className="mb-6 animate-fade-in">
          <h1
            className="text-9xl md:text-[150px] font-bold text-[#F7C948] drop-shadow-lg"
            style={{ animationDelay: "0.1s" }}
          >
            404
          </h1>
        </div>

        {/* Heading */}
        <div className="mb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0A1A44] mb-2">Oops! Page Not Found</h2>
        </div>

        {/* Description */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <p className="text-lg md:text-xl text-[#0A1A44] opacity-70 text-pretty">
            The page you&apos;re looking for seems to have taken an unexpected detour. Don&apos;t worry, we&apos;ll help
            you find your way back!
          </p>
        </div>

        {/* CTA Button */}
        <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <a href="/">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#F7C948] hover:bg-[#f0c24f] text-[#0A1A44] font-bold rounded-full text-lg transition-all duration-300 transform hover:scale-105 animate-bounce-soft hover:animate-none shadow-lg hover:shadow-xl">
              <Home className="w-5 h-5" />
              Go Home
            </button>
          </a>
        </div>

        {/* Decorative service icons */}
        <div
          className="mt-16 flex justify-center gap-8 md:gap-12 flex-wrap animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          {/* Wrench icon */}
          <div className="text-[#F7C948] opacity-60 animate-float">
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          {/* Calendar icon */}
          <div className="text-[#0A1A44] opacity-40 animate-float-delayed">
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Tools icon */}
          <div className="text-[#F7C948] opacity-50 animate-float-slower">
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Cleaning icon (represented by sparkles) */}
          <div className="text-[#0A1A44] opacity-35 animate-float" style={{ animationDelay: "1s" }}>
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
