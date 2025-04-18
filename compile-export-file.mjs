#!/usr/bin/env node

/*
 * This script compiles a set of MCP template files into a JSON object for export.
 * It reads the content of each file and adds it to the JSON object.
 * The output is printed to the console. Pipe it to pbcopy (macOS) or clip (Windows)
 * to copy it, then paste it into the MCP template editor.
 *
 * Usage: node compile-export-file.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import less from 'less'; // Import the less compiler

// Replicate __dirname functionality in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the mapping from JSON keys to actual file names in the campaign directory
const filesToCompile = {
    'template.hbs': 'template.hbs',
    'template.css': 'styles.less', // Read .less, but compile to .css
    'template.js': 'client-side.js',
    'template.ts': 'server-side.ts',
};

const data = {
    description: "Imported template",
    public: false,
    files: {},
};

// console.log('Starting template compilation...');

// Use an async function to handle the async less compilation
async function compileAndExport() {
    for (const [jsonKey, sourceFileName] of Object.entries(filesToCompile)) {
        const filePath = path.join(__dirname, 'campaign', sourceFileName);
        // console.log(`Attempting to read: ${filePath}`);

        try {
            if (!fs.existsSync(filePath)) {
                console.warn(`Warning: File not found, skipping: ${filePath}`);
                continue; // Skip this file if it doesn't exist
            }

            // Read the file content
            const content = fs.readFileSync(filePath, 'utf8');

            // Special handling for CSS: compile LESS
            if (jsonKey === 'template.css' && sourceFileName.endsWith('.less')) {
                try {
                    const lessOutput = await less.render(content, {
                        paths: [path.dirname(filePath)] // Include directory for @import resolution
                    });
                    data.files[jsonKey] = { content: lessOutput.css };
                    // console.log(`Successfully compiled ${sourceFileName} and added as ${jsonKey}`);
                } catch (lessError) {
                    console.error(`Error compiling LESS file ${filePath}:`, lessError);
                    // Optionally skip adding this file on error, or add empty content
                    data.files[jsonKey] = { content: `/* LESS Compilation Error: ${lessError.message} */` };
                }
            } else {
                // Add the content directly for other file types
                data.files[jsonKey] = { content: content };
                // console.log(`Successfully added ${sourceFileName} as ${jsonKey}`);
            }

        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
            // Optionally exit on error: process.exit(1);
        }
    }

    // Output the final JSON object
    // console.log('\nCompilation complete. Outputting JSON:\n');
    console.log(JSON.stringify(data, null, 2)); // Pretty print JSON
}

// Run the async function
compileAndExport().catch(err => {
    console.error("An unexpected error occurred during compilation:", err);
    process.exit(1);
});