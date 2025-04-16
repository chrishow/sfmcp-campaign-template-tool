// vite-plugin-campaign-data.ts
import type { PluginOption } from 'vite';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

const virtualModuleId = 'virtual:campaign-data';
const resolvedVirtualModuleId = '\0' + virtualModuleId; // Convention for virtual modules

export function campaignDataPlugin(): PluginOption {
    // Resolve the absolute path to the component file relative to the plugin file's location
    const componentPath = path.resolve(__dirname, 'campaign/server-side.ts'); // Updated path

    function extractData() {
        console.log(`Reading component data from: ${componentPath}`);
        try {
            const fileContent = fs.readFileSync(componentPath, 'utf-8');
            const sourceFile = ts.createSourceFile(
                componentPath,
                fileContent,
                ts.ScriptTarget.ESNext,
                true // setParentNodes
            );

            const extractedData: Record<string, any> = {};
            let className = '';

            ts.forEachChild(sourceFile, (node) => {
                if (ts.isClassDeclaration(node) && node.name) {
                    // Assuming only one relevant class per file for simplicity
                    className = node.name.getText(sourceFile);
                    console.log(`Found class: ${className}`);

                    ts.forEachChild(node, (classMember) => {
                        if (ts.isPropertyDeclaration(classMember) && classMember.initializer) {
                            const propertyName = classMember.name.getText(sourceFile);
                            const initializer = classMember.initializer;

                            let value: any;

                            if (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)) {
                                value = initializer.text; // Gets the raw string value without quotes
                            } else if (ts.isNumericLiteral(initializer)) {
                                value = parseFloat(initializer.text);
                            } else if (initializer.kind === ts.SyntaxKind.TrueKeyword) {
                                value = true;
                            } else if (initializer.kind === ts.SyntaxKind.FalseKeyword) {
                                value = false;
                            } else if (ts.isObjectLiteralExpression(initializer) || ts.isArrayLiteralExpression(initializer)) {
                                // Basic handling for simple object/array literals - might need refinement for complex cases
                                try {
                                    // Attempt to evaluate simple literals - use with caution!
                                    value = JSON.parse(initializer.getText(sourceFile));
                                } catch (e) {
                                    console.warn(`Could not parse initializer for ${propertyName}: ${initializer.getText(sourceFile)}`, e);
                                    value = initializer.getText(sourceFile); // Fallback to text representation
                                }
                            } else {
                                // For other types (like new Class(), function calls, etc.), just store the text for now or ignore
                                console.log(`Skipping complex initializer for property: ${propertyName}`);
                                // Or: value = initializer.getText(sourceFile); // If you want the code snippet
                            }

                            if (value !== undefined) {
                                extractedData[propertyName] = value;
                            }
                        }
                    });
                }
            });

            console.log('Extracted data:', extractedData);
            if (Object.keys(extractedData).length === 0 && className) {
                console.warn(`No properties with simple initializers found in class ${className}. Did you use complex initializers?`);
            } else if (!className) {
                console.warn(`Could not find a class declaration in ${componentPath}`);
            }
            return extractedData;
        } catch (error) {
            console.error(`Error reading or parsing ${componentPath}:`, error);
            return {}; // Return empty object on error
        }
    }

    return {
        name: 'vite-plugin-campaign-data', // Plugin name

        // Resolve the virtual module ID
        resolveId(id) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },

        // Load the content for the virtual module
        load(id) {
            if (id === resolvedVirtualModuleId) {
                const data = extractData();
                // Generate the module content exporting the data
                return `export const campaignData = ${JSON.stringify(data, null, 2)};`;
            }
        },

        // Handle Hot Module Replacement (HMR)
        handleHotUpdate({ file, server }) {
            // If the source component file changes...
            if (path.resolve(file) === componentPath) {
                console.log(`HMR: Detected change in ${componentPath}`);
                // Find the virtual module in the graph
                const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
                if (module) {
                    // Invalidate the virtual module, forcing Vite to reload it
                    server.moduleGraph.invalidateModule(module);
                    console.log(`HMR: Invalidated virtual module ${virtualModuleId}`);

                    // Send a custom event or trigger a reload for modules importing the virtual one
                    server.ws.send({
                        type: 'custom',
                        event: 'campaign-data-update', // Custom event name
                        data: extractData() // Send the new data if needed by client directly
                    });
                    // Alternatively, a full reload might be simpler if direct update is complex
                    // server.ws.send({ type: 'full-reload', path: '*' });
                    console.log('HMR: Sent campaign-data-update event');
                    return []; // Indicate we handled this update
                }
            }
        },
    };
}