-- V3__seed_gaming_catalog.sql - Rich seed data for gaming gear catalog

-- Seed Seller & Sample Buyers if not present
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, created_at)
VALUES 
(1, 'System Administrator', 'admin@abimart.com', '$2a$10$q2xN8/2C1L0.8hW8N.R8uuN0jJgM8Z3P8R1K6L4M2N0P8R1K6L4M2', 'ADMIN', '2026-07-27 10:00:00'),
(2, 'Abi Gaming Gear (Official Seller)', 'seller@abimart.com', '$2a$10$q2xN8/2C1L0.8hW8N.R8uuN0jJgM8Z3P8R1K6L4M2N0P8R1K6L4M2', 'SELLER', '2026-07-28 11:30:00'),
(3, 'Alex Mercer (Esports Buyer)', 'buyer@abimart.com', '$2a$10$q2xN8/2C1L0.8hW8N.R8uuN0jJgM8Z3P8R1K6L4M2N0P8R1K6L4M2', 'BUYER', '2026-07-29 14:15:00');

-- Seed 18 Gaming Accessories Products
INSERT OR REPLACE INTO products (id, seller_id, name, brand, category, price_cents, stock_qty, badge, rating, reviews_count, image_url, description, specs_json, created_at)
VALUES
(1, 2, 'Wooting 60HE+ Analog Rapid Trigger Gaming Keyboard', 'Wooting', 'Keyboards', 1899900, 24, 'ESPORTS PRO', 4.9, 312, 
'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80',
'The undisputed competitive standard in FPS gaming. Featuring Lekker Hall Effect switches with adjustable actuation from 0.1mm to 4.0mm and True Rapid Trigger technology for instantaneous stutter-stepping.',
'{"Switches": "Lekker Hall Effect Magnetic", "Actuation": "0.1mm to 4.0mm Adjustable", "Polling Rate": "8000 Hz", "Rapid Trigger": "Continuous sub-0.1mm reset", "Keycaps": "Double-shot PBT Cherry Profile", "Connection": "Detachable Braided USB-C"}',
'2026-07-30 08:00:00'),

(2, 2, 'Razer Huntsman V3 Pro TKL Analog Optical Keyboard', 'Razer', 'Keyboards', 2149900, 18, 'TOURNAMENT READY', 4.8, 188,
'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
'Elevate your execution with Gen-2 Analog Optical Switches. Features onboard LED array for rapid actuation profile switching without needing software during tournaments.',
'{"Switches": "Razer Gen-2 Analog Optical", "Actuation Range": "0.1mm - 4.0mm", "Polling Rate": "1000 Hz", "Top Plate": "Brushed 5052 Aluminum", "Wrist Rest": "Magnetic Leatherette", "RGB": "Razer Chroma 16.8M RGB"}',
'2026-07-30 08:30:00'),

(3, 2, 'Logitech G PRO X TKL LIGHTSPEED Wireless RGB Keyboard', 'Logitech G', 'Keyboards', 1649900, 35, 'CHROMA RGB', 4.7, 145,
'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1000&q=80',
'Engineered with champion esports athletes. Delivers tournament-tested LIGHTSPEED wireless reliability, customizable game mode, and dual-shot PBT keycaps.',
'{"Switches": "GX Brown Tactile", "Wireless": "LIGHTSPEED 1ms + Bluetooth", "Battery Life": "Up to 50 hours RGB On", "Layout": "Tenkeyless (TKL)", "Keycaps": "Dual-shot PBT", "Media Controls": "Dedicated Volume Roller"}',
'2026-07-30 09:00:00'),

(4, 2, 'Corsair K70 MAX RGB Magnetic-Mechanical Gaming Keyboard', 'Corsair', 'Keyboards', 1999900, 12, 'PREMIUM BUILD', 4.8, 96,
'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80',
'Equipped with revolutionary CORSAIR MGX magnetic switches allowing dual-point actuation for combo chaining in MMORPGs and competitive titles.',
'{"Switches": "CORSAIR MGX Magnetic Hall Effect", "Hyper-Processing": "AXON 8000Hz Hyper-Polling", "Damping": "Dual-layer Sound Absorbing Foam", "Keycaps": "1.5mm Precision PBT Double-shot", "Memory": "8MB Onboard Storage (50 profiles)"}',
'2026-07-30 09:30:00'),

