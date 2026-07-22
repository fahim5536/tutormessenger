-- Supabase SQL Schema for Messaging App

-- Users Table (Profiles)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name text,
  last_name text,
  role text DEFAULT 'student',
  student_id text,
  avatar_url text,
  email text,
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Groups Table
CREATE TABLE public.groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  subject text,
  level text,
  description text,
  invite_code text UNIQUE,
  logo_url text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Group Members Table
CREATE TABLE public.group_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member', -- owner, teacher, student, member
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Conversations Table (Direct Messages)
CREATE TABLE public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Messages Table
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  attachments jsonb,
  created_at timestamptz DEFAULT now(),
  CHECK (
    (conversation_id IS NOT NULL AND group_id IS NULL) OR
    (conversation_id IS NULL AND group_id IS NOT NULL)
  )
);

-- Blocked Users
CREATE TABLE public.blocked_users (
  blocker_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Muted Chats
CREATE TABLE public.muted_chats (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  chat_id text NOT NULL, -- Either conversation_id or group_id
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, chat_id)
);

-- Hidden/Deleted Chats
CREATE TABLE public.hidden_chats (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  chat_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, chat_id)
);

-- RLS POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groups viewable by members" ON public.groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid())
);
CREATE POLICY "Authenticated users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group owners can update group" ON public.groups FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid() AND role IN ('owner', 'teacher'))
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members viewable by group members" ON public.group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
);
CREATE POLICY "Owners/Teachers can manage members" ON public.group_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.role IN ('owner', 'teacher'))
);
CREATE POLICY "Users can join via invite" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read group messages if member" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = messages.group_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND (user1_id = auth.uid() OR user2_id = auth.uid()))
);
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- Storage Policies for attachments bucket

-- Create attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true) 
ON CONFLICT (id) DO NOTHING;


CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'attachments' );

CREATE POLICY "Users can upload their own avatars or group logos."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'attachments' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can update their own uploads."
  ON storage.objects FOR UPDATE
  USING ( auth.uid() = owner_id )
  WITH CHECK ( bucket_id = 'attachments' );

CREATE POLICY "Users can delete their own uploads."
  ON storage.objects FOR DELETE
  USING ( auth.uid() = owner_id AND bucket_id = 'attachments' );
