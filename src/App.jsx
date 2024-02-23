import { Routes, Route } from "react-router-dom";
import { PedidosProvider } from "./context/PedidosProvider";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Admin from "./pages/Admin.jsx";
import Home from "./pages/Home";
import Ordenes from "./pages/Ordenes";
import NotFound from "./pages/NotFound";
import NavBar from "./components/NavBar";
import Login from "./pages/Login.jsx";
import Clientes from "./pages/Clientes.jsx";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
function App() {
  return (
    <PedidosProvider>
      <ToastContainer position="top-center" limit={1} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <NavBar />
              <Admin />
            </PrivateRoute>
          }
        />
        <Route
          path="/ordenes"
          element={
            <PrivateRoute>
              <NavBar />
              <Ordenes />
            </PrivateRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <PrivateRoute>
              <NavBar />
              <Clientes />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PedidosProvider>
  );
}

export default App;
