'use client';

import { UserRole, useRoleAuth } from '@/hooks/useRoleAuth';
import { useGlobalStore } from '@/state';
import { useAuthStore } from '@/state/authStore';
import {
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FileText,
  Gavel,
  GraduationCap,
  Home,
  LayoutDashboard,
  Lock,
  LogOut,
  Settings,
  Shield,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const Sidebar = () => {
  const [showDeanManagement, setShowDeanManagement] = useState(true);
  const [showLecturerManagement, setShowLecturerManagement] = useState(true);
  const [showHeadManagement, setShowHeadManagement] = useState(true);

  const { isSidebarCollapsed, setIsSidebarCollapsed } = useGlobalStore();
  const authUser = useAuthStore((state) => state.user);
  const userRoles = useAuthStore((state) => state.user?.roles || []);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // const logout = useAuthStore((state) => state.logout);
  const { hasRequiredRole: checkUserRole } = useRoleAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất: ', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }
  const displayRole = userRoles.includes(UserRole.DEAN)
    ? 'Trưởng Khoa'
    : userRoles.includes(UserRole.LECTURER)
    ? 'Giảng Viên'
    : 'Người Dùng';
  console.log(authUser?.facultyCode);

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={!isSidebarCollapsed}
      onClose={() => setIsSidebarCollapsed(true)}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            UTC ResearchHub
          </Typography>
          <IconButton onClick={() => setIsSidebarCollapsed(true)} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        {/* User Info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Avatar
            src={authUser?.profilePicture || '/placeholder-avatar.png'}
            alt="User Avatar"
            sx={{ width: 40, height: 40 }}
          />
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {authUser?.fullName || 'User Name'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Lock size={12} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {displayRole}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Navigation */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <List sx={{ py: 1 }}>
            {/* Common Navigation */}
            {checkUserRole(UserRole.DEAN) && (
              <SidebarLink icon={Home} label="Trang chủ" href="/dean" />
            )}
            {checkUserRole(UserRole.LECTURER) &&
              !checkUserRole(UserRole.DEAN) && (
                <SidebarLink icon={Home} label="Trang chủ" href="/lecturer" />
              )}

            {/* Dean Navigation */}
            {checkUserRole(UserRole.DEAN) && (
              <CollapsibleSection
                title="Quản Lý Trưởng Khoa"
                isOpen={showDeanManagement}
                toggleOpen={() => setShowDeanManagement((prev) => !prev)}
                icon={Shield}
              >
                <SidebarLink
                  icon={LayoutDashboard}
                  label="Tổng Quan"
                  href="/dean/dashboard"
                />
                <SidebarLink
                  icon={Users}
                  label="Quản Lý Người Dùng"
                  href="/dean/users"
                />
                {/* <SidebarLink
                  icon={Users}
                  label="Quản Lý Khoa"
                  href="/dean/faculties"
                /> */}
                <SidebarLink
                  icon={Users}
                  label="Quản Lý Đề Tài Lớn"
                  href="/dean/theme"
                />
                <SidebarLink
                  icon={UserPlus}
                  label="Đăng Ký & Phân Công"
                  href="/dean/enrollment"
                />
                <SidebarLink
                  icon={BookOpen}
                  label="Quản Lý Dự Án"
                  href="/dean/project"
                />
                <SidebarLink
                  icon={Gavel}
                  label="Quản Lý Bảo Vệ"
                  href="/dean/defense"
                />
              </CollapsibleSection>
            )}

            {/* Lecturer Navigation */}
            {checkUserRole(UserRole.LECTURER) && (
              <CollapsibleSection
                title="Quản Lý Giảng Viên"
                isOpen={showLecturerManagement}
                toggleOpen={() => setShowLecturerManagement((prev) => !prev)}
                icon={GraduationCap}
              >
                <SidebarLink
                  icon={LayoutDashboard}
                  label="Tổng Quan"
                  href="/lecturer/dashboard"
                />
                <SidebarLink
                  icon={BookOpen}
                  label="Quản Lý Đề Cương"
                  href="/lecturer/project/proposal"
                />
                <SidebarLink
                  icon={BookOpen}
                  label="Quản Lý Dự Án"
                  href="/lecturer/project"
                />
                <SidebarLink
                  icon={FileText}
                  label="Đăng Ký Hướng Dẫn"
                  href="/lecturer/project/register"
                />
                <SidebarLink
                  icon={ClipboardCheck}
                  label="Đánh Giá"
                  href="/lecturer/evalution"
                />
              </CollapsibleSection>
            )}

            {/* Head Navigation (if user has head role) */}
            {(authUser?.facultyCode?.includes('HEAD') ||
              userRoles.includes('HEAD')) && (
              <CollapsibleSection
                title="Quản Lý Trưởng Bộ Môn"
                isOpen={showHeadManagement}
                toggleOpen={() => setShowHeadManagement((prev) => !prev)}
                icon={Users}
              >
                <SidebarLink
                  icon={LayoutDashboard}
                  label="Tổng Quan"
                  href="/head/dashboard"
                />
                {/* <SidebarLink
                  icon={BookOpen}
                  label="Quản Lý Dự Án"
                  href="/head/project"
                /> */}
                <SidebarLink
                  icon={BookOpen}
                  label="Quản Lý Đề Cương"
                  href="/head/project/proposal"
                />
                {/* <SidebarLink
                  icon={BarChart3}
                  label="Đánh Giá Dự Án"
                  href="/head/project/evalution"
                /> */}
              </CollapsibleSection>
            )}

            <Divider sx={{ my: 1 }} />

            {/* Settings */}
            <SidebarLink icon={Settings} label="Cài Đặt" href="/settings" />
          </List>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={authUser?.profilePicture || '/placeholder-avatar.png'}
              alt="User Avatar"
              sx={{ width: 32, height: 32 }}
            />
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {authUser?.fullName || 'Tài khoản'}
              </Typography>
            </Box>
            <IconButton
              onClick={handleSignOut}
              size="small"
              color="error"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    (href !== '/' && pathname.startsWith(href + '/')) ||
    (href === '/' && pathname === '/');

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        href={href}
        selected={isActive}
        sx={{
          mx: 1,
          borderRadius: 1,
          '&.Mui-selected': {
            backgroundColor: 'primary.50',
            color: 'primary.600',
            '&:hover': {
              backgroundColor: 'primary.100',
            },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <Icon size={20} />
        </ListItemIcon>
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            variant: 'body2',
            fontWeight: isActive ? 600 : 400,
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  toggleOpen: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}

const CollapsibleSection = ({
  title,
  isOpen,
  toggleOpen,
  icon: Icon,
  children,
}: CollapsibleSectionProps) => {
  return (
    <>
      <ListItem disablePadding>
        <ListItemButton
          onClick={toggleOpen}
          sx={{
            mx: 1,
            borderRadius: 1,
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Icon size={20} />
          </ListItemIcon>
          <ListItemText
            primary={title}
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: 500,
            }}
          />
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </ListItemButton>
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 2 }}>
          {children}
        </List>
      </Collapse>
    </>
  );
};

export default Sidebar;
