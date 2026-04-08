
import { WorkerSocketProvider } from "@/context/WorkerRequestContext";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const worker = useSelector((state: RootState) => state.workerTokenSlice.worker);
  const workerId = worker?._id;

  return (
    <WorkerSocketProvider workerId={workerId}>
      {children}
    </WorkerSocketProvider>
  );
}