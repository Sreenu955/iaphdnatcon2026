// src/services/supabaseClient.js

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Helper to make secure REST API requests to Supabase PostgREST endpoints
async function supabaseFetch(table, options = {}) {
  const method = options.method || 'GET';
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${localStorage.getItem('supabase_token') || SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  
  // Handle filters & sorting
  const queryParams = [];
  if (options.select) queryParams.push(`select=${options.select}`);
  if (options.order) queryParams.push(`order=${options.order}`);
  if (options.eq) {
    Object.entries(options.eq).forEach(([k, v]) => {
      queryParams.push(`${k}=eq.${v}`);
    });
  }

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`;
  }

  const fetchOptions = {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  };

  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Supabase API request failed.');
  }

  return await response.json();
}

export const supabase = {
  // Read records from a table
  from: (table) => ({
    select: async (fields = '*') => {
      return await supabaseFetch(table, { method: 'GET', select: fields });
    },
    eq: (column, value) => ({
      select: async (fields = '*') => {
        const query = { [column]: value };
        return await supabaseFetch(table, { method: 'GET', select: fields, eq: query });
      }
    }),
    insert: async (data) => {
      return await supabaseFetch(table, { method: 'POST', body: data });
    },
    update: (column, value) => ({
      eq: async (matchColumn, matchValue) => {
        const query = { [matchColumn]: matchValue };
        const body = { [column]: value };
        return await supabaseFetch(table, { method: 'PATCH', body, eq: query });
      }
    }),
    upsert: async (data) => {
      const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${localStorage.getItem('supabase_token') || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      };
      const url = `${SUPABASE_URL}/rest/v1/${table}`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      return response.ok;
    }
  }),
  
  // Simple Authentication using Supabase Auth endpoints
  auth: {
    signIn: async (email, password) => {
      const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error_description || 'Invalid login credentials.');
      }

      const session = await response.json();
      localStorage.setItem('supabase_token', session.access_token);
      return session.user;
    },
    signOut: () => {
      localStorage.removeItem('supabase_token');
    }
  }
};

