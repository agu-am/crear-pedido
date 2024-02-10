import { Routes, Route } from "react-router-dom";
import { PedidosProvider } from "./context/PedidosProvider";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Home from "./pages/Home";
import Ordenes from "./pages/Ordenes";
import NotFound from "./pages/NotFound";
import NavBar from "./components/NavBar";
import NuevoCliente from "./pages/NuevoCliente";
import Login from "./pages/Login.jsx";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
function App() {
  return (
    <PedidosProvider>
      <ToastContainer />
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/ordenes"
          element={
            <PrivateRoute>
              <Ordenes />
            </PrivateRoute>
          }
        />
        <Route
          path="/nuevo-cliente"
          element={
            <PrivateRoute>
              <NuevoCliente />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PedidosProvider>
  );
}

export default App;
