-- ==========================================
-- Obsidian Tech - Supabase Seed Dataset
-- ==========================================

-- Seed Products
INSERT INTO public.products (id, name, brand, category, description, price, count_in_stock, image_url, rating, num_reviews) VALUES
('b82a3b04-a90b-48c9-8d7b-99d985db6e01', 'iPhone 15 Pro Max', 'Apple', 'Smartphones', 'The latest iPhone 15 Pro Max with titanium design, A17 Pro chip, and a more advanced 48MP Main camera system.', 1199.00, 50, '/images/apple-iphone-15-pro-max.jpg', 4.8, 120),
('b82a3b04-a90b-48c9-8d7b-99d985db6e02', 'Samsung Galaxy S24 Ultra', 'Samsung', 'Smartphones', 'Galaxy AI is here. Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity.', 1299.00, 30, '/images/samsung-galaxy-s24-ultra.jpg', 4.7, 95),
('b82a3b04-a90b-48c9-8d7b-99d985db6e03', 'Google Pixel 8 Pro', 'Google', 'Smartphones', 'The new Google Pixel 8 Pro features the Tensor G3 chip and the best Pixel camera yet, bringing AI features to your fingertips.', 999.00, 40, '/images/google-pixel-8-pro.jpg', 4.6, 80),
('b82a3b04-a90b-48c9-8d7b-99d985db6e04', 'OnePlus 12', 'OnePlus', 'Smartphones', 'Powered by Snapdragon 8 Gen 3, the OnePlus 12 delivers uncompromised performance and an ultra-fast charging experience.', 799.00, 20, '/images/oneplus-12.jpg', 4.5, 60),
('b82a3b04-a90b-48c9-8d7b-99d985db6e05', 'Xiaomi 14 Pro', 'Xiaomi', 'Smartphones', 'Experience photography like never before with the Leica co-engineered camera system on the Xiaomi 14 Pro.', 899.00, 15, '/images/xiaomi-14-pro.jpg', 4.4, 45),
('b82a3b04-a90b-48c9-8d7b-99d985db6e06', 'Motorola Edge 50 Pro', 'Motorola', 'Smartphones', 'Stunning design meets peak performance. AI-powered cameras and superfast charging make the Edge 50 Pro a top contender.', 699.00, 25, '/images/motorola-edge-50-pro.jpg', 4.3, 35),
('b82a3b04-a90b-48c9-8d7b-99d985db6e07', 'Realme GT 5 Pro', 'Realme', 'Smartphones', 'Unleash the speed with the new Realme GT 5 Pro. Featuring top-tier performance and ultra-fast charging.', 599.00, 45, '/images/realme-gt5-pro.jpg', 4.4, 40),
('b82a3b04-a90b-48c9-8d7b-99d985db6e08', 'Vivo X100 Pro', 'Vivo', 'Smartphones', 'Professional grade photography in your pocket with ZEISS optics on the Vivo X100 Pro.', 899.00, 15, '/images/vivo-x100-pro.jpg', 4.7, 55),
('b82a3b04-a90b-48c9-8d7b-99d985db6e09', 'OPPO Find X7 Ultra', 'OPPO', 'Smartphones', 'Experience the ultimate flagship with dual-periscope cameras and a stunning Hasselblad collaboration.', 999.00, 20, '/images/oppo-find-x7.jpg', 4.6, 65),
('b82a3b04-a90b-48c9-8d7b-99d985db6e10', 'Nothing Phone (2a)', 'Nothing', 'Smartphones', 'Iconic transparent design meets everyday performance with the Glyph Interface and Nothing OS.', 349.00, 60, '/images/nothing-phone-2a.jpg', 4.5, 85);
