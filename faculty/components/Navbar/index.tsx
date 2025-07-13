import ThemeToggle from '@/app/components/ThemeToggle';
import { useGlobalStore } from '@/state';
import { Menu, Search, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useGlobalStore();
  const router = useRouter();
  const handleSignOut = async () => {
    try {
      // await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-dark-bg dark:text-white">
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
            className="w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none dark:bg-dark-tertiary dark:text-white dark:placeholder-gray-400"
            type="search"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Icons */}
      <div className="flex items-center">
        <ThemeToggle />
        <Link
          href="/settings"
          className="h-min w-min rounded p-2 hover:bg-gray-100 dark:hover:bg-dark-secondary"
        >
          <Settings className="h-6 w-6 cursor-pointer dark:text-white" />
        </Link>
        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 dark:bg-stroke-dark md:inline-block"></div>
        <div className="hidden items-center justify-between md:flex">
          <div className="align-center flex h-9 w-9 justify-center">
            <User className="h-6 w-6 cursor-pointer self-center rounded-full dark:text-white" />
          </div>
          <span className="mx-3 text-gray-800 dark:text-white">
            {/* MUC KHO TIEU */}
          </span>
          <button
            className="hidden rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 md:block"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
