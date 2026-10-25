'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, 
  Gamepad2, 
  Trophy, 
  Clock, 
  Share2, 
  UserPlus, 
  MessageSquare, 
  ShieldAlert, 
  Ban, 
  Check, 
  Calendar,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { mockStore } from '@/lib/supabase/mock-store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Profile } from '@/types';
import { ProfileCover } from '@/components/profile/ProfileCover';
import { useAuth } from '@/features/auth/AuthContext';
import { FEATURED_GAMES } from '@/lib/games';
import { DEFAULT_AVATAR } from '@/lib/avatar';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const { user, isLoading } = useAuth();

  // 1) demo players, 2) the signed-in account itself, 3) a real account stored in the backend
  const [remote, setRemote] = useState<Profile | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const wanted = String(username || '').toLowerCase();
  const local =
    mockStore.getProfileByUsername(username) ??
    (user && user.username.toLowerCase() === wanted ? user : undefined);

  useEffect(() => {
    setRemote(null);
    if (local || !wanted || !isSupabaseConfigured()) return;
    let cancelled = false;
    setLookingUp(true);
    supabase
      .from('profiles')
      .select('*')
      .ilike('username', wanted)
      .maybeSingle()
      .then(({ data: row }) => {
        if (cancelled) return;
        if (row) {
          setRemote({
            id: row.id,
            username: row.username,
            display_name: row.display_name || row.username,
            avatar_url: row.avatar_url || '',
            banner_url: row.banner_url || undefined,
            bio: row.bio || '',
            status: row.status || 'online',
            custom_status: row.custom_status || undefined,
            favorite_categories: row.favorite_categories || [],
            level: row.level ?? 1,
            xp: row.xp ?? 0,
            is_admin: !!row.is_admin,
            is_moderator: !!row.is_moderator,
            created_at: row.created_at || new Date().toISOString(),
            updated_at: row.updated_at,
          } as Profile);
        }
      })
      .then(() => { if (!cancelled) setLookingUp(false); }, () => { if (!cancelled) setLookingUp(false); });
    return () => { cancelled = true; };
  }, [local, wanted]);

  const profile = local ?? remote ?? undefined;

  const [copied, setCopied] = useState(false);
  const [friendStatus, setFriendStatus] = useState<string>('none');
  const [showBlockModal, setShowBlockModal] = useState(false);

  if (!profile && (isLoading || lookingUp)) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-5 text-slate-400" role="status">
        <div className="gem-loader" />
        <p className="text-sm">Loading profile</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center glass-panel rounded-xl border border-arcade-border">
        <User className="w-12 h-12 text-arcade-rose mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Player Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">No profile exists with the username @{username}.</p>
        <Link href="/players" className="btn-gold mt-4 inline-block px-5 py-2 font-bold text-xs rounded-full">
          Discover Players
        </Link>
      </div>
    );
  }

  const isMe = user?.id === profile.id;
  const favorites = mockStore.getFavorites(profile.id);
  const favoriteGames = FEATURED_GAMES.filter(g => favorites.includes(g.id));

  const copyProfileLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddFriend = () => {
    if (!user) return;
    mockStore.sendFriendRequest(user.id, profile.id);
    setFriendStatus('sent');
  };

  const handleBlockUser = () => {
    if (user) {
      mockStore.blockUser(user.id, profile.id);
      router.push('/friends');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Back button */}
      <Link
        href="/players"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-arcade-champagne transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Players
      </Link>

      {/* 3D Cinematic Profile Card & Panoramic Cover */}
      <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#090b14]/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        {/* Panoramic Cover Banner */}
        <div className="h-56 sm:h-72 lg:h-80 w-full relative overflow-hidden bg-[#060812]">
          <ProfileCover bannerUrl={profile.banner_url} seed={profile.username} />
          {/* Subtle top & bottom ambient vignettes */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090b14] via-[#090b14]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Floating Aligned Profile Identity & Action Bar */}
        <div className="relative px-6 sm:px-8 pb-7 -mt-20 sm:-mt-24 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          {/* Avatar + Identity Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* 3D Elevated Avatar Frame */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1.5 rounded-[1.75rem] bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-secondary)] opacity-50 blur-lg group-hover:opacity-100 transition-opacity" />
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-[1.5rem] p-1.5 bg-[#090b14] border-2 border-white/25 shadow-2xl overflow-hidden">
                <img
                  src={profile.avatar_url || DEFAULT_AVATAR(profile.username)}
                  alt={profile.display_name}
                  className="w-full h-full rounded-xl sm:rounded-[1.1rem] object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {/* Status Indicator Orb */}
              <div className="absolute bottom-1 right-1 p-1 rounded-full bg-[#090b14] border border-white/20 shadow-lg">
                <span
                  className={`block w-4 h-4 rounded-full border border-black ${
                    profile.status === 'online'
                      ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse'
                      : profile.status === 'dnd'
                      ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)]'
                      : 'bg-zinc-500'
                  }`}
                  title={`Status: ${profile.status}`}
                />
              </div>
            </div>

            {/* Display Name, Username, Badges, and Metadata */}
            <div className="space-y-2 pb-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight drop-shadow-md">
                  {profile.display_name}
                </h1>
                {profile.is_admin ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    STAFF
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/40 text-[var(--accent)] text-[10px] font-mono font-bold uppercase tracking-wider">
                    PRO GAMER
                  </span>
                )}
                {isMe && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                    YOU
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
                <span className="font-mono font-bold text-slate-300">@{profile.username}</span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 font-mono font-bold text-amber-300">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  Lv. {profile.level}
                </span>
              </div>
            </div>
          </div>

          {/* Social Action Buttons */}
          <div className="flex items-center justify-center sm:justify-end gap-2.5 shrink-0 pb-1">
            <button
              onClick={copyProfileLink}
              className="glass-chip px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            {!isMe && (
              <>
                <Link
                  href="/messages"
                  className="glass-chip px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                  <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
                  <span>Message</span>
                </Link>

                <button
                  onClick={handleAddFriend}
                  disabled={friendStatus === 'sent'}
                  className="btn-gaming px-5 py-2.5 rounded-xl text-xs font-black text-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_var(--accent-glow)]"
                >
                  {friendStatus === 'sent' ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{friendStatus === 'sent' ? 'Request Sent' : 'Add Friend'}</span>
                </button>

                <button
                  onClick={() => setShowBlockModal(true)}
                  className="p-2.5 rounded-xl glass-chip text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                  title="Block User"
                >
                  <Ban className="w-4 h-4" />
                </button>
              </>
            )}

            {isMe && (
              <Link
                href="/settings"
                className="btn-gaming px-5 py-2.5 rounded-xl text-xs font-black text-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_var(--accent-glow)]"
              >
                <span>Edit Profile</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details & Gaming Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bio & Badges */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 font-display">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" /> About Player
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {profile.bio || 'This player keeps their bio shrouded in mystery.'}
            </p>

            <div className="pt-3 border-t border-white/10 space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Status: <b className="text-emerald-400 capitalize">{profile.status}</b></span>
              </div>
            </div>
          </div>

          {/* Level Progression */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3.5 shadow-xl">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-white uppercase tracking-wider font-display flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Arcade Level
              </span>
              <span className="font-mono text-amber-300 font-black">Lv. {profile.level}</span>
            </div>
            <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-secondary)] h-full w-3/4 rounded-full shadow-[0_0_12px_var(--accent-glow)]" />
            </div>
            <div className="text-[10px] text-slate-400 text-right font-mono font-bold">
              {profile.xp.toLocaleString()} XP Points
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Favorite Games & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 font-display">
              <Gamepad2 className="w-4 h-4 text-[var(--accent)]" /> Favorite Games
            </h2>

            {favoriteGames.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center font-medium">No favorite games added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteGames.map(game => (
                  <Link
                    key={game.id}
                    href={`/game/${game.slug}`}
                    className="p-3 rounded-2xl bg-black/40 border border-white/10 hover:border-[var(--accent)] hover:scale-[1.02] transition-all flex items-center gap-3.5 group shadow-lg"
                  >
                    <img src={game.thumbnail_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white group-hover:text-[var(--accent)] transition-colors truncate">{game.title}</div>
                      <div className="text-[10px] text-[var(--accent)] font-semibold mt-0.5">{game.category}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full p-6 rounded-2xl border border-arcade-border space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ban className="w-4 h-4 text-arcade-rose" /> Block @{profile.username}?
            </h3>
            <p className="text-xs text-slate-400">
              Blocked users cannot send you messages, friend requests, or room invites.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-arcade-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-arcade-rose text-white hover:bg-arcade-rose/80"
              >
                Block User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
