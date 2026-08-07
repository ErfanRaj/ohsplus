import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

export async function fetchComments(resourceType: 'article' | 'product', resourceSlug: string) {
  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('id, full_name, body, created_at, moderated, user_id')
    .eq('resource_type', resourceType)
    .eq('resource_slug', resourceSlug)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createComment(resourceType: 'article' | 'product', resourceSlug: string, userId: string, fullName: string, body: string) {
  // Basic server-side sanitization/validation
  const sanitizedBody = body.trim().slice(0, 2000);
  if (!sanitizedBody) throw new Error('Empty comment');
  const { data, error } = await supabaseAdmin.from('comments').insert([
    {
      resource_type: resourceType,
      resource_slug: resourceSlug,
      user_id: userId,
      full_name: fullName.slice(0, 100),
      body: sanitizedBody,
      moderated: false,
    },
  ]);
  if (error) throw error;
  return data;
}
