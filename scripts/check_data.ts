import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/integrations/supabase/types';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking data...');

    const { data: children } = await supabase.from('children').select('*');
    console.log('Children:', children?.length);
    if (children && children.length > 0) {
        console.log('First Child ID:', children[0].id);

        const { data: apps } = await supabase
            .from('app_controls' as any)
            .select('*')
            .eq('child_id', children[0].id);
        console.log('Apps for first child:', apps?.length);
        console.log('App names:', apps?.map((a: any) => a.app_name));
    }
}

checkData();
