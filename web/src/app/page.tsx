"use client";

import FlirOneRadarCard from "@/components/FlirOneRadarCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            PhoneRadar
          </h1>
          <p className="text-gray-400">
            FLIR One Benzeri BLE Radar Cihazı
          </p>
        </header>

        <FlirOneRadarCard />
      </div>
    </main>
  );
}
