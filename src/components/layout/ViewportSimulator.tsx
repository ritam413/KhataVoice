'use client';

import React, { useEffect, useState } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';
import { useAppStore, useShallow } from '@/lib/store/useAppStore';
import { JudgeEconomicsScreen } from '@/components/views/JudgeEconomicsScreen';
import { ArchitectureInspector } from '@/components/views/ArchitectureInspector';
import { TopBar } from './TopBar';
import styles from './simulator.module.css';

interface ViewportSimulatorProps {
  children: React.ReactNode;
  desktopContent?: React.ReactNode;
}

export function ViewportSimulator({ children, desktopContent }: ViewportSimulatorProps) {
  const { viewportMode, activeScreen } = useAppStore(
    useShallow((s) => ({
      viewportMode: s.viewportMode,
      activeScreen: s.activeScreen,
    }))
  );

  const [currentTime, setCurrentTime] = useState('10:42');

  // Format real or formatted local time for status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.simulatorWrapper}>
      <TopBar />

      <main className={styles.viewportStage}>
        {viewportMode === 'mobile' ? (
          <div className={styles.phoneWrapper}>
            {/* Physical Hardware Buttons */}
            <div className={`${styles.sideButton} ${styles.powerButton}`} aria-hidden="true" />
            <div className={`${styles.sideButton} ${styles.volumeUpButton}`} aria-hidden="true" />
            <div className={`${styles.sideButton} ${styles.volumeDownButton}`} aria-hidden="true" />

            {/* Smartphone Chassis */}
            <div className={styles.phoneChassis}>
              <div className={styles.screenFrame}>
                {/* Dynamic Camera Notch */}
                <div className={styles.dynamicNotch} aria-hidden="true">
                  <div className={styles.cameraLens} />
                </div>

                {/* Simulated Android / iOS Status Bar */}
                <div className={styles.statusBar} aria-hidden="true">
                  <span className="font-semibold">{currentTime}</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="size-3 stroke-[2.2]" />
                    <Wifi className="size-3 stroke-[2.2]" />
                    <div className="flex items-center gap-0.5">
                      <span className="text-[10px]">98%</span>
                      <Battery className="size-3.5 fill-current stroke-[2]" />
                    </div>
                  </div>
                </div>

                {/* Handset Viewport Content */}
                <div className={styles.phoneContent}>
                  {children}
                </div>

                {/* Bottom Home Indicator Bar */}
                <div className={styles.homeIndicator} aria-hidden="true" />
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Command Center / Judge / Architecture Evaluation Layout */
          <div className={styles.desktopContainer}>
            {activeScreen === 'judge' ? (
              <JudgeEconomicsScreen />
            ) : activeScreen === 'architecture' ? (
              <ArchitectureInspector />
            ) : (
              desktopContent || children
            )}
          </div>
        )}
      </main>
    </div>
  );
}
