require('dotenv').config();
const supabase = require('./config/supabase');

const products = [
    // === HERO PRODUCTS ===
    {
        name: 'iPhone 17 Pro Max',
        brand: 'Apple',
        category: 'phones',
        series: 'iPhone 17',
        price: 159900,
        original_price: 169900,
        description: 'Hello, Apple Intelligence. Forged in titanium and featuring the all-new A19 Pro chip, iPhone 17 Pro Max is the ultimate smartphone for photography and gaming.',
        image_url: '/images/heroes/i17pm.png',
        base_storage: '256GB',
        ram: '8GB',
        count_in_stock: 50,
        rating: 4.9,
        num_reviews: 124,
    },
    {
        name: 'Galaxy S26 Ultra',
        brand: 'Samsung',
        category: 'phones',
        series: 'Galaxy S',
        price: 129999,
        original_price: 139999,
        description: 'Galaxy AI is here. Unleash your creativity, productivity and possibility with the Galaxy S26 Ultra featuring the built-in S Pen.',
        image_url: '/images/heroes/sm26ultra.png',
        base_storage: '256GB',
        ram: '12GB',
        count_in_stock: 35,
        rating: 4.8,
        num_reviews: 89,
    },
    {
        name: 'Pixel 10 Fold',
        brand: 'Google',
        category: 'phones',
        series: 'Pixel',
        price: 174999,
        original_price: 184999,
        description: 'The magic of Gemini on a massive folding screen. Multitask like a pro with the thinnest foldable from Google.',
        image_url: '/images/products/pixel9.png', // Fallback to pixel image if fold isn't there
        base_storage: '256GB',
        ram: '16GB',
        count_in_stock: 15,
        rating: 4.7,
        num_reviews: 42,
    },
    
    // === SMARTPHONES ===
    {
        name: 'iPhone 16 Pro',
        brand: 'Apple',
        category: 'phones',
        series: 'iPhone 16',
        price: 119900,
        original_price: 129900,
        description: 'Titanium. So strong. So light. So Pro. The iPhone 16 Pro delivers a huge leap in battery life and camera capabilities.',
        image_url: '/images/products/iphone16pro.png',
        base_storage: '128GB',
        ram: '8GB',
        count_in_stock: 100,
        rating: 4.8,
        num_reviews: 215,
    },
    {
        name: 'OnePlus 13 Pro',
        brand: 'OnePlus',
        category: 'phones',
        series: 'Number Series',
        price: 69999,
        original_price: 74999,
        description: 'Hasselblad Camera for Mobile. Smooth Beyond Belief. Experience the fastest charging on the market.',
        image_url: '/images/products/oneplus12.png',
        base_storage: '256GB',
        ram: '12GB',
        count_in_stock: 45,
        rating: 4.6,
        num_reviews: 78,
    },
    {
        name: 'OnePlus 15',
        brand: 'OnePlus',
        category: 'phones',
        series: 'Number Series',
        price: 79999,
        original_price: 84999,
        description: 'Smooth beyond belief. A masterpiece of performance and elegance.',
        image_url: '/images/heroes/op15.png',
        base_storage: '256GB',
        ram: '16GB',
        count_in_stock: 40,
        rating: 4.8,
        num_reviews: 95,
    },
    {
        name: 'Xiaomi 17 Ultra',
        brand: 'Xiaomi',
        category: 'phones',
        series: 'Xiaomi Ultra',
        price: 99999,
        original_price: 109999,
        description: 'Photography redefined. Engineered with Leica optics for studio-grade image quality.',
        image_url: '/images/heroes/x17u.png',
        base_storage: '512GB',
        ram: '16GB',
        count_in_stock: 20,
        rating: 4.9,
        num_reviews: 60,
    },

    // === TABLETS ===
    {
        name: 'iPad Pro 13-inch (M4)',
        brand: 'Apple',
        category: 'tablets',
        series: 'iPad Pro',
        price: 129900,
        original_price: 134900,
        description: 'The ultimate iPad experience with the most advanced display, the M4 chip, and breakthrough Apple Pencil features.',
        image_url: '/images/products/ipadpro.png',
        base_storage: '256GB',
        ram: '8GB',
        count_in_stock: 30,
        rating: 4.9,
        num_reviews: 150,
    },
    {
        name: 'Galaxy Tab S10 Ultra',
        brand: 'Samsung',
        category: 'tablets',
        series: 'Galaxy Tab',
        price: 108999,
        original_price: 119999,
        description: 'The new standard of premium tablets. Featuring a massive 14.6-inch Dynamic AMOLED 2X display.',
        image_url: '/images/products/tabs9.png',
        base_storage: '256GB',
        ram: '12GB',
        count_in_stock: 25,
        rating: 4.7,
        num_reviews: 65,
    },

    // === LAPTOPS ===
    {
        name: 'MacBook Pro 16-inch (M3 Max)',
        brand: 'Apple',
        category: 'laptops',
        series: 'MacBook Pro',
        price: 319900,
        original_price: 349900,
        description: 'Mind-blowing head-turning performance. The M3 Max chip brings massive power to the most demanding workflows.',
        image_url: '/images/products/macbookpro.png',
        base_storage: '1TB',
        ram: '36GB',
        count_in_stock: 10,
        rating: 5.0,
        num_reviews: 45,
    },
    
    // === WATCHES ===
    {
        name: 'Apple Watch Ultra 2',
        brand: 'Apple',
        category: 'watches',
        series: 'Watch Ultra',
        price: 89900,
        original_price: 94900,
        description: 'Next-level adventure. The most rugged and capable Apple Watch pushes the limits again.',
        image_url: '/images/products/applewatchultra.png',
        base_storage: '64GB',
        ram: 'N/A',
        count_in_stock: 60,
        rating: 4.8,
        num_reviews: 180,
    },
    
    // === EARPIECES ===
    {
        name: 'AirPods Pro (2nd generation)',
        brand: 'Apple',
        category: 'earpiece',
        series: 'AirPods',
        price: 24900,
        original_price: 26900,
        description: 'Up to 2x more Active Noise Cancellation. Personalized Spatial Audio. Magic like you’ve never heard.',
        image_url: '/images/products/airpodspro.png',
        base_storage: 'N/A',
        ram: 'N/A',
        count_in_stock: 200,
        rating: 4.9,
        num_reviews: 450,
    }
];

async function seedDatabase() {
    console.log('🌱 Starting database seed...');
    
    // Clear existing products
    console.log('Clearing existing products...');
    const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
        console.error('⚠️ Could not clear existing products:', deleteError.message);
    } else {
        console.log('✅ Cleared existing products.');
    }
    
    let inserted = 0;
    
    for (const product of products) {
        console.log(`Inserting ${product.name}...`);
        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select();
            
        if (error) {
            console.error(`❌ Error inserting ${product.name}:`, error.message);
        } else {
            console.log(`✅ Successfully inserted ${product.name} (ID: ${data[0].id})`);
            inserted++;
        }
    }
    
    console.log(`\n🎉 Seed complete! Inserted ${inserted}/${products.length} products.`);
    process.exit(0);
}

seedDatabase();
