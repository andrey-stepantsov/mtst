import fs from 'fs';                                                                                                                                                                  
import path from 'path';                                                                                                                                                              
import { createRequire } from 'module';                                                                                                                                               
                                                                                                                                                                                      
const require = createRequire(import.meta.url);                                                                                                                                       
const { parse } = require('csv-parse');                                                                                                                                               
                                                                                                                                                                                      
// When this script runs via `npm run --prefix mtst-spa`, process.cwd() will be 'mtst-spa'.                                                                                           
// So, paths need to be relative to 'mtst-spa'.                                                                                                                                       
const STANDARDS_DIR = path.resolve(process.cwd(), '../standards'); // 'standards' directory is one level up from 'mtst-spa'
const OUTPUT_DIR = path.resolve(process.cwd(), 'public/standards'); // Output directory for individual JSON files
                                                                                                                                                                                      
async function parseCsvFile(filePath) {                                                                                                                                               
    const fileContent = await fs.promises.readFile(filePath, 'utf8');                                                                                                                 
    return new Promise((resolve, reject) => {                                                                                                                                         
        parse(fileContent, {
            columns: (header) => header.map(column => column.trim().replace(/^\uFEFF/, '')), // Clean up headers
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
    let files;                                                                                                                                                                        
    try {                                                                                                                                                                             
        files = await fs.promises.readdir(STANDARDS_DIR);                                                                                                                             
    } catch (error) {                                                                                                                                                                 
        console.error(`Error reading standards directory (${STANDARDS_DIR}):`, error);                                                                                                
        return;                                                                                                                                                                       
    }                                                                                                                                                                                 
                                                                                                                                                                                      
    // Ensure the output directory exists                                                                                                                                             
    await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });                                                                                                                         
    console.log(`Ensured output directory exists: ${OUTPUT_DIR}`);                                                                                                                    
                                                                                                                                                                                      
    for (const file of files) {                                                                                                                                                       
        if (file.endsWith('.csv') && file !== 'all-2024-2028.csv') {                                                                                                                  
            const filePath = path.join(STANDARDS_DIR, file);                                                                                                                          
            const fileNameWithoutExt = path.basename(file, '.csv');                                                                                                                   
                                                                                                                                                                                      
            // Expected format: AGEGROUP-GENDER-COURSE-YEARS.csv                                                                                                                      
            const parts = fileNameWithoutExt.split('-');                                                                                                                              
            // Ensure there are enough parts for age group, gender, and course                                                                                                        
            if (parts.length >= 4) {                                                                                                                                                  
                // Age group can be "01-10", "11-12", "13-14"                                                                                                                         
                // The first two parts form the age group, e.g., "01" and "10" -> "01-10"                                                                                             
                const ageGroup = `${parts[0]}-${parts[1]}`;                                                                                                                           
                const gender = parts[2]; // e.g., "Female", "Male"                                                                                                                    
                const course = parts[3]; // e.g., "LCM", "SCY"                                                                                                                        
                                                                                                                                                                                      
                try {                                                                                                                                                                 
                    const records = await parseCsvFile(filePath);                                                                                                                     
                    const outputFileName = `${ageGroup}-${gender}-${course}.json`;                                                                                                    
                    const outputFilePath = path.join(OUTPUT_DIR, outputFileName);                                                                                                     
                    await fs.promises.writeFile(outputFilePath, JSON.stringify(records, null, 2), 'utf8');                                                                            
                    console.log(`Generated ${outputFileName}`);                                                                                                                       
                } catch (error) {                                                                                                                                                     
                    console.error(`Error processing ${file}:`, error);                                                                                                                
                }                                                                                                                                                                     
            } else {                                                                                                                                                                  
                console.warn(`Skipping malformed filename: ${file}. Expected format: AGEGROUP-GENDER-COURSE-YEARS.csv`);                                                              
            }                                                                                                                                                                         
        }                                                                                                                                                                             
    }                                                                                                                                                                                 
                                                                                                                                                                                      
    console.log(`Standards data generation complete.`);                                                                                                                               
}                                                                                                                                                                                     

generateStandardsData().catch(console.error);
