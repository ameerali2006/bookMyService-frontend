import { BrowserRouter as Roter, Routes, Route } from "react-router-dom";
import User from "./User";
import Admin from "./Admin";
import Worker from "./Worker";
import {ToastContainer} from 'react-toastify'
import WorkerLayout from "./layout/WorkerLayout";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";



function App() {
  

  return (
    <>
      <ErrorBoundary>
    <ToastContainer/>
     <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "10px",
            background: "#1f2937",
            color: "#fff",
          },
        }}
      />
    <Roter>
      <Routes>
        <Route path="/*" element={<User/>}/>
        <Route path="/worker/*" element={<WorkerLayout><Worker /></WorkerLayout>}/>
        <Route path="/admin/*" element={<Admin/>}/>
      </Routes>
    </Roter>
    </ErrorBoundary>
    </>
  )
}

export default App
