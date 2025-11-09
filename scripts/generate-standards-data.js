import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

const STANDARDS_DIR = 'standards';
const OUTPUT_FILE = 'mtst-spa/public/standards.json';

async function parseCsvFile(filePath) {
    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    return new Promise((resolve, reject) => {
        parse(fileContent, {
            columns: true, // Treat the first row as column headers
            skip_empty_lines: true,
            trim: true,
        }, (err, records) => {
            if (err) {
                return reject(err);
            }
            resolve(records);
        });
    });
}

async function generateStandardsData() {
    const standardsData = {};
    const files = await fs.promises.readdir(STANDARDS_DIR);

    for (const file of files) {
        if (file.endsWith('.csv') && file !== 'all-2024-2028.csv') {
            const filePath = path.join(STANDARDS_DIR, file);
            const fileNameWithoutExt = path.basename(file, '.csv');

            // Expected format: AGEGROUP-GENDER-COURSE-YEARS.csv
            const parts = fileNameWithoutExt.split('-');
            if (parts.length >= 4) {
                const ageGroup = parts[0] + '-' + parts[1]; // e.g., "01-10"
                const gender = parts[2]; // e.g., "Female", "Male"
                const course = parts[3]; // e.g., "LCM", "SCY"

                if (!standardsData[ageGroup]) {
                    standardsData[ageGroup] = {};
                }
                if (!standardsData[ageGroup][gender]) {
                    standardsData[ageGroup][gender] = {};
                }

                try {
                    const records = await parseCsvFile(filePath);
                    standardsData[ageGroup][gender][course] = records;
                    console.log(`Parsed ${file}`);
                } catch (error) {
                    console.error(`Error parsing ${file}:`, error);
                }
            } else {
                console.warn(`Skipping malformed filename: ${file}`);
            }
        }
    }

    // Ensure the output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    await fs.promises.mkdir(outputDir, { recursive: true });

    await fs.promises.writeFile(OUTPUT_FILE, JSON.stringify(standardsData, null, 2), 'utf8');
    console.log(`Standards data successfully generated and saved to ${OUTPUT_FILE}`);
}

generateStandardsData().catch(console.error);
