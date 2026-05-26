import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppTheme } from './hooks/useAppTheme';
import { Login } from '@/components/Login';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import EquiposPage from '@/pages/EquiposPage';
import MantenimientosPage from '@/pages/MantenimientosPage';
import GruposDeTrabajoPage from '@/pages/GruposDeTrabajoPage';
import GrupoDetallePage from '@/pages/GrupoDetallePage';
import GestionEPPSPage from '@/pages/GestionEPPSPage';
import InventariosPage from '@/pages/InventariosPage';
import CalendarioPage from '@/pages/CalendarioPage';
import ReservasPage from '@/pages/ReservasPage';
import ReservasEPPsPage from '@/pages/ReservasEPPsPage';
import ReportesTareasNocturnasPage from '@/pages/ReportesTareasNocturnasPage';
import NuevosRegistrosPage from '@/pages/NuevosRegistrosPage';
import { useAppSelector } from './store/hooks';
import { useAppDispatch } from './store/hooks';
import { setAuthFromFirebase } from './store/slices/authSlice';
import { onAuthChange, getUserProfile } from './services/authService';
import { fetchWorkers } from './store/slices/workersSlice';
import { fetchSupplies } from './store/slices/suppliesSlice';
import { fetchInventory } from './store/slices/inventorySlice';
import { fetchProductionLines } from './store/slices/productionLinesSlice';
import { fetchRequests } from './store/slices/requestsSlice';
import { fetchReservations } from './store/slices/reservationsSlice';
import { fetchEPPTypes } from './store/slices/eppTypesSlice';
import { fetchEPPRequests } from './store/slices/eppRequestsSlice';
import { fetchEPPReservations } from './store/slices/eppReservationsSlice';
import { fetchCalendarEntries } from './store/slices/calendarSlice';
import { fetchNightlyTasks } from './store/slices/nightlyTasksSlice';

function ThemeInitializer() {
  useAppTheme();
  return null;
}

function FirebaseAuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          dispatch(
            setAuthFromFirebase({
              user: {
                username: profile.cedula,
                name: profile.name,
                role: profile.role,
                uid: profile.uid,
              },
              token: idToken,
            }),
          );
        }
      } else {
        dispatch(setAuthFromFirebase(null));
      }
    });
    return unsubscribe;
  }, [dispatch]);

  return null;
}

function DataInitializer() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWorkers());
      dispatch(fetchSupplies());
      dispatch(fetchInventory());
      dispatch(fetchProductionLines());
      dispatch(fetchRequests());
      dispatch(fetchReservations());
      dispatch(fetchEPPTypes());
      dispatch(fetchEPPRequests());
      dispatch(fetchEPPReservations());
      dispatch(fetchCalendarEntries());
      dispatch(fetchNightlyTasks());
    }
  }, [dispatch, isAuthenticated]);

  return null;
}

function AuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, initializing, user } = useAppSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (initializing) return;
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    } else if (isAuthenticated && user && location.pathname === '/login') {
      switch (user.role) {
        case 'admin':
          navigate('/', { replace: true });
          break;
        case 'encargado':
          navigate('/encargado/calendario', { replace: true });
          break;
        case 'general':
          navigate('/general/calendario', { replace: true });
          break;
      }
    }
  }, [isAuthenticated, initializing, user, navigate, location.pathname]);

  return null;
}

function AppRoutes() {
  const { isAuthenticated, initializing, user } = useAppSelector(
    (state) => state.auth,
  );
  const role = user?.role || 'general';

  const getBasePath = () => {
    switch (role) {
      case 'admin':
        return '';
      case 'encargado':
        return '/encargado';
      case 'general':
        return '/general';
      default:
        return '';
    }
  };

  const basePath = getBasePath();

  if (initializing) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full' />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path='/login'
        element={<Navigate to={basePath || '/'} replace />}
      />

      <Route element={<DashboardLayout />}>
        <Route
          index
          element={
            <Navigate
              to={basePath + (role === 'admin' ? '/dashboard' : '/calendario')}
              replace
            />
          }
        />
        <Route path='dashboard' element={<DashboardPage />} />

        {(role === 'admin' || role === 'encargado' || role === 'general') && (
          <>
            <Route path='calendario' element={<CalendarioPage />} />
            <Route path='grupos-de-trabajo' element={<GruposDeTrabajoPage />} />
            <Route
              path='grupos-de-trabajo/:teamId'
              element={<GrupoDetallePage />}
            />
            <Route path='inventarios-de-grupos' element={<InventariosPage />} />
            <Route
              path='gestion-epps-trabajadores'
              element={<GestionEPPSPage />}
            />
          </>
        )}

        {(role === 'admin' || role === 'encargado') && (
          <>
            <Route path='reservas-de-insumos' element={<ReservasPage />} />
          </>
        )}

        {(role === 'admin' || role === 'encargado') && (
          <>
            <Route
              path='reportes-tareas-nocturnas'
              element={<ReportesTareasNocturnasPage />}
            />
          </>
        )}

        {(role === 'admin' || role === 'encargado' || role === 'general') && (
          <>
            <Route path='reservas-de-epps' element={<ReservasEPPsPage />} />
          </>
        )}

        {role === 'admin' && (
          <>
            <Route path='registros' element={<NuevosRegistrosPage />} />
            <Route path='equipos' element={<EquiposPage />} />
            <Route path='mantenimientos' element={<MantenimientosPage />} />
          </>
        )}
      </Route>

      <Route
        path='*'
        element={<Navigate to={basePath + '/calendario'} replace />}
      />
    </Routes>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <FirebaseAuthListener />
      <DataInitializer />
      <AuthHandler />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/encargado/*' element={<AppRoutes />} />
        <Route path='/general/*' element={<AppRoutes />} />
        <Route path='/*' element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeInitializer />
      <AppContent />
    </Provider>
  );
}

export default App;