(5, 2, 'Logitech G PRO X SUPERLIGHT 2 Wireless Gaming Mouse', 'Logitech G', 'Mice', 1499900, 42, 'BESTSELLER', 4.9, 540,
'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
'The next evolution of the world''s dominant esports mouse. Weighing just 60 grams with the groundbreaking HERO 2 sensor offering up to 32,000 DPI and LIGHTFORCE hybrid switches.',
'{"Weight": "60 grams", "Sensor": "HERO 2 Optical (32,000 DPI, 500 IPS)", "Switches": "LIGHTFORCE Optical-Mechanical Hybrid", "Polling Rate": "4000 Hz Wireless (8000 Hz wired)", "Battery Life": "95 hours constant motion", "Feet": "Zero-additive PTFE"}',
'2026-07-30 10:00:00'),

(6, 2, 'Razer DeathAdder V3 Pro Ultra-Lightweight Wireless Mouse', 'Razer', 'Mice', 1399900, 29, 'ESPORTS CHOICE', 4.8, 410,
'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80',
'Refined ergonomic shape engineered with top pro gamers. Weighing 63 grams, featuring Focus Pro 30K Optical Sensor and Gen-3 Optical switches rated for 90M clicks.',
'{"Weight": "63 grams", "Sensor": "Focus Pro 30K Optical Sensor (30,000 DPI)", "Switches": "Gen-3 Optical (90M Clicks)", "Battery Life": "Up to 90 hours", "Max Acceleration": "70 G", "Max Speed": "750 IPS"}',
'2026-07-30 10:30:00'),

(7, 2, 'Finalmouse UltralightX Guardian Carbon-Fiber Mouse', 'Finalmouse', 'Mice', 2499900, 8, 'FLAGSHIP EXTREME', 4.9, 115,
'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=1000&q=80',
'Ultra-aerospace carbon fiber composite chassis delivering an astonishing 31 gram weight with true 8000Hz polling rate for instantaneous aim tracking.',
'{"Weight": "31 grams (Cheetah Medium)", "Chassis Material": "Carbon Fiber Composite Shell", "Sensor": "Tournament Custom 8000Hz", "Polling Rate": "True 8000 Hz Wireless", "Battery": "High Energy Density Lithium (2 months typical)"}',
'2026-07-30 11:00:00'),

(8, 2, 'SteelSeries Aerox 5 Wireless Multi-Genre Gaming Mouse', 'SteelSeries', 'Mice', 1149900, 22, 'WATER RESISTANT', 4.7, 85,
'https://images.unsplash.com/photo-1563297007-0686b7003af7?auto=format&fit=crop&w=1000&q=80',
'Ultra-light 74g honeycomb ergonomic mouse with 9 programmable buttons and AquaBarrier IP54 dust and water resistance for intense Battle Royale and MOBA matches.',
'{"Weight": "74 grams", "Buttons": "9 Programmable Macro Buttons", "Water Resistance": "AquaBarrier IP54 Rated", "Sensor": "TrueMove Air (18,000 CPI)", "Battery Life": "Up to 180 hours with fast charge"}',
'2026-07-30 11:30:00'),

(9, 2, 'SteelSeries Arctis Nova Pro Wireless Hi-Res Gaming Headset', 'SteelSeries', 'Audio', 2999900, 15, 'AUDIOPHILE PRO', 4.9, 240,
'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
'Almighty Audio featuring Premium Hi-Res drivers, Active Noise Cancellation, multi-system OLED wireless base station, and dual-battery hot-swap system for infinite gaming uptime.',
'{"Acoustics": "High Fidelity Neodymium Magnetic Drivers (10-40,000 Hz)", "ANC": "4-mic Hybrid Active Noise Cancellation with Transparency", "Battery": "Infinity Power System (2 hot-swappable batteries, 44h total)", "Connectivity": "Simultaneous 2.4GHz + Bluetooth 5.0", "Base Station": "OLED Dual USB Multi-System Hub"}',
'2026-07-30 12:00:00'),

(10, 2, 'HyperX Cloud III Wireless Spatial Audio Gaming Headset', 'HyperX', 'Audio', 1449900, 38, 'LEGENDARY COMFORT', 4.8, 380,
'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
'The legendary comfort of HyperX memory foam plush headband paired with an incredible 120-hour wireless battery life and tuned 53mm angled audio drivers.',
'{"Battery Life": "Up to 120 Hours single charge", "Drivers": "53mm Re-engineered Angled Neodymium", "Spatial Audio": "DTS Headphone:X Spatial Audio Lifetime activation", "Microphone": "Ultra-clear 10mm Noise-Cancelling with Internal Mesh Filter", "Frame": "Durable All-Metal Steel & Aluminum"}',
'2026-07-30 12:30:00'),

