/**
 * PrayerSettingsScreen — Per-prayer notification settings
 * شاشة إعدادات إشعارات الصلاة لكل صلاة
 * 
 * Reference: IMG_20260716_172653_682.jpg
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type {
  PrayerSettingsId,
  SinglePrayerPreference,
  PrayerNotificationMode,
  MuezzinTrack,
  AllPrayersPreferences,
} from '@/types/prayer-settings';
import { NOTIFICATION_MODE_LABELS } from '@/types/prayer-settings';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { MuezzinSelectorSection } from './MuezzinSelectorSection';
import { SecondaryPrayerTimesAccordion } from './SecondaryPrayerTimesAccordion';

interface PrayerSettingsScreenProps {
  prayerId: PrayerSettingsId;
  preferences: AllPrayersPreferences;
  onSave: (prefs: AllPrayersPreferences) => void;
  onClose: () => void;
  /** Secondary timings data */
  fajrTime?: Date;
  maghribTime?: Date;
  sunriseTime?: Date;
  ishaTime?: Date;
}

/** Switch toggle component — matching app design */
const ToggleSwitch = React.memo(function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none flex items-center shadow-inner cursor-pointer"
      style={{
        backgroundColor: checked ? '#b88a4f' : '#e6dccf',
        justifyContent: checked ? 'flex-start' : 'flex-end',
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className="w-5 h-5 rounded-full bg-white shadow-md border border-white"
      />
    </button>
  );
});

const MODES: PrayerNotificationMode[] = ['beep', 'azan_short', 'azan_full', 'vibrate_only', 'silent'];

