import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Páginas
import LoginPage from './pages/LoginPage';
import MenuLateral from "./layouts/MenuLateral";
import ClientesPage from "./pages/ClientesPage";
import EmpleadosPage from './pages/EmpleadosPage';
import ProductosPage from './pages/ProductosPage';
import CategoriasPage from './pages/CategoriasPage';
import ColeccionesPage from './pages/ColeccionesPage';
import VentasPage from "./pages/VentasPage";  

// Componente para proteger las rutas
const PrivateRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Cargando...</p>
            </div>
        );
    }
    
    return user ? children : <Navigate to="/login" />;
};

// Componente para proteger rutas solo de admin
const AdminRoute = ({ children }) => {
    const { user, isAdmin, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Cargando...</p>
            </div>
        ); 
    }
    
    if (!user) return <Navigate to="/login" />;
    if (!isAdmin) return <Navigate to="/" />;
    
    return children;
};

// Página de acceso denegado
const AccesoDenegado = () => (
    <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '20px' }}>❌ Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
    </div>
);

function App() {
    return (
        <Routes>

            {/* Login sin protección */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rutas con menú y protección */}
            <Route 
                path="/" 
                element={
                    <PrivateRoute>
                        <MenuLateral />
                    </PrivateRoute>
                }
            >

                {/* Home */}
                <Route 
                    index 
                    element={
                        <div style={{ padding: '20px' }}>
                            <h2>Panel Principal</h2>
                            <p>Bienvenido a ANIMALPRINT PETSTOCK</p>
                        </div>
                    } 
                />

                {/* Rutas accesibles para todos los empleados */}
                <Route path="clientes" element={<ClientesPage />} />

                {/* 💵 AQUÍ SE INSERTA LA NUEVA RUTA REAL DE VENTAS */}
                <Route 
                    path="ventas" 
                    element={<VentasPage />}   // <--- YA ESTÁ LISTO
                />

                {/* --- Rutas EXCLUSIVAS para admin --- */}

                <Route 
                    path="empleados" 
                    element={
                        <AdminRoute>
                            <EmpleadosPage />
                        </AdminRoute>
                    } 
                />

                <Route 
                    path="productos" 
                    element={
                        <AdminRoute>
                            <ProductosPage />
                        </AdminRoute>
                    } 
                />

                <Route 
                    path="categorias" 
                    element={
                        <AdminRoute>
                            <CategoriasPage />
                        </AdminRoute>
                    } 
                />

                <Route 
                    path="colecciones" 
                    element={
                        <AdminRoute>
                            <ColeccionesPage />
                        </AdminRoute>
                    } 
                />

                <Route 
                    path="reportes" 
                    element={
                        <AdminRoute>
                            <div style={{ padding: '20px' }}>
                                <h2>📊 Reporte Ventas</h2>
                                <p>Reportes de ventas ✓</p>
                            </div>
                        </AdminRoute>
                    } 
                />

                <Route path="acceso-denegado" element={<AccesoDenegado />} />

            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;
