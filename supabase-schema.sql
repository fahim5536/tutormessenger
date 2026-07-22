-- Run this script in your Supabase SQL Editor

-- Users/Profiles Table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  role text CHECK (role IN ('student', 'tutor', 'admin')),
  bio text,
  subjects text[],
  hourly_rate numeric,
  avatar_url text,
  theme text DEFAULT 'light',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Messages Table
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  text text,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id text,
  class_id text,
  attachments jsonb,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_read boolean DEFAULT false
);

-- Turn on Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Messages Policies
CREATE POLICY "Users can view messages they sent or received."
  ON public.messages FOR SELECT
  USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );

CREATE POLICY "Users can insert their own messages."
  ON public.messages FOR INSERT
  WITH CHECK ( auth.uid() = sender_id );

-- Enable realtime on messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
