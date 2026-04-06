import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { connectSocket } from "./sockets/socket";
import { Toaster } from "react-hot-toast";

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      connectSocket(); // ✅ reconnect after refresh
    }
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        }}
      />

      <AppRoutes />
    </>
  );
}

export default App;
