import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BackupRequest {
  format?: 'json' | 'csv';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/auth/v1/user`,
      { headers: { Authorization: authHeader } }
    ).then(r => r.json()).catch(() => ({ data: {}, error: 'Auth failed' }))

    if (authError || !user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = user.id
    const body: BackupRequest = req.method === 'POST' ? await req.json() : {}
    const format = body.format || 'json'

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const response = await fetch(`${supabaseUrl}/rest/v1/memories?user_id=eq.${userId}&order=created_at.desc`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch memories')
    }

    const memories = await response.json()

    const timestamp = new Date().toISOString().split('T')[0]
    let backupData: string
    let contentType: string
    let filename: string

    if (format === 'csv') {
      contentType = 'text/csv'
      filename = `anchor-memories-${timestamp}.csv`
      backupData = convertToCSV(memories)
    } else {
      contentType = 'application/json'
      filename = `anchor-memories-${timestamp}.json`
      backupData = JSON.stringify(
        {
          backup_date: new Date().toISOString(),
          total_memories: memories.length,
          memories,
        },
        null,
        2
      )
    }

    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/memories?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ backed_up_at: new Date().toISOString() }),
    })

    return new Response(backupData, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Backup error:', error)
    return new Response(JSON.stringify({ error: 'Backup failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
});

function convertToCSV(memories: any[]): string {
  const headers = ['Title', 'Description', 'Feelings', 'Dates', 'Created', 'Backed Up']
  const rows = memories.map(m => [
    escapeCSV(m.title),
    escapeCSV(m.description || ''),
    escapeCSV((m.feelings || []).join(', ')),
    escapeCSV((m.special_dates || []).join(', ')),
    m.created_at ? new Date(m.created_at).toLocaleDateString() : '',
    m.backed_up_at ? new Date(m.backed_up_at).toLocaleDateString() : '',
  ])

  return [
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n')
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
