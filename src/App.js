import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Dashboard/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Companias from './pages/Companias/Companias';
import Proformas from './pages/Proformas/Proformas';
import Vehiculos from './pages/Vehiculos/Vehiculos';
import Clientes from './pages/Clientes/Clientes';
import Precios from './pages/Precios/Precios';
import ProtectedRoute from './components/ProtectedRoute'; 
import NuevaProforma from './components/NuevaProforma/NuevaProforma';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MasterRoute from './components/MasterRoute'; 
import Paso5 from "./components/NuevaProforma/Paso5";
import './styles/globals.css';
import BaseProformas from "./pages/Proformas/ProformasEdits/BaseProformas";
import Cliente from "./pages/Proformas/ProformasEdits/Cliente";
import SeguroBroker from './pages/Proformas/ProformasEdits/SeguroBroker';
import Detalles from './pages/Proformas/ProformasEdits/Detalles';
import Repuestos from './pages/Proformas/ProformasEdits/Repuestos';
import RepuestosAnexo from './pages/Proformas/ProformasEdits/Anexos/RepuestosAnexo';
import Vehiculo from './pages/Proformas/ProformasEdits/Vehiculo';
import Pendientes from './pages/Proformas/ProformasEdits/Pendientes';
import Anexo from "./pages/Proformas/ProformasEdits/Anexos/Anexo";
import DetallesAnexo from "./pages/Proformas/ProformasEdits/Anexos/DetallesAnexo"; // Importar el componente

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <MasterRoute>
              <Register />
            </MasterRoute>
          }
        />
        <Route path="/companias" element={<ProtectedRoute><Companias /></ProtectedRoute>} />
        <Route path="/proformas" element={<ProtectedRoute><Proformas /></ProtectedRoute>} /><Route path="/proformas/nuevaproforma" element={<NuevaProforma />} />
        <Route path="/vehiculos" element={<ProtectedRoute><Vehiculos /></ProtectedRoute>} />
        <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
        <Route path="/precios" element={<ProtectedRoute><Precios /></ProtectedRoute>} />
        <Route path="/proformas/:idProforma/:placa" element={<BaseProformas />} />
        <Route path="/paso5/:idProforma/:placa" element={<Paso5 />} />
        <Route
          path="/proformas/:idProforma/:idcliente/Cliente"
          element={<ProtectedRoute><Cliente /></ProtectedRoute>}
        />
        <Route
          path="/proformas/:idProforma/:nplaca/SeguroBroker"
          element={<ProtectedRoute><SeguroBroker /></ProtectedRoute>}
        />
        <Route
          path="/proformas/:idProforma/:nplaca/Detalles"
          element={<ProtectedRoute><Detalles /></ProtectedRoute>}
        />
        <Route path="/proformas/:idProforma/:nplaca/Repuestos" element={<ProtectedRoute><Repuestos /></ProtectedRoute>} />
        <Route path="/proformas/:idProforma/:nplaca/Vehiculo" element={<ProtectedRoute><Vehiculo /></ProtectedRoute>} />
        <Route
          path="/proformas/:idProforma/:nplaca/Anexo/:idProforma"
          element={<ProtectedRoute><Anexo /></ProtectedRoute>}
        />
        <Route 
          path="/proformas/:idProforma/:nplaca/Anexo/:idanexo/detalles" 
          element={<ProtectedRoute><DetallesAnexo /></ProtectedRoute>} 
        />
        {/* Nueva Ruta para Detalles del Anexo */}
        <Route 
          path="/proformas/:idProforma/:nplaca/Anexo/:idanexo/repuestos" 
          element={<ProtectedRoute><RepuestosAnexo /></ProtectedRoute>} 
        />
        {
          <Route path="/proformas/pendientes" element={<ProtectedRoute><Pendientes /></ProtectedRoute>} />
        }
      </Routes>
      <>
        <ToastContainer />
      </>
    </Router>
  );
};

export default App;