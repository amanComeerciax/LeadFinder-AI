import axios from 'axios';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import readline from 'readline';
import { fileURLToPath } from 'url';
import PostalCode from '../models/PostalCode.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '../../temp/geonames');

/**
 * Service to handle GeoNames postal code data ingestion
 */
export const downloadAndIngestCountry = async (countryCode) => {
    const code = countryCode.toUpperCase();
    const url = `https://download.geonames.org/export/zip/${code}.zip`;
    const zipPath = path.join(TEMP_DIR, `${code}.zip`);
    const txtPath = path.join(TEMP_DIR, `${code}.txt`);

    try {
        // Ensure temp directory exists
        if (!fs.existsSync(TEMP_DIR)) {
            fs.mkdirSync(TEMP_DIR, { recursive: true });
        }

        console.log(`[GeoNames] Downloading data for ${code}...`);
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(zipPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log(`[GeoNames] Unzipping ${code}.zip...`);
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(TEMP_DIR, true);

        // Usually the file inside is named {countryCode}.txt
        // But for some it might be different, let's assume it's {countryCode}.txt or readme.txt
        const files = fs.readdirSync(TEMP_DIR);
        const dataFile = files.find(f => f.toUpperCase() === `${code}.TXT`);

        if (!dataFile) {
            throw new Error(`Data file ${code}.txt not found in zip`);
        }

        const dataPath = path.join(TEMP_DIR, dataFile);
        console.log(`[GeoNames] Ingesting data from ${dataPath}...`);

        await ingestFromTxt(dataPath);

        console.log(`[GeoNames] Ingestion completed for ${code}`);

        // Cleanup
        fs.unlinkSync(zipPath);
        fs.unlinkSync(dataPath);

        return { success: true, country: code };
    } catch (error) {
        console.error(`[GeoNames] Error processing ${code}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Download and ingest ALL countries data (allCountries.zip)
 */
export const downloadAndIngestGlobal = async () => {
    const fileName = 'allCountries';
    const url = `https://download.geonames.org/export/zip/${fileName}.zip`;
    const zipPath = path.join(TEMP_DIR, `${fileName}.zip`);
    const txtPath = path.join(TEMP_DIR, `${fileName}.txt`); // Inside zip it is allCountries.txt

    try {
        // Ensure temp directory exists
        if (!fs.existsSync(TEMP_DIR)) {
            fs.mkdirSync(TEMP_DIR, { recursive: true });
        }

        console.log(`[GeoNames] Downloading global postal code data (approx 20MB)...`);
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(zipPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log(`[GeoNames] Unzipping ${fileName}.zip...`);
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(TEMP_DIR, true);

        // Check if file exists. Based on docs it should be allCountries.txt
        // (Case sensitive check on Mac might matter, but usually it's correct)
        const files = fs.readdirSync(TEMP_DIR);
        const dataFile = files.find(f => f.toUpperCase() === 'ALLCOUNTRIES.TXT');

        if (!dataFile) {
            throw new Error(`Data file not found in zip`);
        }

        const dataPath = path.join(TEMP_DIR, dataFile);
        console.log(`[GeoNames] Ingesting GLOBAL data from ${dataPath}. This may take a while...`);

        // We use the same ingestion function
        await ingestFromTxt(dataPath);

        console.log(`[GeoNames] Global ingestion completed successfully!`);

        // Cleanup
        try {
            fs.unlinkSync(zipPath);
            fs.unlinkSync(dataPath);
        } catch (cleanupErr) {
            console.warn('[GeoNames] Cleanup warning:', cleanupErr.message);
        }

        return { success: true };
    } catch (error) {
        console.error(`[GeoNames] Error processing global data:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Parse GeoNames txt file and save to MongoDB in batches
 */
const ingestFromTxt = async (filePath) => {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let batch = [];
    const BATCH_SIZE = 1000;
    let totalProcessed = 0;

    for await (const line of rl) {
        const fields = line.split('\t');
        if (fields.length < 12) continue;

        const postalData = {
            countryCode: fields[0],
            postalCode: fields[1],
            placeName: fields[2],
            adminName1: fields[3],
            adminCode1: fields[4],
            adminName2: fields[5],
            adminCode2: fields[6],
            adminName3: fields[7],
            adminCode3: fields[8],
            latitude: parseFloat(fields[9]),
            longitude: parseFloat(fields[10]),
            accuracy: parseInt(fields[11]) || 0
        };

        batch.push(postalData);

        if (batch.length >= BATCH_SIZE) {
            await PostalCode.bulkWrite(
                batch.map(doc => ({
                    updateOne: {
                        filter: { countryCode: doc.countryCode, postalCode: doc.postalCode, placeName: doc.placeName },
                        update: { $set: doc },
                        upsert: true
                    }
                }))
            );
            totalProcessed += batch.length;
            console.log(`[GeoNames] Processed ${totalProcessed} records...`);
            batch = [];
        }
    }

    if (batch.length > 0) {
        await PostalCode.bulkWrite(
            batch.map(doc => ({
                updateOne: {
                    filter: { countryCode: doc.countryCode, postalCode: doc.postalCode, placeName: doc.placeName },
                    update: { $set: doc },
                    upsert: true
                }
            }))
        );
        totalProcessed += batch.length;
    }

    console.log(`[GeoNames] Total processed: ${totalProcessed}`);
};

export default {
    downloadAndIngestCountry,
    downloadAndIngestGlobal
};
