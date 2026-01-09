import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function clearTransactions() {
    const { error } = await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error("Error clearing logs:", error);
    return !error;
}
