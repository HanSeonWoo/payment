"use client";
import BottomNavigation from "@/components/BottomNavigation";
import ChartTab from "@/components/tabs/ChartTab";
import MyBookingTab from "@/components/tabs/MyBookingTab";
import MyCardTab from "@/components/tabs/MyCardTab";
import ProfileTab from "@/components/tabs/ProfileTab";
import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState(2);
  const tabs = [MyBookingTab, MyCardTab, ChartTab, ProfileTab];
  const ActiveTab = tabs[activeTab];

  return (
    <main className="mx-auto flex max-w-96 flex-col">
      <ActiveTab />
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}
