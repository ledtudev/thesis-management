'use client';

import { useGlobalStore } from '@/state';
import { useAuthStore } from '@/state/authStore';
import { Avatar } from '@mui/material';
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  GraduationCap,
  Home,
  Library,
  LockIcon,
  LucideIcon,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

// Function to get initials from a name
const getInitials = (name: string | undefined | null) => {
  if (!name) return '?';

  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2); // Limit to 2 characters
};

const Sidebar = () => {
  const [showProject, setShowProject] = useState(true); // ĐATN
  // const [showResearchProjects, setShowResearchProjects] = useState(false); // NCKH
  const [showPriority, setShowPriority] = useState(true);
  const authUser = useAuthStore((state) => state.user);
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useGlobalStore();
  const router = useRouter();
  const handleSignOut = async () => {
    try {
      // await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất: ', error);
    }
  };

  const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl
    transition-all duration-300 h-full z-40 dark:bg-black overflow-y-auto bg-white
    ${isSidebarCollapsed ? 'w-0 hidden' : 'w-64'}`;

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-[100%] w-full flex-col justify-start">
        {/* LOGO TRÊN CÙNG */}
        <div className="z-50 flex min-h-[56px] w-64 items-center justify-between bg-white px-6 pt-3 dark:bg-black">
          <div className="text-xl font-bold text-gray-800 dark:text-white">
            UTC ResearchHub
          </div>
          {isSidebarCollapsed ? null : (
            <button
              className="py-3"
              onClick={() => {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }}
            >
              <X className="h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white" />
            </button>
          )}
        </div>
        {/* ĐỘI NGŨ */}
        <div className="flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
          <Avatar
            alt={authUser?.fullName || ''}
            src={''}
            sx={{ width: 40, height: 40 }}
          >
            {getInitials(authUser?.fullName)}
          </Avatar>
          <div>
            <h3 className="text-md font-bold tracking-wide dark:text-gray-200">
              {authUser?.fullName}
            </h3>
            <div className="mt-1 flex items-start gap-2">
              <LockIcon className="mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-400" />
              <p className="text-xs text-gray-500">Đồ án</p>
            </div>
          </div>
        </div>
        {/* LIÊN KẾT MENU */}
        <nav className="z-10 w-full">
          <SidebarLink icon={Home} label="Trang chủ" href="/" />
          <SidebarLink icon={Library} label="Kho đề tài" href="/libary" />
          <SidebarLink icon={Bell} label="Thông báo" href="/notification" />
        </nav>

        {/* Đồ án*/}
        <button
          onClick={() => setShowProject((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span className="">Đồ án</span>
          {showProject ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {showProject && (
          <>
            <SidebarLink
              icon={BookOpen}
              label="Hướng nghiên cứu"
              href="/project/register"
            />
            <SidebarLink
              icon={FileText}
              label="Quản lý đề cương"
              href="/project/proposal"
            />
            {/* <SidebarLink
              icon={ClipboardCheck}
              label="Quản lý dự án"
              href="/project"
            /> */}
            <SidebarLink
              icon={GraduationCap}
              label="Bảo vệ & Hội đồng"
              href="/project"
            />
          </>
        )}

        {/* PRIORITIES LINKS */}
        <button
          onClick={() => setShowPriority((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span className="">Ưu tiên</span>
          {showPriority ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {/* {showPriority && (
          <>
            <SidebarLink
              icon={AlertCircle}
              label="Khẩn cấp"
              href="/priority/urgent"
            />
            <SidebarLink icon={ShieldAlert} label="Cao" href="/priority/high" />
            <SidebarLink
              icon={AlertTriangle}
              label="Trung bình"
              href="/priority/medium"
            />
            <SidebarLink
              icon={AlertOctagon}
              label="Thấp"
              href="/priority/low"
            />
            <SidebarLink
              icon={Layers3}
              label="Lùi lại"
              href="/priority/backlog"
            />
          </>
        )} */}
      </div>
      <div className="z-10 mt-32 flex w-full flex-col items-center gap-4 bg-white px-8 py-4 dark:bg-black md:hidden">
        <div className="flex w-full items-center">
          <div className="align-center flex h-9 w-9 justify-center">
            <User className="h-6 w-6 cursor-pointer self-center rounded-full dark:text-white" />
          </div>
          <span className="mx-3 text-gray-800 dark:text-white">MUCKHOTIEU</span>
          <button
            className="self-start rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 md:block"
            onClick={handleSignOut}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === '/' && href === '/dashboard');

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${
          isActive ? 'bg-gray-100 text-white dark:bg-gray-600' : ''
        } justify-start px-8 py-3`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-[100%] w-[5px] bg-blue-200" />
        )}

        <Icon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
        <span className={`font-medium text-gray-800 dark:text-gray-100`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

export default Sidebar;
