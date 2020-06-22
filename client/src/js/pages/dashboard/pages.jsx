import React from 'react';
import {
  MdDashboard,
  AiOutlineUser,
  FaSatelliteDish,
  IoIosSettings,
  MdSecurity,
} from 'react-icons/all';

export default [
  {
    icon: <MdDashboard />,
    key: 'home',
    path: '/',
  },
  {
    icon: <AiOutlineUser />,
    key: 'profile',
    path: '/profile',
  },
  {
    icon: <IoIosSettings />,
    key: 'settings',
    path: '/settings',
  },
  {
    icon: <FaSatelliteDish />,
    key: 'contact',
    path: '/contact',
  },
  {
    icon: <MdSecurity />,
    key: 'authAndSecurity',
    path: '/auth-and-security',
  },
];
