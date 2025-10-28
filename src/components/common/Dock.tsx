import { NavLink, useNavigate } from 'react-router-dom'

import {
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  PlusCircleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid'

export const Dock = () => {
  const navigate = useNavigate()

  const handleAddClick = () => {
    navigate('/transactions/add')
  }

  return (
    <div className="dock">
      <NavLink to="/" aria-label="Home">
        <HomeIcon className="h-6 w-6" />
        <span className="dock-label">Home</span>
      </NavLink>

      <button aria-label="Add Transaction" onClick={handleAddClick}>
        <PlusCircleIcon className="h-6 w-6" />
        <span className="dock-label">Add</span>
      </button>

      <NavLink to="/transactions" aria-label="Transactions">
        <DocumentTextIcon className="h-6 w-6" />
        <span className="dock-label">Transactions</span>
      </NavLink>

      <NavLink to="/profile" aria-label="Profile">
        <UserCircleIcon className="h-6 w-6" />
        <span className="dock-label">Profile</span>
      </NavLink>

      <button aria-label="Settings">
        <Cog6ToothIcon className="h-6 w-6" />
        <span className="dock-label">Settings</span>
      </button>
    </div>
  )
}
