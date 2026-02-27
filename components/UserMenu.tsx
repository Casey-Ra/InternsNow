"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";

interface UserMenuProps {
  profileImage?: string;
  name?: string;
}

export default function UserMenu({ profileImage, name }: UserMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center focus:outline-none cursor-pointer">
          <Image
            src={profileImage || "/default-avatar.png"}
            alt="Profile"
            width={44}
            height={44}
            className="rounded-full border border-gray-600 hover:opacity-90"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1 text-sm text-gray-200">
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="font-medium">{name || "User"}</p>
            </div>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/student/profile/view"
                  className={`block px-4 py-2 ${active ? "bg-gray-700" : ""}`}
                >
                  View Profile
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/student/profile/edit"
                  className={`block px-4 py-2 ${active ? "bg-gray-700" : ""}`}
                >
                  Edit Profile
                </Link>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <a
                  href="/auth/logout"
                  className={`block px-4 py-2 text-red-400 ${
                    active ? "bg-gray-700 text-red-300" : ""
                  }`}
                >
                  Logout
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
