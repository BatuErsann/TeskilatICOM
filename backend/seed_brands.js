const db = require('./src/config/db');

const brands = [
    { name: 'Brand 01', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-01.svg', display_order: 1 },
    { name: 'Brand 02', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-02.svg', display_order: 2 },
    { name: 'Brand 04', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-04.svg', display_order: 3 },
    { name: 'Brand 05', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-05.svg', display_order: 4 },
    { name: 'Brand 06', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-06.svg', display_order: 5 },
    { name: 'Brand 07', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-07.svg', display_order: 6 },
    { name: 'Brand 08', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-08.svg', display_order: 7 },
    { name: 'Brand 09', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-09.svg', display_order: 8 },
    { name: 'Brand 10', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-10.svg', display_order: 9 },
    { name: 'Brand 17', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-17.svg', display_order: 10 },
    { name: 'Brand 18', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-18.svg', display_order: 11 },
    { name: 'Brand 19', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-19.svg', display_order: 12 },
    { name: 'Brand 20', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-20.svg', display_order: 13 },
    { name: 'Brand 21', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-21.svg', display_order: 14 },
    { name: 'Brand 22', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-22.svg', display_order: 15 },
    { name: 'Brand 24', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-24.svg', display_order: 16 },
    { name: 'Brand 29', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-29.svg', display_order: 17 },
    { name: 'Brand 30', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-30.svg', display_order: 18 },
    { name: 'Brand 32', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-32.svg', display_order: 19 },
    { name: 'Brand 33', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-33.svg', display_order: 20 },
    { name: 'Brand 34', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-34.svg', display_order: 21 },
    { name: 'Brand 35', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-35.svg', display_order: 22 },
    { name: 'Brand 36', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-36.svg', display_order: 23 },
    { name: 'Brand 39', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-39.svg', display_order: 24 },
    { name: 'Brand 40', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-40.svg', display_order: 25 },
    { name: 'Brand 41', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-41.svg', display_order: 26 },
    { name: 'Brand 43', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-43.svg', display_order: 27 },
    { name: 'Brand 44', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-44.svg', display_order: 28 },
    { name: 'Brand 45', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-45.svg', display_order: 29 },
    { name: 'Brand 46', logo_url: '/uploads/brands/TSK_00002_Web Sitesi Marka Logoları-46.svg', display_order: 30 },
];

async function seedBrands() {
    try {
        console.log('Starting brand seeding...');

        for (const brand of brands) {
            await db.execute(
                'INSERT INTO brands (name, logo_url, display_order) VALUES (?, ?, ?)',
                [brand.name, brand.logo_url, brand.display_order]
            );
            console.log(`Added: ${brand.name}`);
        }

        console.log('All brands added successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding brands:', err);
        process.exit(1);
    }
}

seedBrands();
