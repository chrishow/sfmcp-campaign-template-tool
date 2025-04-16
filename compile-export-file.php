#!/usr/bin/env php
<?php

/*
 * This script compiles a set of MCP template files into a JSON object for export.
 * It reads the content of each file and adds it to the JSON object.
 * The output is printed to the console, you can pipe it to pbcopy then paste it
 * into the MCP template editor 
 *
 */

$files = [
    'template.hbs' => 'template.hbs',
    'template.css' => 'styles.css',
    'template.js' => 'client-side.js',
    'template.ts' => 'server-side.ts',
];

$data = new stdClass();

$exportFile = 'export.json';

// Set up basics
$data->description = "Imported template";
$data->public = false;
$data->files = new stdClass();

foreach($files as $filename => $file) {
    $filePath = __DIR__ . '/campaign/' . $file;
    if (!file_exists($filePath)) {
        echo "File not found: $filePath\n";
        continue;
    }

    // Read the file content
    $content = file_get_contents($filePath);
    if ($content === false) {
        echo "Failed to read file: $filePath\n";
        continue;
    }

    // Add the content to the data object
    $contentObj = new stdClass();
    $contentObj->content = $content;
    $data->files->$filename = $contentObj;
}

echo json_encode($data) . "\n";