-- Seed data for development and testing

-- Profiles
INSERT INTO public.profiles (id, username, display_name, avatar_url, banner_url, bio, status, custom_status, favorite_categories, level, xp, is_admin, is_moderator)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'alex_c', 'Alex Chen', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200', 'Arcade enthusiast and portal administrator.', 'online', 'Reviewing catalog submissions', ARRAY['Arcade', 'Action', 'Puzzle'], 42, 18450, TRUE, TRUE),
    ('22222222-2222-2222-2222-222222222222', 'sam_m', 'Sam Miller', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200', 'Speedrunner and puzzle enthusiast.', 'online', 'Practicing 2048 routes', ARRAY['Strategy', 'Puzzle', 'Arcade'], 28, 9200, FALSE, FALSE),
    ('33333333-3333-3333-3333-333333333333', 'elena_r', 'Elena Rostova', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200', 'Multiplayer room host and moderator.', 'dnd', 'In party room', ARRAY['Multiplayer', 'Action', 'Platformer'], 35, 14200, FALSE, TRUE),
    ('44444444-4444-4444-4444-444444444444', 'marcus_k', 'Marcus Kim', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200', 'HTML5 and WebGL game developer.', 'idle', 'Away from keyboard', ARRAY['Experimental', 'Puzzle', 'Platformer'], 19, 5800, FALSE, FALSE),
    ('55555555-5555-5555-5555-555555555555', 'priya_d', 'Priya Das', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200', 'Pixel artist and casual player.', 'offline', '', ARRAY['Casual', 'Arcade', 'Board games'], 14, 3900, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert User Preferences
INSERT INTO public.user_preferences (user_id, theme, accent_color, animation_intensity, sound_effects_enabled, privacy_show_activity, privacy_allow_dms_from, privacy_show_online_status)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'dark', 'cyan', 'full', TRUE, TRUE, 'everyone', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'cyberpunk', 'lime', 'full', TRUE, TRUE, 'everyone', TRUE),
    ('33333333-3333-3333-3333-333333333333', 'synthwave', 'purple', 'full', TRUE, TRUE, 'friends', TRUE),
    ('44444444-4444-4444-4444-444444444444', 'dark', 'coral', 'reduced', FALSE, TRUE, 'everyone', TRUE),
    ('55555555-5555-5555-5555-555555555555', 'light', 'cyan', 'minimal', TRUE, FALSE, 'friends', FALSE)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Games catalog: intentionally empty. The site reads its games from the GameMonetize feed
--    (src/lib/games/registry.json, rebuilt with `npm run sync:feed`).

-- 4. Insert Seed Friendships
INSERT INTO public.friendships (user1_id, user2_id)
VALUES
    ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
    ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333'),
    ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333')
ON CONFLICT DO NOTHING;

-- 5. Insert Seed Rooms
INSERT INTO public.rooms (id, code, name, description, host_id, visibility, max_participants, selected_game_id, is_voice_active)
VALUES
    (
        'b1111111-1111-1111-1111-111111111111',
        'ROOM-01',
        'Casual Arcade Lobby',
        'Open room for casual browser games and co-op play.',
        '11111111-1111-1111-1111-111111111111',
        'public',
        16,
        NULL,
        TRUE
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        'ROOM-02',
        'Puzzle Games Room',
        'Open voice and chat room for puzzle games and speedruns.',
        '22222222-2222-2222-2222-222222222222',
        'public',
        8,
        NULL,
        TRUE
    ),
    (
        'b3333333-3333-3333-3333-333333333333',
        'ROOM-03',
        'Strategy & Tactics',
        'Strategy and multiplayer discussion room.',
        '33333333-3333-3333-3333-333333333333',
        'public',
        12,
        NULL,
        TRUE
    )
ON CONFLICT (id) DO NOTHING;

-- Communities
INSERT INTO public.communities (id, slug, name, description, avatar_url, banner_url, owner_id, is_featured)
VALUES
    (
        'c1111111-1111-1111-1111-111111111111',
        'speedrunners-syndicate',
        'Speedrunners Syndicate',
        'The global hub for frame-perfect runs, glitch discoveries, and leaderboard dominance.',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
        '22222222-2222-2222-2222-222222222222',
        TRUE
    ),
    (
        'c2222222-2222-2222-2222-222222222222',
        'retro-arcade-club',
        'Retro Arcade Club',
        'Preserving and playing the golden age of arcade games in the modern browser.',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200',
        '11111111-1111-1111-1111-111111111111',
        TRUE
    )
ON CONFLICT (id) DO NOTHING;

-- Community channels
INSERT INTO public.community_channels (id, community_id, name, topic, type, position)
VALUES
    ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'general-lounge', 'Welcome to the syndicate! Say hello here.', 'text', 0),
    ('d2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'records-and-strats', 'Post your PBs, clips, and strat breakthroughs.', 'text', 1),
    ('d3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Live Stage Voice', 'Voice channel for live race commentary', 'voice', 2),
    ('d4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'arcade-chat', 'General arcade discussion and high-score banter', 'text', 0),
    ('d5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'game-recommendations', 'Suggest new web-games to import into Pixelverse', 'text', 1)
ON CONFLICT (id) DO NOTHING;

-- Stickers
INSERT INTO public.stickers (id, pack_name, name, url, tags)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 'Pixel Arcade', 'GG WP', '🎮', ARRAY['gg', 'arcade', 'game']),
    ('e2222222-2222-2222-2222-222222222222', 'Pixel Arcade', 'Fire Combo', '🔥', ARRAY['fire', 'combo', 'hype']),
    ('e3333333-3333-3333-3333-333333333333', 'Pixel Arcade', 'High Score', '🏆', ARRAY['trophy', 'score', 'win']),
    ('e4444444-4444-4444-4444-444444444444', 'Pixel Arcade', 'Neon Skull', '💀', ARRAY['rip', 'dead', 'skull']),
    ('e5555555-5555-5555-5555-555555555555', 'Pixel Arcade', 'Hyper Blast', '⚡', ARRAY['zap', 'lightning', 'fast'])
ON CONFLICT (id) DO NOTHING;
