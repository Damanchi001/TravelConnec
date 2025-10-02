-- Migration: Travel Groups Feature
-- Description: Adds support for travel groups with messaging integration

-- Create groups table
CREATE TABLE public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES public.user_profiles(id) NOT NULL,
  stream_channel_id TEXT NOT NULL UNIQUE, -- Stream channel ID for messaging
  stream_channel_type TEXT DEFAULT 'messaging',
  is_active BOOLEAN DEFAULT TRUE,
  max_members INTEGER DEFAULT 50, -- Maximum group size
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create group_members table
CREATE TYPE group_member_role AS ENUM ('admin', 'member');
CREATE TYPE group_member_status AS ENUM ('active', 'removed', 'invited');

CREATE TABLE public.group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  role group_member_role DEFAULT 'member',
  status group_member_status DEFAULT 'active',
  invited_by UUID REFERENCES public.user_profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique membership per user per group
  UNIQUE(group_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_groups_created_by ON public.groups(created_by);
CREATE INDEX idx_groups_stream_channel_id ON public.groups(stream_channel_id);
CREATE INDEX idx_groups_active ON public.groups(is_active);

CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_group_members_status ON public.group_members(status);

-- Function to get mutual followers for a user
CREATE OR REPLACE FUNCTION get_mutual_followers(user_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN,
  location JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.id,
    up.first_name,
    up.last_name,
    up.username,
    up.avatar_url,
    up.bio,
    (up.verification_status = 'verified') as is_verified,
    up.location
  FROM public.user_profiles up
  WHERE EXISTS (
    -- User follows this person
    SELECT 1 FROM public.followers f1
    WHERE f1.follower_id = user_uuid AND f1.following_id = up.id
  ) AND EXISTS (
    -- This person follows user back
    SELECT 1 FROM public.followers f2
    WHERE f2.follower_id = up.id AND f2.following_id = user_uuid
  )
  ORDER BY up.first_name, up.last_name;
END;
$$ LANGUAGE plpgsql;

-- Function to check if two users are mutual followers
CREATE OR REPLACE FUNCTION are_mutual_followers(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.followers f1
    WHERE f1.follower_id = user1_uuid AND f1.following_id = user2_uuid
  ) AND EXISTS (
    SELECT 1 FROM public.followers f2
    WHERE f2.follower_id = user2_uuid AND f2.following_id = user1_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's groups
CREATE OR REPLACE FUNCTION get_user_groups(user_uuid UUID)
RETURNS TABLE (
  group_id UUID,
  group_name TEXT,
  group_description TEXT,
  group_avatar_url TEXT,
  stream_channel_id TEXT,
  member_count BIGINT,
  role group_member_role,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.name,
    g.description,
    g.avatar_url,
    g.stream_channel_id,
    COUNT(gm2.user_id) as member_count,
    gm.role,
    gm.joined_at
  FROM public.groups g
  JOIN public.group_members gm ON g.id = gm.group_id
  LEFT JOIN public.group_members gm2 ON g.id = gm2.group_id AND gm2.status = 'active'
  WHERE gm.user_id = user_uuid AND gm.status = 'active' AND g.is_active = true
  GROUP BY g.id, g.name, g.description, g.avatar_url, g.stream_channel_id, gm.role, gm.joined_at
  ORDER BY gm.joined_at DESC;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Users can view groups they are members of" ON public.groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = groups.id
      AND gm.user_id = auth.uid()
      AND gm.status = 'active'
    )
  );

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update their groups" ON public.groups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = groups.id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
      AND gm.status = 'active'
    )
  );

-- Group members policies
CREATE POLICY "Users can view members of groups they belong to" ON public.group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.status = 'active'
    )
  );

CREATE POLICY "Group admins can manage members" ON public.group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'admin'
      AND gm.status = 'active'
    )
  );

CREATE POLICY "Users can join groups they're invited to" ON public.group_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND status = 'active'
  );