(11, 2, 'Razer BlackShark V2 Pro (2024 Edition) Esports Headset', 'Razer', 'Audio', 1799900, 20, 'PRO TUNED', 4.8, 195,
'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80',
'Equipped with the Razer HyperClear Super Wideband 32kHz microphone capturing broadcast-quality vocal detail, TriForce Titanium 50mm drivers, and pro esports tuning profiles.',
'{"Microphone": "Razer HyperClear Super Wideband Mic (32kHz sampling)", "Drivers": "TriForce Titanium 50mm Patented Acoustic Chamber", "Battery": "Up to 70 hours with Type-C Quick Charge", "Isolation": "Ultra-soft Breathable FlowKnit Memory Foam Cushions"}',
'2026-07-30 13:00:00'),

(12, 2, 'ASUS ROG Swift OLED PG27AQDM 27" 240Hz 0.03ms Monitor', 'ASUS ROG', 'Monitors', 7999900, 7, 'OLED PERFECTION', 4.9, 160,
'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
'27-inch 1440p OLED gaming panel with blazing 240Hz refresh rate, instantaneous 0.03ms response time, custom heatsink thermal design, and 99% DCI-P3 cinematic color depth.',
'{"Panel Size": "26.5-inch QHD (2560 x 1440) OLED", "Refresh Rate": "240 Hz Native", "Response Time": "0.03ms (GTG)", "Color Gamut": "99% DCI-P3, 135% sRGB, Delta E < 2", "Peak Brightness": "1,000 nits (3% APL HDR)", "Sync": "G-SYNC Compatible & AMD FreeSync Premium"}',
'2026-07-30 13:30:00'),

(13, 2, 'BenQ ZOWIE XL2566K 24.5" 360Hz Fast TN Esports Monitor', 'BenQ ZOWIE', 'Monitors', 5999900, 11, 'CS2/VALORANT KING', 4.8, 220,
'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80',
'The undisputed weapon of choice at Counter-Strike and VALORANT majors. Features DyAc+ dynamic accuracy technology for unparalleled recoil spray tracking.',
'{"Panel Size": "24.5-inch Full HD (1920 x 1080) Fast TN", "Refresh Rate": "360 Hz Native", "Clarity Tech": "DyAc+ (Dynamic Accuracy Plus)", "Esports Features": "Black eQualizer, Color Vibrance, S-Switch Controller, Shielding Hoods"}',
'2026-07-30 14:00:00'),

(14, 2, 'Alienware 34" Curved QD-OLED 175Hz G-Sync Ultimate Display', 'Alienware', 'Monitors', 9499900, 5, 'ULTRAWIDE IMMERSION', 4.9, 130,
'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1000&q=80',
'Quantum Dot-OLED technology combining infinite contrast of OLED with vibrant quantum color brightness. 1800R curved ultra-wide 21:9 aspect ratio.',
'{"Screen Size": "34.18-inch WQHD (3440 x 1440) QD-OLED", "Curvature": "1800R Deep Immersion Curve", "Refresh Rate": "175 Hz (DisplayPort)", "Response Time": "0.1 ms GtG", "HDR": "VESA DisplayHDR TrueBlack 400", "Sync": "NVIDIA G-SYNC ULTIMATE Native Module"}',
'2026-07-30 14:30:00'),

(15, 2, 'Xbox Elite Wireless Controller Series 2 - Core White', 'Microsoft Xbox', 'Controllers', 1249900, 26, 'MODULAR PRO', 4.7, 340,
'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=1000&q=80',
'Pro-grade performance with adjustable tension thumbsticks, hair trigger locks, rubberized wrap-around grip, and up to 40 hours of rechargeable battery life.',
'{"Thumbsticks": "3 adjustable tension resistance levels", "Hair Trigger Locks": "3-stage physical switches", "Profiles": "3 custom onboard profiles + default", "Battery": "Internal rechargeable 40-hour battery", "Connectivity": "Xbox Wireless, Bluetooth, USB-C"}',
'2026-07-30 15:00:00'),

