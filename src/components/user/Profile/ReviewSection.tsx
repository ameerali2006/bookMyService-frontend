"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const mockReviews = [
  {
    id: 1,
    serviceName: "House Cleaning",
    provider: "CleanPro Services",
    rating: 5,
    comment: "Excellent service! The team was professional and thorough. My house has never been cleaner.",
    date: "2024-01-16",
  },
  {
    id: 2,
    serviceName: "Plumbing Repair",
    provider: "Fix-It Fast",
    rating: 4,
    comment: "Quick response and fixed the issue efficiently. Would recommend for urgent repairs.",
    date: "2024-01-11",
  },
  {
    id: 3,
    serviceName: "Garden Maintenance",
    provider: "Green Thumb Co.",
    rating: 5,
    comment: "Amazing work on my garden! They transformed it completely and gave great advice for maintenance.",
    date: "2024-01-06",
  },
]

export function ReviewsSection() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Reviews</h1>
        <p className="text-muted-foreground">Your reviews and feedback for completed services.</p>
      </div>

      <div className="grid gap-4">
        {mockReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{review.serviceName}</h3>
                  <p className="text-sm text-muted-foreground">{review.provider}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">{renderStars(review.rating)}</div>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </div>

              <p className="text-foreground leading-relaxed">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
