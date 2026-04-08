import toast from "react-hot-toast";

type ToastType ="booking"|"payment"|"review"| "system";

interface ToastData {
  title: string;
  message: string;
  type?: ToastType;
}

export const showToast = ({ title, message, type = "system" }: ToastData) => {
  const baseStyle =
    "flex flex-col gap-1 text-sm font-medium";

  const typeStyles: Record<ToastType, string> = {
    booking: "bg-blue-500",
    payment: "bg-green-500",
    review: "bg-emerald-500",
    
    system: "bg-gray-700",
  };

  toast.custom((t) => (
    <div
      className={`${baseStyle} ${typeStyles[type]} text-white px-4 py-3 rounded-xl shadow-lg`}
    >
      <span className="font-semibold">{title}</span>
      <span className="text-xs opacity-90">{message}</span>
    </div>
  ));
};