(16, 2, 'PlayStation DualSense Edge Wireless Pro Controller', 'Sony PlayStation', 'Controllers', 1899900, 14, 'REPLACEABLE MODULES', 4.8, 175,
'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80',
'Customizable controls, swappable stick caps and back buttons, fine-tuned stick sensitivity deadzones, and user-replaceable stick modules to eliminate stick drift forever.',
'{"Stick Modules": "User replaceable modular thumbsticks", "Back Buttons": "2 remappable back paddle styles (Half-dome & Lever)", "Trigger Stops": "Independent left & right travel sliders", "Haptics": "Dual Actuator Haptic Feedback & Adaptive Triggers", "Case": "Braided USB cable with lockable connector housing"}',
'2026-07-30 15:30:00'),

(17, 2, 'Elgato Stream Deck MK.2 15 LCD Keys Studio Controller', 'Elgato', 'Accessories', 1399900, 31, 'CREATOR ESSENTIAL', 4.9, 450,
'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1000&q=80',
'The iconic studio hub for streamers and content creators. 15 customizable LCD keys to trigger game overlays, mute mics, switch OBS scenes, and launch macros.',
'{"Keys": "15 Customizable Color LCD Keys", "Interface": "USB 2.0 with Detachable USB-C Cable", "Stand": "Desktop Stand with 45-degree angle", "Software": "Stream Deck App (Plugins for Twitch, OBS, Discord, Spotify)", "Dimensions": "118 x 84 x 25 mm"}',
'2026-07-30 16:00:00'),

(18, 2, 'AbiMart NeoGlow Dual RGB Smart Ambient Light Bars', 'AbiMart Gaming', 'Accessories', 449900, 50, 'SMART RGB', 4.8, 92,
'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80',
'Twin aerospace aluminum smart RGB light bars with real-time PC screen color synchronization, music audio spectrum beat-detection, and magnetic weighted bases.',
'{"LEDs": "64 Independent ARGB Zones per bar", "Colors": "16.8 Million Colors with dynamic ambient gradients", "Sync Mode": "Real-time PC Monitor Screen mirroring & Mic beat reactive", "Mounting": "Dual weighted metal desktop stands or monitor back clips", "Power": "5V 2A USB Powered"}',
'2026-07-30 16:30:00');

-- Seed Sample Customer Reviews
INSERT OR REPLACE INTO reviews (id, product_id, user_id, user_name, rating, comment, created_at)
VALUES
(1, 1, 3, 'Alex Mercer (Apex Predator)', 5, 'The rapid trigger on the Wooting 60HE+ completely changed my movement in Valorant. Counter-strafing is instantaneously responsive. Best gaming keyboard ever engineered.', '2026-08-01 14:20:00'),
(2, 5, 3, 'Alex Mercer (Apex Predator)', 5, 'The 60g weight and HERO 2 sensor on the Superlight 2 are pure perfection. Battery lasts two full weeks of scrims before needing a charge.', '2026-08-02 09:15:00'),
(3, 9, 3, 'Alex Mercer (Apex Predator)', 5, 'The hot-swappable batteries on the Arctis Nova Pro mean I literally never have to plug in a charging cable while streaming. Soundstage and footsteps in CS2 are unmatched.', '2026-08-03 18:40:00'),
(4, 12, 3, 'Alex Mercer (Apex Predator)', 5, 'The 240Hz OLED on the Asus ROG is mind-blowing. Zero ghosting and absolute true blacks. Worth every single rupee!', '2026-08-04 12:10:00');

-- Seed Sample Orders to show functional order lifecycle
INSERT OR REPLACE INTO orders (id, buyer_id, status, total_amount_cents, shipping_address_json, payment_method, tracking_number, created_at)
VALUES
(1, 3, 'DELIVERED', 3399800, '{"fullName": "Alex Mercer", "phone": "9876543210", "street": "42 Esports Cyber Arena, Gamer Row", "city": "Bengaluru", "state": "Karnataka", "pincode": "560001"}', 'CARD', 'ABM-TRACK-883921', '2026-08-02 10:00:00'),
(2, 3, 'SHIPPED', 1899900, '{"fullName": "Alex Mercer", "phone": "9876543210", "street": "42 Esports Cyber Arena, Gamer Row", "city": "Bengaluru", "state": "Karnataka", "pincode": "560001"}', 'UPI', 'ABM-TRACK-994201', '2026-08-05 16:30:00');

INSERT OR REPLACE INTO order_items (id, order_id, product_id, quantity, unit_price_cents)
VALUES
(1, 1, 1, 1, 1899900),
(2, 1, 5, 1, 1499900),
(3, 2, 1, 1, 1899900);
