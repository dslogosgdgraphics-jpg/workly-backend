import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  Building2,
  FileText,
  Target,
  UserPlus,
  Receipt,
  Megaphone,
  BarChart3,
  Settings,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

const menuItems = [
  { 
    title: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/dashboard',
    roles: ['admin', 'employee']
  },
  { 
    title: 'Employees', 
    icon: Users, 
    path: '/employees',
    roles: ['admin', 'employee']
  },
  { 
    title: 'Attendance', 
    icon: Clock, 
    path: '/attendance',
    roles: ['admin', 'employee']
  },
  { 
    title: 'Leaves', 
    icon: Calendar, 
    path: '/leaves',
    roles: ['admin', 'employee']
  },
  { 
    title: 'Payroll', 
    icon: DollarSign, 
    path: '/payroll',
    roles: ['admin', 'employee']
  },
  { 
    title: 'Departments', 
    icon: Building2, 
    path: '/departments',
    roles: ['admin']
  },
  { 
    title: 'Documents', 
    icon: FileText, 
    path: '/documents',
    roles: ['admin', 'employee']
  },
  { 
    title: 'Performance', 
    icon: Target, 
    path: '/performance',
    roles: ['admin', 'employee']
  },
  { 
    title: 'Onboarding', 
    icon: UserPlus, 
    path: '/onboarding',
    roles: ['admin', 'employee']
  },
  { 
    title: 'Expenses', 
    icon: Receipt, 
    path: '/expenses',
    roles: ['admin', 'employee']
  },
  { 
    title: 'Announcements', 
    icon: Megaphone, 
    path: '/announcements',
    roles: ['admin', 'employee']
  },
  { 
    title: 'Reports', 
    icon: BarChart3, 
    path: '/reports',
    roles: ['admin']
  },
  { 
    title: 'Settings', 
    icon: Settings, 
    path: '/settings',
    roles: ['admin', 'employee']
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Close button for mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-lg font-semibold">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            EmplyStack v2.0.0
          </div>
        </div>
      </motion.aside>
    </>
  );
}