const fs = require('fs');
const path = require('path');

// Define paths relative to the project root
const STANDARDS_DIR = path.resolve(process.cwd(), 'standards');
const INPUT_FILE_AGE_GROUP = path.join(STANDARDS_DIR, '2028-motivational-standards-age-group.json');
const INPUT_FILE_SINGLE_AGE = path.join(STANDARDS_DIR, '2028-motivational-standards-single-age.json');
const OUTPUT_DIR = path.resolve(process.cwd(), 'public/standards');

const genderMap = {
    'Girls': 'Female',
    'Boys': 'Male',
};

async function generateStandardsData() {
    // Ensure the output directory exists
    await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Ensured output directory exists: ${OUTPUT_DIR}`);

    let singleAgeSourceData = [];
    try {
        const content = await fs.promises.readFile(INPUT_FILE_SINGLE_AGE, 'utf8');
        singleAgeSourceData = JSON.parse(content);
        console.log(`Loaded single-age standards from ${INPUT_FILE_SINGLE_AGE}`);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error(`Error reading or parsing single-age standards file (${INPUT_FILE_SINGLE_AGE}):`, error);
        } else {
            console.log(`Info: Single-age standards file not found, skipping. (${INPUT_FILE_SINGLE_AGE})`);
        }
    }

    const groupedSingleAgeStandards = {};

    // Helper function to process and group records
    const processAndGroupRecords = (records, groupedOutput) => {
        for (const record of records) {
            const { age, gender, event, standards } = record;

            const eventParts = event.split(' ');
            const course = eventParts.pop();
            const eventName = eventParts.join(' ');

            const ageKey = age; // '10'
            const genderKey = genderMap[gender];

            if (!genderKey) {
                console.warn(`Skipping record with unmapped gender: ${gender}`);
                continue;
            }

            if (!groupedOutput[ageKey]) {
                groupedOutput[ageKey] = {};
            }
            if (!groupedOutput[ageKey][genderKey]) {
                groupedOutput[ageKey][genderKey] = {};
            }
            if (!groupedOutput[ageKey][genderKey][course]) {
                groupedOutput[ageKey][genderKey][course] = [];
            }

            const cleanedStandards = Object.entries(standards).reduce((acc, [cut, time]) => {
                acc[cut] = time.replace(/\*/g, '').trim();
                return acc;
            }, {});

            const transformedEvent = {
                Event: eventName,
                ...cleanedStandards,
            };

            groupedOutput[ageKey][genderKey][course].push(transformedEvent);
        }
    };

    // Process single-age data
    processAndGroupRecords(singleAgeSourceData, groupedSingleAgeStandards);

    // Write the grouped single-age data to individual JSON files
    for (const singleAge in groupedSingleAgeStandards) {
        for (const gender in groupedSingleAgeStandards[singleAge]) {
            for (const course in groupedSingleAgeStandards[singleAge][gender]) {
                const records = groupedSingleAgeStandards[singleAge][gender][course];

                // For single ages, the key is the age itself (e.g., '10', '11')
                const singleAgeOutputFileName = `${singleAge}-${gender}-${course}.json`;
                const singleAgeOutputFilePath = path.join(OUTPUT_DIR, singleAgeOutputFileName);
                try {
                    await fs.promises.writeFile(singleAgeOutputFilePath, JSON.stringify(records, null, 2), 'utf8');
                    console.log(`Generated ${singleAgeOutputFileName}`);
                } catch (error) {
                    console.error(`Error writing ${singleAgeOutputFileName}:`, error);
                }
            }
        }
    }

    console.log('Standards data generation complete.');
}

generateStandardsData().catch(console.error);
