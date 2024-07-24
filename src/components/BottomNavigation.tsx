"use client";
import {
  Squares2X2Icon,
  CreditCardIcon,
  ChartBarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Dispatch, SetStateAction } from "react";
import BottomTab from "./BottomTab";

const TABS = [
  {
    name: "mybooking",
    label: "My Booking",
    icon: Squares2X2Icon,
  },
  {
    name: "mycard",
    label: "My Card",
    icon: CreditCardIcon,
  },
  {
    name: "chart",
    label: "Chart",
    icon: ChartBarIcon,
  },
  {
    name: "profile",
    label: "Profile",
    icon: UserIcon,
  },
];

type Props = {
  activeTab: number;
  setActiveTab: Dispatch<SetStateAction<number>>;
};

export default function BottomNavigation({ activeTab, setActiveTab }: Props) {
  return (
    <>
      <div className="h-16"></div>
      <nav className="fixed bottom-0 left-0 right-0 flex h-16 justify-center bg-white px-4">
        {TABS.map((tab, index) => (
          <BottomTab
            key={tab.name}
            name={tab.name}
            icon={tab.icon}
            isActive={activeTab === index}
            onClick={() => setActiveTab(index)}
          />
        ))}
      </nav>
    </>
  );
}
