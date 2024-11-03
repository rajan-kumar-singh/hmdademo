import fs from 'fs'
import { polygon, multiPolygon, area } from '@turf/turf'
// const { polygon, multiPolygon, area } = require('@turf/turf');

// Function to read GeoJSON data from a local file
const readGeoJson = (filename, callback) => {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
    const geojson = JSON.parse(data);
    callback(geojson);
  });
};

// Function to calculate areas and update features
const calculateAreas = (features) => {
  return features.map(feature => {
    const { geometry } = feature;
    let featureArea = 0;

    if (geometry.type === 'Polygon') {
      featureArea = area(polygon(geometry.coordinates));
    } else if (geometry.type === 'MultiPolygon') {
      featureArea = area(multiPolygon(geometry.coordinates));
    }

    return {
      ...feature,
      properties: {
        ...feature.properties,
        area: featureArea
      }
    };
  });
};

// Function to update the GeoJSON data
const updateGeoJson = (geojson) => {
  const updatedFeatures = calculateAreas(geojson.features);
  const updatedGeoJson = {
    ...geojson,
    features: updatedFeatures
  };
  return updatedGeoJson;
};

// Function to export updated GeoJSON data to a new file
const exportGeoJson = (data, filename) => {
  const jsonString = JSON.stringify(data, null, 2);
  fs.writeFile(filename, jsonString, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('File has been saved as', filename);
    }
  });
};

// Main function to read, update, and export the GeoJSON file
const processGeoJsonFile = (inputFilename, outputFilename) => {
  readGeoJson(inputFilename, (geojson) => {
    const updatedGeoJson = updateGeoJson(geojson);
    exportGeoJson(updatedGeoJson, outputFilename);
  });
};

// Replace 'input.geojson' with your input file name and 'updated_geojson.geojson' with your desired output file name
processGeoJsonFile('C:\Users\ASUS\Downloads\hmda\public\hmdaData\HMDA Sites.geojson', 'updated_geojson.geojson');
