import axios from "axios";
import { authService } from "@/api/AuthService";

/**
 * Reusable Cloudinary upload function
 * Works for image / video / audio
 */
export const uploadToCloudinary = async (
  file: File,
  uploadType: "user-image" | "chat-media" | "worker-documents"
): Promise<string> => {
  try {
    // 1️⃣ Get signed data from backend
    const { data } = await authService.workerCloudinory(uploadType);

    // 2️⃣ Prepare form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", data.apiKey);
    formData.append("timestamp", String(data.timestamp));
    formData.append("signature", data.signature);
    formData.append("folder", data.folder);

    // 3️⃣ Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${data.cloudName}/auto/upload`;

    const uploadRes = await axios.post(cloudinaryUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // 4️⃣ Return secure URL
    return uploadRes.data.secure_url as string;
  } catch (error: any) {
    console.error(
      "Cloudinary upload failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
