'use client';

import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Shuffle,
  Check,
  Download,
  Share2,
  Crown,
  Shirt,
  Smile,
  Zap,
  Palette,
  Shield,
  Layers,
  Flame,
} from 'lucide-react';
import {
  AvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  OUTFITS,
  FACES,
  HEADWEAR,
  BACK_GEAR,
  BACKGROUND_STAGES,
  PRESET_AVATARS,
  OptionItem,
} from '@/lib/avatar-builder/types';
import { avatarConfigToDataUrl, renderAvatarSvg } from '@/lib/avatar-builder/renderer';
import { AvatarPreview } from './AvatarPreview';
import { playSfx } from '@/lib/sfx';

type TabKey = 'skin' | 'hair' | 'outfit' | 'face' | 'headwear' | 'backGear' | 'background';

interface AvatarStudioProps {
  initialConfig?: AvatarConfig;
  onSave?: (dataUrl: string, config: AvatarConfig) => Promise<void> | void;
  saveButtonText?: string;
  isStandalonePage?: boolean;
}

export function AvatarStudio({
  initialConfig,
  onSave,
  saveButtonText = 'Save & Equip Avatar',
  isStandalonePage = false,
}: AvatarStudioProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || DEFAULT_AVATAR_CONFIG);
  const [activeTab, setActiveTab] = useState<TabKey>('outfit');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Tab definitions
  const TABS: { id: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
    { id: 'outfit', label: 'Outfits', icon: Shirt, count: OUTFITS.length },
    { id: 'hair', label: 'Hair & Color', icon: Sparkles, count: HAIR_STYLES.length },
    { id: 'face', label: 'Face', icon: Smile, count: FACES.length },
    { id: 'headwear', label: 'Headwear', icon: Crown, count: HEADWEAR.length },
    { id: 'backGear', label: 'Back Gear', icon: Shield, count: BACK_GEAR.length },
    { id: 'skin', label: 'Skin & Cyber', icon: Zap, count: SKIN_TONES.length },
    { id: 'background', label: 'Stage', icon: Layers, count: BACKGROUND_STAGES.length },
  ];

  // Randomizer: generate awesome random combinations
  const randomize = useCallback(() => {
    playSfx('launch');
    const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const newConfig: AvatarConfig = {
      skin: randomItem(SKIN_TONES).id,
      face: randomItem(FACES).id,
      hair: randomItem(HAIR_STYLES).id,
      hairColor: randomItem(HAIR_COLORS).id,
      outfit: randomItem(OUTFITS).id,
      headwear: randomItem(HEADWEAR).id,
      backGear: randomItem(BACK_GEAR).id,
      background: randomItem(BACKGROUND_STAGES).id,
    };
    setConfig(newConfig);
  }, []);

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    playSfx('launch');

    // Trigger celebratory confetti burst!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f3ff', '#ff2a85', '#facc15', '#a855f7', '#10b981'],
      });
    } catch {}

    const dataUrl = avatarConfigToDataUrl(config);

    if (onSave) {
      await onSave(dataUrl, config);
    }

    setIsSaving(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  // Download high-res PNG
  const downloadPng = () => {
    playSfx('tap');
    const svgStr = renderAvatarSvg(config, 800);
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = `pixelverse-avatar-${Date.now()}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] text-black text-[11px] font-black uppercase tracking-wider shadow-md">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> Roblox & Cyber Outfits
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              100% FREE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Character Avatar Studio
          </h2>
          <p className="text-xs text-slate-400">
            Customize your unique skins, hairstyles, cool outfits, and back gear.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={randomize}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-slate-200 hover:text-white hover:border-[var(--accent)] text-xs font-black transition-all btn-3d"
          >
            <Shuffle className="w-4 h-4 text-[var(--accent)]" />
            <span>Surprise Me</span>
          </button>
          <button
            type="button"
            onClick={downloadPng}
            className="p-2 rounded-xl bg-white/5 border border-white/15 text-slate-200 hover:text-white text-xs transition-all"
            title="Download Avatar PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Inspirations Bar */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1">
          <Flame className="w-3 h-3 text-[var(--accent)]" />
          Quick Styles:
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_AVATARS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                playSfx('launch');
                setConfig(preset.config);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 hover:border-[var(--accent)] hover:bg-white/[0.06] text-xs font-extrabold whitespace-nowrap shrink-0 transition-all active:scale-95 text-slate-300 hover:text-white"
            >
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Workstation: Left Showcase + Right Customization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Avatar Showcase on Neon Pedestal */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#060812]/90 border border-white/15 relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Radial Light */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent)]/10 via-transparent to-transparent pointer-events-none" />

          {/* Avatar Preview */}
          <div className="py-4">
            <AvatarPreview config={config} size={280} glow />
          </div>

          {/* Pedestal Base Ring */}
          <div className="w-48 h-3 rounded-full bg-[var(--accent)] opacity-40 blur-sm -mt-2" />
          <div className="w-36 h-1 rounded-full bg-white opacity-60 -mt-2" />

          {/* Save Button */}
          <div className="w-full mt-6 space-y-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full btn-gaming py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_var(--accent-glow)] active:scale-98 transition-all"
            >
              {justSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                  <span>Avatar Equipped & Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>{saveButtonText}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Layer Tabs & Selection Grid */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-white/10">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playSfx('tap');
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[var(--accent)] text-black shadow-[0_0_12px_var(--accent-glow)] scale-102'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-black/25 text-black' : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hair Color Bar (Special palette when hair tab is active) */}
          {activeTab === 'hair' && (
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-[var(--accent)]" />
                Select Hair Color
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {HAIR_COLORS.map((hc) => {
                  const isSelected = config.hairColor === hc.id;
                  return (
                    <button
                      key={hc.id}
                      type="button"
                      onClick={() => {
                        playSfx('soft');
                        setConfig({ ...config, hairColor: hc.id });
                      }}
                      className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-[var(--accent)] bg-white/15 shadow-[0_0_10px_var(--accent-glow)]'
                          : 'border-white/15 bg-black/40 hover:border-white/30'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-sm shrink-0"
                        style={{ backgroundColor: hc.previewColor }}
                      />
                      <span className="text-[11px] font-bold text-white">{hc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Option Grid for Active Category */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            {/* Outfits */}
            {activeTab === 'outfit' &&
              OUTFITS.map((item) => (
                <OptionCard
                  key={item.id}
                  item={item}
                  isSelected={config.outfit === item.id}
                  onClick={() => {
                    playSfx('soft');
                    setConfig({ ...config, outfit: item.id });
                  }}
                />
              ))}

            {/* Hairstyles */}
            {activeTab === 'hair' &&
              HAIR_STYLES.map((item) => (
                <OptionCard
                  key={item.id}
                  item={item}
                  isSelected={config.hair === item.id}
                  onClick={() => {
                    playSfx('soft');
                    setConfig({ ...config, hair: item.id });
                  }}
                />
              ))}

            {/* Faces */}
            {activeTab === 'face' &&
              FACES.map((item) => (
                <OptionCard
                  key={item.id}
                  item={item}
                  isSelected={config.face === item.id}
                  onClick={() => {
                    playSfx('soft');
                    setConfig({ ...config, face: item.id });
                  }}
                />
              ))}

            {/* Headwear */}
            {activeTab === 'headwear' &&
              HEADWEAR.map((item) => (
                <OptionCard
                  key={item.id}
                  item={item}
                  isSelected={config.headwear === item.id}
                  onClick={() => {
                    playSfx('soft');
                    setConfig({ ...config, headwear: item.id });
                  }}
                />
              ))}

            {/* Back Gear */}
            {activeTab === 'backGear' &&
              BACK_GEAR.map((item) => (
                <OptionCard
                  key={item.id}
                  item={item}
                  isSelected={config.backGear === item.id}
                  onClick={() => {
                    playSfx('soft');
                    setConfig({ ...config, backGear: item.id });
                  }}
                />
              ))}

            {/* Skin Tone & Cyber Texture */}
            {activeTab === 'skin' &&
              SKIN_TONES.map((item) => (
                <OptionCard
                  key={item.id}
                  item={item}
                  isSelected={config.skin === item.id}
                  onClick={() => {
                    playSfx('soft');
                    setConfig({ ...config, skin: item.id });
                  }}
                />
              ))}

            {/* Background Stages */}
            {activeTab === 'background' &&
              BACKGROUND_STAGES.map((item) => (
                <OptionCard
                  key={item.id}
                  item={item}
                  isSelected={config.background === item.id}
                  onClick={() => {
                    playSfx('soft');
                    setConfig({ ...config, background: item.id });
                  }}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionCard<T extends string>({
  item,
  isSelected,
  onClick,
}: {
  item: OptionItem<T>;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col p-3 rounded-2xl border text-left transition-all duration-200 active:scale-96 ${
        isSelected
          ? 'bg-[var(--accent)]/15 border-[var(--accent)] shadow-[0_0_16px_var(--accent-glow)] scale-[1.02]'
          : 'bg-black/50 border-white/10 hover:border-white/30 hover:bg-white/[0.04]'
      }`}
    >
      {/* Top row: Icon / Color swatch + Selected Checkmark */}
      <div className="flex items-center justify-between w-full mb-1.5">
        <div className="flex items-center gap-1.5">
          {item.previewColor && (
            <div className="flex -space-x-1 items-center">
              <span
                className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
                style={{ backgroundColor: item.previewColor }}
              />
              {item.previewSecondary && (
                <span
                  className="w-4 h-4 rounded-full border border-white/30 shadow-sm"
                  style={{ backgroundColor: item.previewSecondary }}
                />
              )}
            </div>
          )}

          {item.isNew && (
            <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent)] text-black font-mono">
              HOT
            </span>
          )}
        </div>

        {isSelected && (
          <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-black flex items-center justify-center shrink-0">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
        )}
      </div>

      {/* Name */}
      <div className="text-xs font-black text-white group-hover:text-[var(--accent)] transition-colors truncate">
        {item.name}
      </div>

      {/* Tagline */}
      {item.tagline && (
        <div className="text-[10px] text-slate-400 truncate font-medium mt-0.5">
          {item.tagline}
        </div>
      )}
    </button>
  );
}
