import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export const SuccessToast = (message: string) => {
  toast.success(message, {
    position: "top-right",  
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};


export const ErrorToast = (message: string) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};

// Warning Toast
export const WarningToast = (message: string) => {
  toast.warn(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};
// export const notifyToast = (notification: any) => {
//     toast.custom(
//       (t) => (
//         <div
//           className={`${
//             t.visible ? "animate-enter" : "animate-leave"
//           } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex`}
//         >
//           <div className="flex-1 w-0 p-4">
//             <div className="flex items-start">
//               <div className="ml-3 flex-1">
//                 <p className="text-sm font-medium text-gray-900">
//                   {notification.title || "Notification"}
//                 </p>
//                 <p className="text-sm text-gray-800">{notification.message}</p>
//                 {notification.createdAt && (
//                   <p className="mt-1 text-xs text-gray-400">
//                     {getSmartDate(notification.createdAt.toString())}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
          
//         </div>
//       ),
//       {
//         duration: 3000,
//       }
//     );
//   };
