import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import PersonIcon from '@mui/icons-material/Person'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import SettingsIcon from '@mui/icons-material/Settings'

export const Dock = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleAddClick = () => {
    navigate('/add')
  }

  const isAddPage = location.pathname === '/add' || location.pathname.startsWith('/edit/')

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-center px-6 py-3 rounded-full transition-all ${
      isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
    }`

  const buttonClasses = `flex items-center justify-center px-6 py-3 rounded-full transition-all ${
    isAddPage ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
  }`

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-lg rounded-full p-2 shadow-lg border border-gray-200">
        <button className={buttonClasses} aria-label="Add Transaction" onClick={handleAddClick}>
          <AddCircleIcon sx={{ fontSize: 24 }} />
        </button>

        <NavLink to="/" className={linkClasses} aria-label="All Transactions">
          <ReceiptLongIcon sx={{ fontSize: 24 }} />
        </NavLink>

        <NavLink to="/my-transactions" className={linkClasses} aria-label="My Transactions">
          <PersonIcon sx={{ fontSize: 24 }} />
        </NavLink>

        <NavLink to="/profile" className={linkClasses} aria-label="Profile">
          <SettingsIcon sx={{ fontSize: 24 }} />
        </NavLink>
      </div>
    </div>
  )
}
