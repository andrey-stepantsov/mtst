import fs from 'fs';
import path from 'path';

// Define paths relative to the project root
const STANDARDS_DIR = path.resolve(process.cwd(), 'standards');
const INPUT_FILE_AGE_GROUP = path.join(STANDARDS_DIR, '2028-motivational-standards-age-group.json');
const INPUT_FILE_SINGLE_AGE = path.join(STANDARDS_DIR, '2028-motivational-standards-single-age.json');
const OUTPUT_DIR = path.resolve(process.cwd(), 'public/standards');

// Mapping from the new data format to the application's expected format
const ageGroupMap = {
    '10 & under': '01-10',
    '11-12': '11-12',
    '13-14': '13-14',
    '15-16': '15-16',
    '17-18': '17-18',
};

const genderMap = {
    'Girls': 'Female',
    'Boys': 'Male',
};

// Helper to map single ages to the age groups used in the age-group file
function getAgeGroupFromAge(age) {
    const ageNum = parseInt(age, 10);
    if (ageNum <= 10) return '10 & under';
    if (ageNum <= 12) return '11-12';
    if (ageNum <= 14) return '13-14';
    if (ageNum <= 16) return '15-16';
    if (ageNum <= 18) return '17-18';
    return null;
}

async function generateStandardsData() {
    // Ensure the output directory exists
    await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Ensured output directory exists: ${OUTPUT_DIR}`);

    // Read and process both source JSON files
    let sourceData = [];
    try {
        const ageGroupContent = await fs.promises.readFile(INPUT_FILE_AGE_GROUP, 'utf8');
        sourceData.push(...JSON.parse(ageGroupContent));
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`Error reading or parsing age-group standards file (${INPUT_FILE_AGE_GROUP}):`, error);
        } else {
            console.log(`Info: Age-group standards file not found, skipping. (${INPUT_FILE_AGE_GROUP})`);
        }
    }

    try {
        const singleAgeContent = await fs.promises.readFile(INPUT_FILE_SINGLE_AGE, 'utf8');
        const singleAgeData = JSON.parse(singleAgeContent);

        const transformedSingleAgeData = singleAgeData.map(record => {
            const ageGroup = getAgeGroupFromAge(record.age);
            if (!ageGroup) {
                console.warn(`Skipping record with unmapped single age: ${record.age}`);
                return null;
            }
            return {
                ...record,
                age: ageGroup,
            };
        }).filter(Boolean); // remove nulls from failed mappings

        sourceData.push(...transformedSingleAgeData);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`Error reading or parsing single-age standards file (${INPUT_FILE_SINGLE_AGE}):`, error);
        } else {
            console.log(`Info: Single-age standards file not found, skipping. (${INPUT_FILE_SINGLE_AGE})`);
        }
    }

    // Group standards by age, gender, and course
    const groupedStandards = {};

    for (const record of sourceData) {
        const { age, gender, event, standards } = record;

        // Extract event name and course
        const eventParts = event.split(' ');
        const course = eventParts.pop(); // SCY, SCM, LCM
        const eventName = eventParts.join(' ');

        // Map age group and gender to the format used for filenames
        const ageGroupKey = ageGroupMap[age];
        const genderKey = genderMap[gender];

        if (!ageGroupKey || !genderKey) {
            console.warn(`Skipping record with unmapped age/gender: ${age}, ${gender}`);
            continue;
        }

        // Initialize nested structure if it doesn't exist
        if (!groupedStandards[ageGroupKey]) {
            groupedStandards[ageGroupKey] = {};
        }
        if (!groupedStandards[ageGroupKey][genderKey]) {
            groupedStandards[ageGroupKey][genderKey] = {};
        }
        if (!groupedStandards[ageGroupKey][genderKey][course]) {
            groupedStandards[ageGroupKey][genderKey][course] = [];
        }

        // Create the transformed event object
        const transformedEvent = {
            Event: eventName,
            ...standards,
        };

        // Add the transformed event to the correct group
        groupedStandards[ageGroupKey][genderKey][course].push(transformedEvent);
    }

    // Write the grouped data to individual JSON files
    for (const ageGroup in groupedStandards) {
        for (const gender in groupedStandards[ageGroup]) {
            for (const course in groupedStandards[ageGroup][gender]) {
                const records = groupedStandards[ageGroup][gender][course];
                const outputFileName = `${ageGroup}-${gender}-${course}.json`;
                const outputFilePath = path.join(OUTPUT_DIR, outputFileName);

                try {
                    await fs.promises.writeFile(outputFilePath, JSON.stringify(records, null, 2), 'utf8');
                    console.log(`Generated ${outputFileName}`);
                } catch (error) {
                    console.error(`Error writing ${outputFileName}:`, error);
                }
            }
        }
    }

    console.log('Standards data generation complete.');
}

generateStandardsData().catch(console.error);
