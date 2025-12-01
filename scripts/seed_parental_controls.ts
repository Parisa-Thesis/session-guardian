import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/integrations/supabase/types';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'YOUR_SUPABASE_KEY';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Starting seed...');

    // 1. Get the first user (parent)
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !users || users.length === 0) {
        console.error('No users found. Please sign up first.');
        return;
    }
    const parentId = users[0].id;
    console.log('Using parent ID:', parentId);

    // 2. Get or Create Child
    let { data: children } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentId);

    let childId;
    if (!children || children.length === 0) {
        console.log('Creating child profile...');
        const { data: newChild, error: childError } = await supabase
            .from('children')
            .insert({
                name: 'Pari',
                parent_id: parentId,
                age_group: '6-8',
                anonymous_id: 'child_' + Math.random().toString(36).substr(2, 9)
            })
            .select()
            .single();

        if (childError) {
            console.error('Error creating child:', childError);
            return;
        }
        childId = newChild.id;
    } else {
        childId = children[0].id;
        console.log('Using existing child:', children[0].name);
    }

    // 3. Set Parental Controls (Daily Limit)
    console.log('Setting daily limit...');
    await supabase
        .from('parental_controls')
        .upsert({
            child_id: childId,
            daily_time_limit_minutes: 180, // 3 hours
            enabled: true,
            bedtime_start: '20:00',
            bedtime_end: '07:00'
        });

    // 4. Create App Controls
    console.log('Creating app controls...');
    const apps = [
        { app_name: 'Minecraft', app_category: 'games', daily_limit_minutes: 60, is_blocked: false },
        { app_name: 'Roblox', app_category: 'games', daily_limit_minutes: 30, is_blocked: false },
        { app_name: 'YouTube', app_category: 'social', daily_limit_minutes: 60, is_blocked: false },
        { app_name: 'TikTok', app_category: 'social', daily_limit_minutes: 0, is_blocked: true },
        { app_name: 'Khan Academy', app_category: 'educational', daily_limit_minutes: null, is_unlimited: true },
        { app_name: 'Duolingo', app_category: 'educational', daily_limit_minutes: null, is_unlimited: true }
    ];

    for (const app of apps) {
        await supabase
            .from('app_controls' as any)
            .upsert({
                child_id: childId,
                ...app
            }, { onConflict: 'child_id,app_name' });
    }

    // 5. Create Schedules
    console.log('Creating schedules...');
    await supabase
        .from('schedules' as any)
        .delete()
        .eq('child_id', childId);

    await supabase
        .from('schedules' as any)
        .insert([
            {
                child_id: childId,
                name: 'Bedtime',
                schedule_type: 'bedtime',
                start_time: '20:00',
                end_time: '07:00',
                days_of_week: [1, 2, 3, 4, 5, 6, 7],
                is_active: true
            },
            {
                child_id: childId,
                name: 'School Time',
                schedule_type: 'school',
                start_time: '08:00',
                end_time: '15:00',
                days_of_week: [1, 2, 3, 4, 5],
                allowed_apps: ['Khan Academy', 'Duolingo'],
                is_active: true
            }
        ]);

    // 6. Create Activity Timeline (Fake Data for Today)
    console.log('Creating activity timeline...');
    const today = new Date();
    const activities = [
        { app_name: 'YouTube', app_category: 'social', start_hour: 15, duration: 45 },
        { app_name: 'Minecraft', app_category: 'games', start_hour: 16, duration: 60 },
        { app_name: 'Khan Academy', app_category: 'educational', start_hour: 18, duration: 30 }
    ];

    await supabase
        .from('activity_timeline' as any)
        .delete()
        .eq('child_id', childId);

    for (const activity of activities) {
        const startTime = new Date(today);
        startTime.setHours(activity.start_hour, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setMinutes(activity.duration);

        await supabase
            .from('activity_timeline' as any)
            .insert({
                child_id: childId,
                app_name: activity.app_name,
                app_category: activity.app_category,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                duration_minutes: activity.duration
            });
    }

    // Set current activity (Active Now)
    await supabase
        .from('activity_timeline' as any)
        .insert({
            child_id: childId,
            app_name: 'YouTube',
            app_category: 'social',
            start_time: new Date().toISOString(),
            duration_minutes: 0 // Ongoing
        });

    console.log('Seed completed successfully! Refresh the dashboard.');
}

seed().catch(console.error);
