import React, { useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { userService } from "@/api/UserService";
import { ErrorToast, SuccessToast, WarningToast } from "../shared/Toaster";


interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  
  onSubmitSuccess: (data:IReview) => void;
}
interface IReview {
  comment: string;
  rating: number;
  createdAt: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  bookingId,
 
  onSubmitSuccess,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    if(comment.trim()==""){
        WarningToast("add review")
        return
      }

    try {
      setLoading(true);
     
      if(!bookingId){
        WarningToast("booking details not found")
      }

      const response = await userService.addReview(comment,rating,bookingId)
      if(!response.data.success){
        ErrorToast(response.data.message)
        return 
      }

      onSubmitSuccess(response.data.review);
      onClose();
      SuccessToast(response.data.message)
    } catch (error) {
      console.error("Review submission failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            Rate Your Experience
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center gap-2 my-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={32}
              className={`cursor-pointer transition ${
                (hover || rating) >= star
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            />
          ))}
        </div>

        <Textarea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="rounded-xl"
        />

        <Button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full mt-4 rounded-xl"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;