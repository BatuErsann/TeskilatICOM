const db = require('./src/config/db');

async function updateBrandUrls() {
    try {
        console.log('Updating brand logo URLs...');

        const updates = [
            { oldNum: '01', newPath: '/uploads/brands/brand_01.svg' },
            { oldNum: '02', newPath: '/uploads/brands/brand_02.svg' },
            { oldNum: '04', newPath: '/uploads/brands/brand_04.svg' },
            { oldNum: '05', newPath: '/uploads/brands/brand_05.svg' },
            { oldNum: '06', newPath: '/uploads/brands/brand_06.svg' },
            { oldNum: '07', newPath: '/uploads/brands/brand_07.svg' },
            { oldNum: '08', newPath: '/uploads/brands/brand_08.svg' },
            { oldNum: '09', newPath: '/uploads/brands/brand_09.svg' },
            { oldNum: '10', newPath: '/uploads/brands/brand_10.svg' },
            { oldNum: '17', newPath: '/uploads/brands/brand_17.svg' },
            { oldNum: '18', newPath: '/uploads/brands/brand_18.svg' },
            { oldNum: '19', newPath: '/uploads/brands/brand_19.svg' },
            { oldNum: '20', newPath: '/uploads/brands/brand_20.svg' },
            { oldNum: '21', newPath: '/uploads/brands/brand_21.svg' },
            { oldNum: '22', newPath: '/uploads/brands/brand_22.svg' },
            { oldNum: '24', newPath: '/uploads/brands/brand_24.svg' },
            { oldNum: '29', newPath: '/uploads/brands/brand_29.svg' },
            { oldNum: '30', newPath: '/uploads/brands/brand_30.svg' },
            { oldNum: '32', newPath: '/uploads/brands/brand_32.svg' },
            { oldNum: '33', newPath: '/uploads/brands/brand_33.svg' },
            { oldNum: '34', newPath: '/uploads/brands/brand_34.svg' },
            { oldNum: '35', newPath: '/uploads/brands/brand_35.svg' },
            { oldNum: '36', newPath: '/uploads/brands/brand_36.svg' },
            { oldNum: '39', newPath: '/uploads/brands/brand_39.svg' },
            { oldNum: '40', newPath: '/uploads/brands/brand_40.svg' },
            { oldNum: '41', newPath: '/uploads/brands/brand_41.svg' },
            { oldNum: '43', newPath: '/uploads/brands/brand_43.svg' },
            { oldNum: '44', newPath: '/uploads/brands/brand_44.svg' },
            { oldNum: '45', newPath: '/uploads/brands/brand_45.svg' },
            { oldNum: '46', newPath: '/uploads/brands/brand_46.svg' },
        ];

        for (const update of updates) {
            await db.execute(
                'UPDATE brands SET logo_url = ? WHERE name = ?',
                [update.newPath, `Brand ${update.oldNum}`]
            );
            console.log(`Updated: Brand ${update.oldNum}`);
        }

        console.log('All brand URLs updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating brands:', err);
        process.exit(1);
    }
}

updateBrandUrls();
