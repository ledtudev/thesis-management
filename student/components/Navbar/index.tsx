import { useLogout } from '@/services/authService';
import { useGlobalStore } from '@/state';
import { useAuthStore } from '@/state/authStore';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const {
    isSidebarCollapsed,
    isDarkMode,
    setIsSidebarCollapsed,
    setIsDarkMode,
  } = useGlobalStore();

  const router = useRouter();
  const logoutMutation = useLogout();
  const { clearAuth } = useAuthStore();

  // Dialog state
  const [openLogoutDialog, setOpenLogoutDialog] = React.useState(false);

  // Open confirmation dialog
  const openLogoutConfirmation = () => {
    setOpenLogoutDialog(true);
  };

  // Close confirmation dialog
  const closeLogoutConfirmation = () => {
    setOpenLogoutDialog(false);
  };

  // Handle actual logout after confirmation
  const handleSignOut = async () => {
    try {
      // Call the logout API
      // await logoutMutation.mutateAsync();

      // Clear auth state using the auth store's clearAuth method
      clearAuth();

      // Show success toast
      toast.success('Đăng xuất thành công');

      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out: ', error);
      toast.error('Đăng xuất thất bại');
    } finally {
      // Close the dialog
      closeLogoutConfirmation();
    }
  };

  // if (!currentUser) return null;
  // const currentUserDetails = currentUser?.userDetails;

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black">
      {/* Search Bar */}
      <div className="flex items-center gap-8">
        {!isSidebarCollapsed ? null : (
          <button
            onClick={() => {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }}
          >
            <Menu className="h-8 w-8 dark:text-white" />
          </button>
        )}
        <div className="relative flex h-min w-[200px]">
          <Search className="absolute left-[4px] top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer dark:text-white" />
          <input
            className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white"
            type="search"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Icons */}
      <div className="flex items-center">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={
            isDarkMode
              ? `rounded p-2 dark:hover:bg-gray-700`
              : `rounded p-2 hover:bg-gray-100`
          }
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 cursor-pointer dark:text-white" />
          ) : (
            <Moon className="h-6 w-6 cursor-pointer dark:text-white" />
          )}
        </button>
        <Link
          href="/settings"
          className={
            isDarkMode
              ? `h-min w-min rounded p-2 dark:hover:bg-gray-700`
              : `h-min w-min rounded p-2 hover:bg-gray-100`
          }
        >
          <Settings className="h-6 w-6 cursor-pointer dark:text-white" />
        </Link>
        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>
        <div className="hidden items-center justify-between md:flex">
          <div className="align-center flex h-9 w-9 justify-center">
            <User className="h-6 w-6 cursor-pointer self-center rounded-full dark:text-white" />
          </div>
          <span className="mx-3 text-gray-800 dark:text-white">
            {/* MUC KHO TIEU */}
          </span>
          <button
            className="hidden rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 md:block"
            onClick={openLogoutConfirmation}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? 'Đang xử lý...' : 'Đăng xuất'}
          </button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={closeLogoutConfirmation}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Xác nhận đăng xuất</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLogoutConfirmation}>Hủy</Button>
          <Button
            onClick={handleSignOut}
            color="primary"
            variant="contained"
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? 'Đang xử lý...' : 'Đăng xuất'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Navbar;
