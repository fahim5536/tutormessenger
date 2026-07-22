// Example Frontend Functions for Supabase Messaging Features
import { supabase } from './lib/supabase';

// 1. Create a group
export const createGroup = async (name: string, subject: string, description: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not logged in");

  // Create group
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert([{ name, subject, description, created_by: user.user.id }])
    .select()
    .single();
  
  if (groupError) throw groupError;

  // Add creator as owner
  await supabase
    .from('group_members')
    .insert([{ group_id: group.id, user_id: user.user.id, role: 'owner' }]);

  return group;
};

// 2. Add member (by owner/teacher)
export const addMember = async (groupId: string, userId: string, role: string = 'member') => {
  const { data, error } = await supabase
    .from('group_members')
    .insert([{ group_id: groupId, user_id: userId, role }]);
  
  if (error) throw error;
  return data;
};

// 3. Remove member
export const removeMember = async (groupId: string, userId: string) => {
  const { data, error } = await supabase
    .from('group_members')
    .delete()
    .match({ group_id: groupId, user_id: userId });
  
  if (error) throw error;
  return data;
};

// 4. Upload group logo
export const uploadGroupLogo = async (groupId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `group_${groupId}_${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(fileName, file);
    
  if (uploadError) throw uploadError;
  
  const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(fileName);
  
  // Update group record
  const { data, error } = await supabase
    .from('groups')
    .update({ logo_url: urlData.publicUrl })
    .eq('id', groupId)
    .select();
    
  if (error) throw error;
  return data;
};

// 5. Block User
export const blockUser = async (userIdToBlock: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not logged in");

  const { data, error } = await supabase
    .from('blocked_users')
    .insert([{ blocker_id: user.user.id, blocked_id: userIdToBlock }]);
    
  if (error) throw error;
  return data;
};

// 6. Mute Chat
export const muteChat = async (chatId: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not logged in");

  const { data, error } = await supabase
    .from('muted_chats')
    .insert([{ user_id: user.user.id, chat_id: chatId }]);
    
  if (error) throw error;
  return data;
};

// 7. Delete chat from list (Hide)
export const hideChat = async (chatId: string) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not logged in");

  const { data, error } = await supabase
    .from('hidden_chats')
    .insert([{ user_id: user.user.id, chat_id: chatId }]);
    
  if (error) throw error;
  return data;
};

// 8. Search Chats
export const searchChats = async (query: string) => {
  // Search groups
  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .ilike('name', `%${query}%`);
    
  // Search direct messages (by user names)
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`);
    
  return { groups, users };
};

