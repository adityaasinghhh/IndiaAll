
import { createContext, useContext, useState } from 'react'

const MaintenanceContext = createContext(null)

export function MaintenanceProvider({ children }) {
  // true = enable maintenance page; false = normal website
  const [showMaintenance, setShowMaintenance] = useState(false)

  return (
    <MaintenanceContext.Provider
      value={{ showMaintenance, setShowMaintenance }}
    >
      {children}
    </MaintenanceContext.Provider>
  )
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext)

  if (!context) {
    throw new Error(
      'useMaintenance must be used inside MaintenanceProvider'
    )
  }

  return context
}
