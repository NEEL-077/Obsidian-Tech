require('dotenv').config();
const supabase = require('./config/supabase');

async function test() {
    const { data, error } = await supabase.from('products').insert([{
        name: 'Test Product',
        ram: '8GB'
    }]).select();
    
    if (error) {
        console.error("Insert Error:", error);
    } else {
        console.log("Insert Success:", data);
    }
}

test();

test();
