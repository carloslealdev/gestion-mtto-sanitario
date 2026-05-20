import { configureStore } from "@reduxjs/toolkit"
import calendarReducer from "./slices/calendarSlice"
import mantenimientosReducer from "./slices/mantenimientosSlice"
import eppReducer from "./slices/eppSlice"
import themeReducer from "./slices/themeSlice"
import workersReducer from "./slices/workersSlice"
import authReducer from "./slices/authSlice"
import reservationsReducer from "./slices/reservationsSlice"
import requestsReducer from "./slices/requestsSlice"
import eppReservationsReducer from "./slices/eppReservationsSlice"
import eppRequestsReducer from "./slices/eppRequestsSlice"
import inventoryReducer from "./slices/inventorySlice"

export const store = configureStore({
  reducer: {
    calendar: calendarReducer,
    mantenimientos: mantenimientosReducer,
    epp: eppReducer,
    theme: themeReducer,
    workers: workersReducer,
    auth: authReducer,
    reservations: reservationsReducer,
    requests: requestsReducer,
    eppReservations: eppReservationsReducer,
    eppRequests: eppRequestsReducer,
    inventory: inventoryReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch