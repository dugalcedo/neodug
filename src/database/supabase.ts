import dotenv from 'dotenv'; dotenv.config()

import { createClient } from '@supabase/supabase-js'
import { DatabaseConnectionError } from '../util/util.js';

if (
    !process.env.SUPABASE_URL
    || !process.env.SUPABASE_API_KEY
) throw new DatabaseConnectionError("Missing supabase environment variables.")

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY)

export const testSupabaseConnection = async () => {
    const { data, error } = await supabase
        .from('comment')
        .select('*')
        .limit(1)

    if (error !== null) {
        console.log(`Error connecting to supabase`)
        console.log(error)
    }

    return error != null
}