export const PrayerSettingsScreen = React.memo(function PrayerSettingsScreen({
  prayerId,
  preferences,
  onSave,
  onClose,
  fajrTime,
  maghribTime,
  sunriseTime,
  ishaTime,
}: PrayerSettingsScreenProps) {
  // Work with a local copy for dirty tracking
  const [localPrefs, setLocalPrefs] = useState<AllPrayersPreferences>(() => ({
    ...preferences,
  }));
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [selectedMuezzin, setSelectedMuezzin] = useState<MuezzinTrack | null>(null);

  const currentPref = localPrefs[prayerId];

  // Dirty check
  const isDirty = useMemo(
    () => JSON.stringify(localPrefs) !== JSON.stringify(preferences),
    [localPrefs, preferences]
  );

  // Update local pref for this prayer
  const updatePref = useCallback((updates: Partial<SinglePrayerPreference>) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [prayerId]: { ...prev[prayerId], ...updates },
    }));
  }, [prayerId]);

  // Handle mode change
  const handleModeChange = useCallback((mode: PrayerNotificationMode) => {
    updatePref({ mode });
  }, [updatePref]);

  // Handle enabled toggle
  const handleEnabledToggle = useCallback((enabled: boolean) => {
    updatePref({ enabled });
  }, [updatePref]);

  // Handle muezzin selection
  const handleMuezzinSelect = useCallback((track: MuezzinTrack) => {
    setSelectedMuezzin(track);
    updatePref({ selectedMuezzinId: track.id });
  }, [updatePref]);

  // Handle secondary timing toggle
  const handleSecondaryToggle = useCallback((id: PrayerSettingsId, enabled: boolean) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [id]: { ...prev[id], enabled },
    }));
  }, []);

  // Handle secondary settings open
  const handleSecondaryOpenSettings = useCallback((_id: PrayerSettingsId) => {
    // For now, we stay on the same screen — could navigate to sub-screen
  }, []);

  // Close handler with unsaved check
  const handleClose = useCallback(() => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Save handler
  const handleSave = useCallback(() => {
    onSave(localPrefs);
    onClose();
  }, [localPrefs, onSave, onClose]);

  // Discard handler
  const handleDiscard = useCallback(() => {
    setLocalPrefs({ ...preferences });
    setShowUnsavedModal(false);
    onClose();
  }, [preferences, onClose]);

  // Save from modal
  const handleSaveFromModal = useCallback(() => {
    onSave(localPrefs);
    setShowUnsavedModal(false);
    onClose();
  }, [localPrefs, onSave, onClose]);

  // Check if muezzin section should show
  const showMuezzinSection = currentPref.mode === 'azan_short' || currentPref.mode === 'azan_full';

  // Dynamic header title
  const headerTitle = `${currentPref.prayerDisplayName} الإعدادات`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-[#ece7de] overflow-y-auto"
      dir="rtl"
    >
      <div className="mx-auto w-full max-w-[390px] px-4 pb-24 pt-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-black text-[#2b1a10]">{headerTitle}</h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-[#f7f2ea] border border-[#e6dccf] flex items-center justify-center text-[#7f6a55] hover:bg-[#e6dccf] transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Toggle Card: إشعارات الصلاة ── */}
        <div className="rounded-[20px] bg-[#fdfcfb] border border-[#e6dccf]/50 p-4 mb-4 shadow-[0_4px_16px_rgba(43,26,16,0.03)]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-[15px] font-black text-[#2b1a10]">إشعارات الصلاة</h3>
              <p className="text-[12px] text-[#7f6a55] mt-1">
                استقبل التذكيرات صلاة {currentPref.prayerDisplayName}.
              </p>
            </div>
            <ToggleSwitch
              checked={currentPref.enabled}
              onChange={handleEnabledToggle}
            />
          </div>
        </div>

        {/* ── Preferences Card: تفضيّلات الإشعارات ── */}
        <div
          className={`rounded-[20px] bg-[#fdfcfb] border border-[#e6dccf]/50 p-4 mb-4 shadow-[0_4px_16px_rgba(43,26,16,0.03)] transition-all duration-300 ${
            !currentPref.enabled ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <h3 className="text-[15px] font-black text-[#2b1a10] mb-3">تفضيّلات الإشعارات</h3>

          <div className="space-y-1">
            {MODES.map((mode) => {
              const isActive = currentPref.mode === mode;
              const label = NOTIFICATION_MODE_LABELS[mode];

              return (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`w-full flex items-center justify-between rounded-[14px] px-3 py-3 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#b88a4f]/[0.08] border border-[#b88a4f]/25'
                      : 'hover:bg-[#f7f2ea] border border-transparent'
                  }`}
                >
                  {/* Right: Radio check + Text */}
                  <div className="flex items-center gap-3">
                    {/* Radio indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isActive ? 'border-[#b88a4f] bg-[#b88a4f]' : 'border-[#e6dccf]'
                    }`}>
                      {isActive && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>

                    <div className="text-right">
                      <p className={`text-[13px] font-bold ${isActive ? 'text-[#2b1a10]' : 'text-[#7f6a55]'}`}>
                        {label.title}
                      </p>
                      <p className="text-[11px] text-[#7f6a55]/70 mt-0.5">
                        {label.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Muezzin Selection (conditional) ── */}
          <AnimatePresence>
            {showMuezzinSection && (
              <MuezzinSelectorSection
                selectedMuezzinId={currentPref.selectedMuezzinId}
                onSelect={handleMuezzinSelect}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Secondary Timings Accordion ── */}
        <div className="rounded-[20px] bg-[#fdfcfb] border border-[#e6dccf]/50 p-4 mb-4 shadow-[0_4px_16px_rgba(43,26,16,0.03)]">
          <SecondaryPrayerTimesAccordion
            preferences={localPrefs}
            onToggleEnabled={handleSecondaryToggle}
            onOpenSettings={handleSecondaryOpenSettings}
            fajrTime={fajrTime}
            maghribTime={maghribTime}
            sunriseTime={sunriseTime}
            ishaTime={ishaTime}
          />
        </div>

        {/* ── Bottom Action: Save Button ── */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`w-full rounded-full py-3.5 text-[15px] font-bold transition-all duration-300 cursor-pointer ${
              isDirty
                ? 'bg-[#2b1a10] text-white shadow-[0_8px_24px_rgba(43,26,16,0.3)] hover:bg-[#3a2517] active:scale-[0.98]'
                : 'bg-[#e6dccf] text-[#7f6a55] cursor-not-allowed'
            }`}
          >
            احفظ التغييرات
          </button>
        </div>
      </div>

      {/* ── Unsaved Changes Modal ── */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onSave={handleSaveFromModal}
        onDiscard={handleDiscard}
      />
    </motion.div>
  );
});
