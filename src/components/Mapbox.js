import mapboxgl from 'mapbox-gl'
import React, { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapboxLayer } from '@deck.gl/mapbox'
import { GeoJsonLayer, TextLayer } from 'deck.gl'
import { Select, MenuItem, FormControl, InputLabel, Tooltip, Typography, IconButton, Menu, Button, Collapse, Stack, Autocomplete, TextField, Divider, Paper, Box, Fade, Grow, Slide, InputAdornment, } from '@mui/material'
import { HighlightAltRounded, Logout, PanToolRounded, SettingsOverscanRounded, ZoomInRounded, ZoomOutRounded, Queue, StraightenRounded, SquareFootRounded, PrintRounded, CloudUploadRounded, QueryBuilder, AddRounded, RemoveRounded, CloseRounded, DoneRounded, DashboardRounded, Opacity, Search } from '@mui/icons-material'
import Cookies from 'js-cookie';
import EditLocationAltIcon from '@mui/icons-material/EditLocationAlt';
import EditLocationIcon from '@mui/icons-material/EditLocation';
import * as turf from '@turf/turf';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { styled } from '@mui/material/styles';
import { kml } from '@tmcw/togeojson'
import CustomizedSnackbars from '../utils/CustomizedSnackbars'

const ITEM_HEIGHT = 48;

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const featureColorMapping = {
    "Agriculture Land": [123, 186, 62, 150],
    "Builtup": [231, 122, 171, 150],
    "Dispute Land": [146, 90, 91, 150],
    "Encrochment": [233, 107, 53, 150],
    "Forest": [78, 118, 34, 150],
    "Layout Area": [109, 227, 222, 150],
    "Nala": [42, 61, 148, 150],
    "Narsary": [166, 207, 52, 150],
    "Open Land": [239, 187, 48, 150],
    "Outside Land": [212, 116, 63, 150],
    "Park Area": [151, 195, 44, 150],
    "Private Land": [226, 202, 79, 150],
    "Road Area": [141, 140, 139, 150],
    "TSIiC Land": [214, 119, 51, 150],
    "Water Body": [73, 109, 165, 150]
}

export default function Mapbox(props) {

    const blackIcon = {
        color: 'black'
    }

    const long = 79.7400
    const lati = 15.9129
    const [revenueGeojson, setRevenueGeojson] = useState();
    const [districtGeojson, setDistrictGeojson] = useState();
    const [mandalGeojson, setMandalGeojson] = useState();
    const [allSitesList, setAllSitesList] = useState([]);
    const [districtList, setDistrictList] = useState();
    const [villagesList, setVillagesList] = useState();
    const [mandalList, setMandalList] = useState();
    const mapContainer = useRef(null)
    const map = useRef(null)
    const drawRef = useRef(null); // Reference for MapboxDraw instance
    const [filters, setFilters] = useState([]);
    const [lng, setLng] = useState(long)
    const [lat, setLat] = useState(lati)
    const [zoom, setZoom] = useState(6)
    const [hoverInfo, setHoverInfo] = useState('');
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedVillage, setSelectedVillage] = useState('');
    const [selectedMandal, setSelectedMandal] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDragPan, setIsDragPan] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isArea, setIsArea] = useState(false);
    const [isSelect, setIsSelect] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [isOptions, setIsOptions] = useState(false)
    const [isFilter, setIsFilter] = useState(false)
    const [isDashboard, setIsDashboard] = useState(false)
    const open = Boolean(anchorEl);
    const [value, setValue] = React.useState(null);
    const [identifiedFeature, setIdentifiedFeature] = useState(null)
    const [filterType, setFilterType] = useState('');
    const [operator, setOperator] = useState('');
    const [filterValue, setFilterValue] = useState('');
    const [hmdaSitesGeojson, setHmdaSitesGeojson] = useState()
    const [newFilterToggle, setNewFilterToggle] = useState(false)
    const [feedback, setFeedback] = useState(false)
    const [dashboardDetails, setDashboardDetails] = useState({})
    useEffect(() => {
        // console.log(identifiedFeature)
        if (isSelect) {
            props.setTableData(identifiedFeature);
            props.setIsTable(true)
            moveMapToBounds(identifiedFeature)
        }
    }, [identifiedFeature])
    const handleOptions = () => {
        setIsOptions(!isOptions)
    }
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleLogout = () => {
        Cookies.remove('token')
        props.setAuthToken(false)
    }
    const handlePrint = () => {
        var content = map.current.getCanvas().toDataURL();
        // Create a function to download the image
        function downloadMapImage(dataURL) {
            // Create a link element
            var link = document.createElement('a');
            link.href = dataURL;
            link.download = 'map_image.png'; // Set the file name
            document.body.appendChild(link);
            link.click(); // Trigger the download
            document.body.removeChild(link); // Clean up
        }
        // Call the function to download the image when the map loads
        downloadMapImage(content);
    }
    const handleDistrictChange = (event) => {
        const selectedDistrict = event.target.value;
        setSelectedDistrict(selectedDistrict);

        setMandalList([...new Set(revenueGeojson.features.filter(feature => feature.properties.District === selectedDistrict).map(feature => feature.properties.Mandal))]);

        // Find the feature with the selected village
        const selectedFeature = districtGeojson.features.find(feature => feature.properties.District === selectedDistrict.toUpperCase());
        // console.log(selectedFeature)
        // If feature found, move map to its location
        if (selectedFeature) {
            moveMapToBounds(selectedFeature)
            // You would need to implement this part depending on how you want to handle zooming
            // You might need to access the map instance directly if using Mapbox GL JS
        }
    };
    const handleMandalChange = (event) => {
        const selectedMandal = event.target.value;
        setSelectedMandal(selectedMandal);

        setVillagesList([...new Set(revenueGeojson.features.filter(feature => feature.properties.Mandal === selectedMandal).map(feature => feature.properties.Site_Name))]);

        // Find the feature with the selected village
        const selectedFeature = mandalGeojson.features.find(feature => feature.properties.Mandal === selectedMandal);


        // console.log(selectedFeature)
        // If feature found, move map to its location
        if (selectedFeature) {
            moveMapToBounds(selectedFeature)
            // You would need to implement this part depending on how you want to handle zooming
            // You might need to access the map instance directly if using Mapbox GL JS
        }
    };
    const handleVillageChange = (event) => {
        const selectedVillage = event.target.value;
        setSelectedVillage(selectedVillage);

        // Find the feature with the selected village
        const selectedFeature = revenueGeojson.features.find(feature => feature.properties.Site_Name === selectedVillage);
        // console.log(selectedFeature)
        // If feature found, move map to its location
        if (selectedFeature) {
            moveMapToBounds(selectedFeature)
            // You would need to implement this part depending on how you want to handle zooming
            // You might need to access the map instance directly if using Mapbox GL JS
        }
    };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileExtension = file.name.split('.').pop().toLowerCase();
                if (fileExtension === 'geojson' || fileExtension === 'json') {
                    const geojsonData = JSON.parse(e.target.result);
                    addGeoJSONToMap(geojsonData);
                } else if (fileExtension === 'kml') {
                    const kmlData = new DOMParser().parseFromString(e.target.result, 'application/xml');
                    const geojsonData = kml(kmlData);
                    let tempGeojsonData = {
                        "type": "FeatureCollection",
                        "name": "HMDA_Sites",
                        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } }, ...geojsonData
                    }
                    addGeoJSONToMap(geojsonData);
                } else {
                    alert('Unsupported file type. Please upload a .geojson or .kml file.');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleFilter = () => {
        if (!revenueGeojson) return;
        let filteredData = { ...revenueGeojson };
        if (filterType === 'Site Name') {
            filteredData.features = revenueGeojson.features.filter(
                (feature) => feature.properties.Site_Name === filterValue
            );
        } else {
            const area = parseFloat(filterValue)
            filteredData.features = revenueGeojson.features.filter((feature) => {
                if (operator === '=') return parseFloat(feature.properties.Area) === area;
                if (operator === '<') return parseFloat(feature.properties.Area) < area;
                if (operator === '>') return parseFloat(feature.properties.Area) > area;
                return false;
            })
        }
        // console.log(filteredData)
        map.current.removeLayer('filteredSites')
        map.current.addLayer(
            new MapboxLayer({
                id: 'filteredSites',
                type: GeoJsonLayer,
                data: filteredData,
                pickable: true,
                stroked: true,
                filled: true,
                // extruded: true,
                lineWidthScale: 2,
                lineWidthMinPixels: 2,
                getFillColor: [255, 0, 0, 0.1],
                getLineColor: [255, 0, 0],
                getPointRadius: 100,
                getLineWidth: 4,
                getElevation: 30,
                onClick: (info, event) => {
                    let variable = { ...info.object }
                    setIdentifiedFeature(variable)
                }
            })
        )
    }
    const handleSetFilters = () => {
        setFilters([...filters, { filterType, operator, filterValue }])
    }
    const removeFilter = (index) => {
        let temp = filters
        delete filters[index]
        temp = temp.filter((element, number) => {
            return number !== index
        })
        setFilters([...temp])
    }
    useEffect(() => {
        if (map.current && map.current.isStyleLoaded()) {
            let filteredData = { ...revenueGeojson };
            filters.forEach((filter) => {
                revenueGeojson.features.filter((feature) => {
                    if (filter.filterType === 'Site Name') {
                        filteredData.features = revenueGeojson.features.filter(
                            (feature) => feature.properties.Site_Name === filterValue
                        );
                    } else {
                        const area = parseFloat(filterValue)
                        filteredData.features = revenueGeojson.features.filter((feature) => {
                            // console.log(feature.properties.Area, area)   
                            if (filter.operator === '=') return parseFloat(feature.properties.Area) === area;
                            if (filter.operator === '<') return parseFloat(feature.properties.Area) < area;
                            if (filter.operator === '>') return parseFloat(feature.properties.Area) > area;
                            return false;
                        })
                    }
                })
            })
            if (map.current.getLayer('filteredSites')) {
                map.current.removeLayer('filteredSites')
            }
            map.current.addLayer(
                new MapboxLayer({
                    id: 'filteredSites',
                    type: GeoJsonLayer,
                    data: filteredData,
                    pickable: true,
                    stroked: true,
                    filled: false,
                    // extruded: true,
                    lineWidthScale: 2,
                    lineWidthMinPixels: 2,
                    getFillColor: [255, 0, 0],
                    getLineColor: [255, 0, 0],
                    getPointRadius: 100,
                    getLineWidth: 4,
                    getElevation: 30,
                    onClick: (info, event) => {
                        let variable = { ...info.object }
                        setIdentifiedFeature(variable)
                    }
                })
            )
            if (filters.length <= 0) {
                map.current.removeLayer('filteredSites')
            }
        }
    }, [filters])
    const handleClearFilter = () => {
        setFilterType('')
        setOperator('')
        setFilterValue('')
        map.current.removeLayer('filteredSites')
    }
    function addGeoJSONToMap(geoJSONData) {
        // if (map.current.getSource('uploadedGeoJSON')) {
        //     map.current.getSource('uploadedGeoJSON').setData(geoJSONData);
        // } else {
        map.current.removeLayer('uploadedGeoJSON')
        map.current.addLayer(
            new MapboxLayer({
                id: 'uploadedGeoJSON',
                type: GeoJsonLayer,
                data: geoJSONData,
                pickable: false,
                stroked: true,
                filled: false,
                extruded: false,
                lineWidthScale: 1,
                lineWidthMinPixels: 2,
                getFillColor: [255, 0, 0],
                getLineColor: [33, 66, 77],
                getPointRadius: 15,
                getLineWidth: 8,
                // getElevation: 30,
                // onClick: (info, event) => {
                //     if (isSelect) {
                //         console.log(info.layer.props.data); props.setTableData(info.object);
                //         moveMapToBounds(info.object)
                //     }
                // }
            }));
        // }
        // Adjust the map to fit the bounds of the new data
        const bounds = new mapboxgl.LngLatBounds();
        geoJSONData.features.forEach((feature) => {
            const coordinates = feature.geometry.coordinates;
            if (feature.geometry.type === 'Point') {
                bounds.extend(coordinates);
            } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiPoint') {
                coordinates.forEach(coord => bounds.extend(coord));
            } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiLineString') {
                coordinates.forEach(ring => ring.forEach(coord => bounds.extend(coord)));
            } else if (feature.geometry.type === 'MultiPolygon') {
                coordinates.forEach(polygon => polygon.forEach(ring => ring.forEach(coord => bounds.extend(coord))));
            }
        });
        if (bounds.isEmpty()) {
            map.current.setCenter([0, 0]);
            map.current.setZoom(2);
        } else {
            map.current.fitBounds(bounds, { padding: 20 });
        }
    }
    useEffect(() => {
        let FetchData = async () => {
            // fetch('\\hmdaData\\RevenueBoundary.geojson')
            fetch('\\hmdaData\\HMDA_Sites.geojson')
                .then((response) => response.json())
                .then((json) => {
                    setHmdaSitesGeojson(json)
                    setRevenueGeojson(json)
                    // setDistrictList([...new Set(json.features.map(feature => feature.properties.District))])
                    setDistrictList([...new Set(json.features.map(feature => feature.properties.District))])
                    setAllSitesList([...new Set(json.features.map(feature => feature.properties.Site_Name))])
                    // setMandalList([...new Set(json.features.map(feature => feature.properties.Mandal))]);
                    // setVillagesList([...new Set(json.features.map(feature => feature.properties.Village))]);
                })
            fetch('\\hmdaData\\Mandal Boundaries.geojson')
                .then((response) => response.json())
                .then((json) => {
                    setMandalGeojson(json)
                })
            fetch('\\hmdaData\\districts.geojson')
                .then((response) => response.json())
                .then((json) => {
                    setDistrictGeojson(json)
                })
        }
        FetchData()


    }, [])

    const handleFeatureChange = (event) => {
        const selectedPropertyName = event.target.value;
        const selectedFeature = revenueGeojson.features.find(feature => feature.properties.Base_Sy_No === selectedPropertyName);
        if (selectedFeature) {
            // Zoom to the selected feature
            // You would need to implement this part depending on how you want to handle zooming
            // You might need to access the map instance directly if using Mapbox GL JS
            props.setTableData(selectedFeature)
            moveMapToBounds(selectedFeature)
        }
        setSelectedFeature(selectedFeature);
    };

    mapboxgl.accessToken = 'pk.eyJ1IjoicmFodWxwNzMiLCJhIjoiY2x4ZDM1dGluMDFwcTJyc2NsZjEzbXpmdyJ9.Nxi96go6hc0hC68skxGTNQ'

    const getCentroid = (feature) => {
        const centroidPoint = turf.centroid(feature);
        return centroidPoint.geometry.coordinates;
    };

    useEffect(() => {
        if (map.current) return;
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            // style: 'mapbox://styles/mapbox/streets-v11',
            style: 'mapbox://styles/mapbox/satellite-v9',
            // style: 'mapbox://styles/mapbox/satellite-streets-v12',
            center: [lng, lat],
            zoom: zoom,
            attributionControl: false,
            preserveDrawingBuffer: true
        })
        // map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-left')
        // map.current.addControl(new mapboxgl.FullscreenControl(), 'bottom-left')
        // map.current.touchZoomRotate.enable()
        // map.current.touchZoomRotate.enableRotation()
        map.current.dragRotate.disable()
        map.current.touchZoomRotate.disableRotation()
        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4))
            setLat(map.current.getCenter().lat.toFixed(4))
            setZoom(map.current.getZoom().toFixed(2))
        })
        map.current.on('load', () => {
            map.current.addSource('raster-tileset', {
                type: 'raster',
                url: 'mapbox://rahulp73.4wiviugg', // Replace with your tileset ID
                tileSize: 256
            });

            // Add a layer to display the raster tileset
            map.current.addLayer({
                id: 'raster-layer',
                type: 'raster',
                source: 'raster-tileset',
                layout: {
                    visibility: 'none' // Set initial visibility to 'none'
                },
                paint: {}
            });
            (async () => {
                async function AddRemoveLayer(Layer) {
                    if (map.current) {
                        try {
                            if (Layer.layer) {
                                if (!map.current.getLayer(Layer.title)) {
                                    console.log(`Adding layer: ${Layer.title}`);
                                    const response = await fetch(`\\hmdaData\\${Layer.layer}.geojson`);
                                    const json = await response.json();
                                    map.current.addLayer(
                                        new MapboxLayer({
                                            id: Layer.title,
                                            type: GeoJsonLayer,
                                            data: json,
                                            pickable: true,
                                            stroked: true,
                                            filled: Layer.filled,
                                            lineWidthScale: 2,
                                            lineWidthMinPixels: 1,
                                            getFillColor: Layer.fillColor || (d => {
                                                const featureType = d.properties.Land_Use; // Adjust the key based on your GeoJSON properties
                                                return featureColorMapping[featureType] || [255, 255, 255]; // Default color if type not found
                                            }),
                                            getLineColor: Layer.lineColor || (d => {
                                                const featureType = d.properties.Land_Use; // Adjust the key based on your GeoJSON properties
                                                return featureColorMapping[featureType] || [255, 255, 255]; // Default color if type not found
                                            }),
                                            getPointRadius: Layer.pointRadius,
                                            getLineWidth: Layer.lineWidth || 2,
                                            // getElevation: 30,
                                            onClick: (info, event) => {
                                                let variable = { ...info.object };
                                                setIdentifiedFeature(variable);
                                            },
                                        })
                                    );
                                    map.current.setLayoutProperty(
                                        Layer.title,
                                        'visibility',
                                        'none'
                                    );
                                }
                            }
                        } catch (err) {
                            console.log(err);
                            // setFeedback(true);
                        }
                    }
                }

                function iterateLayers(layers) {
                    layers.forEach(layer => {
                        if (Array.isArray(layer)) {
                            iterateLayers(layer);
                        } else {
                            AddRemoveLayer(layer);
                            if (layer.subLayers) {
                                iterateLayers(layer.subLayers);
                            }
                        }
                    });
                }

                iterateLayers([
                    {
                        title: 'District Boundaries',
                        layer: 'District Boundaries',
                        lineColor: [255, 0, 0], // Red
                        type: 'boundary',
                        filled: false,
                        lineWidth: 12, // Thicker line
                        toggleValue: false
                    },
                    {
                        title: 'Mandal Boundaries',
                        layer: 'Mandal Boundaries',
                        lineColor: [0, 255, 0], // Green
                        type: 'boundary',
                        filled: false,
                        lineWidth: 8, // Thinner line
                        toggleValue: false
                    },
                    {
                        title: 'Villages',
                        parentDrop: false,
                        toggleValue: false,
                        subLayers: [
                            {
                                title: 'Gosala',
                                parentDrop: false,
                                toggleValue: false,
                                subLayers: [
                                    {
                                        title: 'GosalaCadestral',
                                        layer: 'gosalaPolygons',
                                        lineColor: [0, 0, 255], // Blue
                                        type: 'boundary',
                                        filled: false,
                                        lineWidth: 6, // Medium line
                                        toggleValue: false
                                    },
                                    {
                                        title: 'GosalaNationalHighway',
                                        layer: 'gosalaNH',
                                        lineColor: [255, 165, 0], // Orange
                                        type: 'boundary',
                                        filled: false,
                                        lineWidth: 10, // Thicker line
                                        toggleValue: false
                                    },
                                    {
                                        title: 'GosalaDistrictRoads',
                                        layer: 'gosalaDR',
                                        lineColor: [34, 139, 34], // Forest green
                                        type: 'boundary',
                                        filled: false,
                                        lineWidth: 7, // Thinner line
                                        toggleValue: false
                                    },
                                    {
                                        title: 'GosalaVillageRoads',
                                        layer: 'gosalaVR',
                                        lineColor: [255, 20, 147], // Deep pink
                                        type: 'boundary',
                                        filled: false,
                                        lineWidth: 6, // Medium line
                                        toggleValue: false
                                    },
                                    {
                                        title: 'GosalaHouseAreaCover',
                                        layer: 'gosalaHouse',
                                        fillColor: [80, 80, 80, 100], // Deep sky blue
                                        type: 'boundary',
                                        filled: true,
                                        lineWidth: 1, // Thinner line
                                        toggleValue: false
                                    }
                                ]
                            },
                            {
                                title: 'Kankipadu',
                                parentDrop: false,
                                toggleValue: false,
                                subLayers: [
                                    {
                                        title: 'KankipaduCadestral',
                                        layer: 'kankipaduPolygons',
                                        lineColor: [75, 0, 130], // Indigo
                                        type: 'boundary',
                                        filled: false,
                                        lineWidth: 8, // Thinner line
                                        toggleValue: false
                                    },
                                    {
                                        title: 'KankipaduNationalHighway',
                                        layer: 'kankipaduNH',
                                        lineColor: [255, 69, 0], // Red-orange
                                        type: 'boundary',
                                        filled: false,
                                        lineWidth: 9, // Medium line
                                        toggleValue: false
                                    },
                                    {
                                        title: 'KankipaduDistrictRoads',
                                        layer: 'kankipaduDR',
                                        lineColor: [34, 139, 34], // Forest green
                                        type: 'boundary',
                                        filled: false,
                                        lineWidth: 7, // Thinner line
                                        toggleValue: false
                                    },
                                    {
                                        title: 'KankipaduVillageRoads',
                                        layer: 'kankipaduVR',
                                        lineColor: [255, 20, 147], // Deep pink
                                        type: 'boundary',
                                        filled: false,
                                        lineWidth: 6, // Medium line
                                        toggleValue: false
                                    },
                                    {
                                        title: 'KankipaduHouseAreaCover',
                                        layer: 'kankipaduHouse',
                                        fillColor: [80, 80, 80, 100], // Deep sky blue
                                        type: 'boundary',
                                        filled: true,
                                        lineWidth: 1, // Thinner line
                                        toggleValue: false
                                    },{
                                        title: 'KankipaduMarketPrice',
                                        layer: 'kankipaduPolygons',
                                        // fillColor: feature, // Indigo
                                        lineColor:[90,90,90],
                                        type: 'fill',
                                        filled: true,
                                        lineWidth: 1, // Thinner line
                                        toggleValue: false,
                                        // getFillColor: d=>{return [parseInt(d.properties.FID),0,0]}
                                        // => {
                                        //     // console.log(d.properties.COMP_FLOOR1 + ' ' + (d.properties['COMP_FLOOR1'] - 1800) / 1000 * 255)
                                        //     // return [255,0,0]
                        
                                        //     return [((d.properties['COMP_FLOOR1'] - 1800) / 1000) * 255, 0, 0]; // Default color if type not found
                                        // }
                                    }
                                ]
                            }
                        ]
                    },
                ]);
            })();
        });
        const draw = new MapboxDraw({
            displayControlsDefault: false,
            styles: [
                {
                    id: 'gl-draw-line',
                    type: 'line',
                    filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
                    layout: {
                        'line-cap': 'round',
                        'line-join': 'round',
                    },
                    paint: {
                        'line-color': '#438EE4',
                        'line-dasharray': [0.2, 2],
                        'line-width': 4,
                        'line-opacity': 0.7,
                    },
                },
                {
                    id: 'gl-draw-line-static',
                    type: 'line',
                    filter: ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
                    layout: {
                        'line-cap': 'round',
                        'line-join': 'round',
                    },
                    paint: {
                        'line-color': '#000',
                        'line-width': 2,
                    },
                },
                {
                    id: 'gl-draw-polygon-fill',
                    type: 'fill',
                    filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                    paint: {
                        'fill-color': '#D20C0C',
                        'fill-outline-color': '#D20C0C',
                        'fill-opacity': 0.1,
                    },
                },
                {
                    id: 'gl-draw-polygon-stroke-active',
                    type: 'line',
                    filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
                    layout: {
                        'line-cap': 'round',
                        'line-join': 'round',
                    },
                    paint: {
                        'line-color': '#D20C0C',
                        'line-width': 2,
                    },
                },
                {
                    id: 'gl-draw-polygon-fill-static',
                    type: 'fill',
                    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
                    paint: {
                        'fill-color': '#404040',
                        'fill-outline-color': '#404040',
                        'fill-opacity': 0.1,
                    },
                },
                {
                    id: 'gl-draw-polygon-stroke-static',
                    type: 'line',
                    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
                    layout: {
                        'line-cap': 'round',
                        'line-join': 'round',
                    },
                    paint: {
                        'line-color': '#404040',
                        'line-width': 2,
                    },
                },
            ],
        });
        drawRef.current = draw;
        // map.current.addControl(draw);

        const updateMeasurements = (e) => {
            const data = draw.getAll();
            const distanceElement = document.getElementById('calculated-distance');
            const areaElement = document.getElementById('calculated-area');

            if (data.features.length > 0) {
                const feature = data.features[0];

                if (feature.geometry.type === 'LineString') {
                    const distance = turf.length(feature);
                    distanceElement.innerHTML = `${distance.toFixed(2)} km`;
                    areaElement.innerHTML = ''; // Clear area display
                } else if (feature.geometry.type === 'Polygon') {
                    const area = turf.area(feature);
                    const areaInSqKm = (area / 1000000).toFixed(2);
                    areaElement.innerHTML = `${areaInSqKm} km²`;
                    distanceElement.innerHTML = ''; // Clear distance display
                }
            } else {
                distanceElement.innerHTML = '';
                areaElement.innerHTML = '';
            }
        };

        map.current.on('draw.create', updateMeasurements);
        map.current.on('draw.update', updateMeasurements);
        // map.current.on('draw.delete', updateMeasurements);
    })
    useEffect(() => {
        if (zoom >= 12 && !map.current.getLayer('textLayer')) {
            map.current.addLayer(
                new MapboxLayer({
                    id: 'textLayer',
                    type: TextLayer,
                    data: hmdaSitesGeojson.features.map(f => ({
                        coordinates: getCentroid(f),
                        name: f.properties.Site_Name
                    })),
                    getPosition: d => d.coordinates,
                    getText: d => d.name,
                    getSize: 16,
                    getColor: [0, 0, 0, 255],
                    getAngle: 0,
                    getTextAnchor: 'middle',
                    getAlignmentBaseline: 'center'
                })
            )
        } else if (zoom < 12 && map.current.getLayer('textLayer')) {
            map.current.removeLayer('textLayer')
        }
    }, [zoom])
    useEffect(() => {
        if (map.current && map.current.isStyleLoaded()) {
            map.current.setLayoutProperty(
                'raster-layer',
                'visibility',
                props.satellite ? 'visible' : 'none'
            );
        }
    }, [props.satellite]);
    useEffect(() => {
        // if(map.current && map.current.isStyleLoaded()){
        //     map.current.getSource('raster-tileset').setUrl(props.urls)
        // }
        console.log(props.urls)
    }, [props.urls])
    const handleDrawLine = () => {
        if (!map.current.hasControl(drawRef.current)) {
            map.current.addControl(drawRef.current);
        }
        setIsArea(false)
        setIsDrawing(true)
        handleDelete()
        drawRef.current.changeMode('draw_line_string');
        setIsDragPan(true)
    };

    const handleDrawPolygon = () => {
        if (!map.current.hasControl(drawRef.current)) {
            map.current.addControl(drawRef.current);
        }
        setIsDrawing(false)
        setIsArea(true)
        handleDelete()
        drawRef.current.changeMode('draw_polygon');
        setIsDragPan(true)
    };

    const handleDelete = () => {
        const data = drawRef.current.getAll();
        if (data.features.length > 0) {
            drawRef.current.deleteAll();
            document.getElementById('calculated-distance').innerHTML = '';
            document.getElementById('calculated-area').innerHTML = '';
        }
    };
    const handleLineClose = async () => {
        map.current.removeControl(drawRef.current)
        // map.current.dragRotate.disable();
        // map.current.touchZoomRotate.disableRotation();
        // handleDelete()
        document.getElementById('calculated-distance').innerHTML = '';
        setIsDrawing(false)
        setIsDragPan(true)
    }
    const handleAreaClose = () => {
        map.current.removeControl(drawRef.current)
        // map.current.dragRotate.disable();
        // map.current.touchZoomRotate.disableRotation();
        // handleDelete()
        document.getElementById('calculated-area').innerHTML = '';
        setIsArea(false)
        setIsDragPan(true)
    }
    const handleZoomIn = () => {
        map.current.flyTo({
            zoom: map.current.getZoom() + 1, // Zoom in by one level
            essential: true // This animation is considered essential and will not be cancelled by user interactions
        });
    }
    const handleZoomOut = () => {
        map.current.flyTo({
            zoom: map.current.getZoom() - 1, // Zoom in by one level
            essential: true // This animation is considered essential and will not be cancelled by user interactions
        });
    }
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!document.fullscreenElement) {
            document.getElementById('map-container').requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };
    const setCenter = () => {
        map.current.flyTo({
            center: [long, lati],
            zoom: 8,
            essential: true
        })
    }
    const changeDragPan = () => {
        setIsDragPan(!isDragPan)
    }
    const changeSelect = () => {
        setIsSelect(!isSelect)
    }

    // ============================================
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    // const drawRef = useRef(null);
    const popupRef = useRef(null);
    const [areaDisplay, setAreaDisplay] = useState('');
    // const [isDrawing, setIsDrawing] = useState(false);
  
    useEffect(() => {
      if (mapContainerRef.current && !mapRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [-74.5, 40], // Replace with your coordinates
          zoom: 9,
        });
  
        mapRef.current.on('load', () => {
          drawRef.current = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
              polygon: true,
              trash: true,
            },
          });
          mapRef.current.addControl(drawRef.current);
  
          mapRef.current.on('draw.create', showPopupWithArea);
          mapRef.current.on('draw.delete', clearPopup);
          mapRef.current.on('draw.update', showPopupWithArea);
        });
      }
  
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
        }
      };
    }, []);
  
    function showPopupWithArea(e) {
      const data = drawRef.current.getAll();
      if (data.features.length > 0) {
        const latestFeature = data.features[data.features.length - 1];
        const area = turf.area(latestFeature);
        const center = turf.centerOfMass(latestFeature).geometry.coordinates;
  
        const formattedArea =
          area >= 1000000 ? `${(area / 1000000).toFixed(2)} sq km` : `${Math.round(area * 100) / 100} sq meters`;
        setAreaDisplay(formattedArea);
  
        if (popupRef.current) {
          popupRef.current.remove();
        }
  
        popupRef.current = new mapboxgl.Popup()
          .setLngLat(center)
          .setHTML(`<p>Area: <strong>${formattedArea}</strong></p>`)
          .addTo(mapRef.current);
      } else {
        setAreaDisplay('');
        if (e.type !== 'draw.delete') alert('Click the map to draw a polygon.');
      }
    }
  
    function clearPopup() {
      setAreaDisplay('');
      if (popupRef.current) {
        popupRef.current.remove();
      }
    }
  
    const toggleDrawing = () => {
      if (drawRef.current) {
        // if (!isDrawing) {
        //   drawRef.current.changeMode('draw_polygon'); // Start drawing
        // } else {
        //   drawRef.current.changeMode('simple_select'); // Stop drawing
        // }
        setIsDrawing((prev) => !prev); // Toggle the isDrawing state
      } else {
        console.error('MapboxDraw has not been initialized.');
      }
    };

  

    useEffect(() => {
        if (isDragPan) {
            map.current.dragPan.enable()
        } else {
            map.current.dragPan.disable()
        }
    }, [isDragPan])
    function moveMapToBounds(json) {
        var bounds = new mapboxgl.LngLatBounds();
        // console.log(json)
        if (json.geometry.type === 'Polygon') {
            json.geometry.coordinates[0].forEach(element => {


                bounds.extend(element);
            });
        } else if (json.geometry.type === 'MultiPolygon') {
            json.geometry.coordinates[0][0].forEach(element => {
                // console.log(element)
                bounds.extend(element);
            });
        }
        map.current.fitBounds(bounds)
    }
    useEffect(() => {
        function AddRemoveLayer(Layer) {
            if (map.current && map.current.isStyleLoaded()) {
                try {
                    if (Layer.layer) {
                        if (Layer.toggleValue) {
                            if (map.current.getLayer(Layer.title)) {
                                console.log(`Adding layer: ${Layer.title} ${Layer.toggleValue}`);
                                map.current.setLayoutProperty(
                                    Layer.title,
                                    'visibility',
                                    'visible'
                                );
                            }
                        } else {
                            if (map.current.getLayer(Layer.title)) {
                                map.current.setLayoutProperty(
                                    Layer.title,
                                    'visibility',
                                    'none'
                                );
                            }
                        }
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        }

        function iterateLayers(layers) {
            layers.forEach(layer => {
                if (Array.isArray(layer)) {
                    iterateLayers(layer);
                } else {
                    AddRemoveLayer(layer);
                    if (layer.subLayers) {
                        iterateLayers(layer.subLayers);
                    }
                }
            });
        }

        iterateLayers(props.masterLayers);
    }, [props.masterLayers])
    // useEffect(() => {
    //     // console.log([props.masterLayers])
    //     const fetchData = async () => {
    //         try {
    //             if (map.current) {
    //                 map.current.removeLayer(props.masterLayers[0].layer + 'Master');

    //                 if (props.masterLayers[0].toggleValue) {
    //                     let selectedFile1 = '\\hmdaData\\' + props.masterLayers[0].layer + '.geojson';

    //                     console.log(selectedFile1)
    //                     fetch(selectedFile1)
    //                         .then((response) => response.json())
    //                         .then((json) => {
    //                             console.log(json)
    //                             if (selectedFile1 === '\\hmdaData\\EnjoymentBoundary.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 1,
    //                                         getFillColor: (json) => {
    //                                             // let layer = props.masterLayers[0].layer
    //                                             let layer = json.properties['Lable']//[0].layer;
    //                                             console.log(json.properties)

    //                                             console.log(json.properties['Lable'])
    //                                             if (layer === 'Encroched Land') return [240, 240, 10, 50] //'Forest', 'Railway', 'Road', 'WaterBodies'
    //                                             else if (layer === "Occupiad Land") return [167, 38, 181, 50]
    //                                             else return [9, 250, 7, 10] //'Forest', 'Railway', 'Road', 'WaterBodies'
    //                                         },
    //                                         getLineColor: (json) => {
    //                                             // let layer = props.masterLayers[0].layer
    //                                             let layer = json.properties['Lable']//[0].layer;
    //                                             console.log(json.properties)

    //                                             console.log(json.properties['Lable'])
    //                                             if (layer === 'Encroched Land') return [240, 240, 10, 250] //'Forest', 'Railway', 'Road', 'WaterBodies'
    //                                             else if (layer === "Occupiad Land") return [167, 38, 181, 250]
    //                                             else return [9, 250, 7, 250] //'Forest', 'Railway', 'Road', 'WaterBodies'
    //                                         },
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 2,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }
    //                                         }

    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\RevenueBoundary.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [200, 90, 1, 90],
    //                                         getLineColor: [200, 0, 0],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 8,
    //                                         getElevation: 30,
    //                                         // getText: (json) => json.properties.Base_Sy_No
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }
    //                                         }

    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\TryJunctionPoints.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: false,
    //                                         filled: false,
    //                                         extruded: true,
    //                                         lineWidthScale: 20,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [0, 0, 0],
    //                                         getPointRadius: 25,
    //                                         getLineWidth: 8,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }
    //                                         }
    //                                     })
    //                                 );
    //                             }

    //                             else if (selectedFile1 === '\\hmdaData\\RevenueBoundaryPoints.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: false,
    //                                         filled: false,
    //                                         extruded: true,
    //                                         lineWidthScale: 20,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [0, 0, 0],
    //                                         getPointRadius: 15,
    //                                         getLineWidth: 8,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }
    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\EnjoymentBoundaryPoints.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: false,
    //                                         filled: false,
    //                                         extruded: true,
    //                                         lineWidthScale: 20,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [0, 0, 0],
    //                                         getPointRadius: 8,
    //                                         getLineWidth: 8,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }
    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\districts.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 6,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [102, 51, 153],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 12,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }
    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\SOI_Referene_Points.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: true,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [79, 255, 127],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 8,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }
    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\village_tri_bi_junctions.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: true,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [255, 0, 0],
    //                                         getPointRadius: 4,
    //                                         getLineWidth: 8,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }
    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\tertiary_points.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: false,
    //                                         filled: true,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [255, 255, 0],
    //                                         getPointRadius: 5,
    //                                         getLineWidth: 8,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }
    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\HMDA_Sites.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: true,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [255, 0, 0],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 4,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             let variable = { ...info.object }
    //                                             setIdentifiedFeature(variable)
    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\ClustersAsPerSOI.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [178, 212, 255],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 4,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }
    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\District_Boundaries.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 5,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [255, 0, 197],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 8,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }
    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\village_boundary.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [205, 35, 255],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 2,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }
    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\Mandal_Boundaries.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [0, 112, 255],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 6,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }

    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\District Boundaries.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 10,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [255, 0, 0, 0.1],
    //                                         getLineColor: [240, 245, 241],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 20,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }

    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\Ground Control Points.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: true,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [152, 125, 183],
    //                                         getLineColor: [152, 125, 183],
    //                                         getPointRadius: 8,
    //                                         getLineWidth: 8,
    //                                         getElevation: 30,
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\HMDA Sites.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [225, 89, 137],
    //                                         getLineColor: [225, 89, 137],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 4,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             let variable = { ...info.object }
    //                                             setIdentifiedFeature(variable)
    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\Hyderabad Mandal Boundaries.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [196, 60, 57],
    //                                         getLineColor: [196, 60, 57],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 4,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             let variable = { ...info.object }
    //                                             setIdentifiedFeature(variable)
    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\Land Classification Boundary Point.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: false,
    //                                         filled: true,
    //                                         extruded: true,
    //                                         lineWidthScale: 20,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [229, 182, 54],
    //                                         getLineColor: [229, 182, 54],
    //                                         getPointRadius: 50,
    //                                         getLineWidth: 8,
    //                                         getElevation: 30
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\Land Classification Boundary.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: d => {
    //                                             const featureType = d.properties.Land_Use; // Adjust the key based on your GeoJSON properties
    //                                             return featureColorMapping[featureType] || [255, 255, 255]; // Default color if type not found
    //                                         },
    //                                         getLineColor: d => {
    //                                             const featureType = d.properties.Land_Use; // Adjust the key based on your GeoJSON properties
    //                                             return featureColorMapping[featureType] || [0, 0, 0]; // Default color if type not found
    //                                         },
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 6,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }

    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\Land Parcel Boundary as per Revenue Record.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [190, 178, 151],
    //                                         getLineColor: [190, 178, 151],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 6,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }

    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\Land Parcel Boundary Point as per Revenue Record.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: false,
    //                                         filled: true,
    //                                         extruded: true,
    //                                         lineWidthScale: 20,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [164, 113, 88],
    //                                         getLineColor: [164, 113, 88],
    //                                         getPointRadius: 20,
    //                                         getLineWidth: 8,
    //                                         getElevation: 30
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\Mandal Boundaries.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getFillColor: [114, 155, 111],
    //                                         getLineColor: [240, 245, 241],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 15,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }

    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                             else if (selectedFile1 === '\\hmdaData\\Village Boundaries.geojson') {
    //                                 map.current.addLayer(
    //                                     new MapboxLayer({
    //                                         id: props.masterLayers[0].layer + 'Master',
    //                                         type: GeoJsonLayer,
    //                                         data: json,
    //                                         pickable: true,
    //                                         stroked: true,
    //                                         filled: false,
    //                                         // extruded: true,
    //                                         lineWidthScale: 2,
    //                                         lineWidthMinPixels: 2,
    //                                         getLineDashArray: [4, 2],  // Dash pattern: 4 pixels on, 2 pixels off
    //                                         getFillColor: [141, 90, 153],
    //                                         getLineColor: [171, 176, 172],
    //                                         getPointRadius: 100,
    //                                         getLineWidth: 1,
    //                                         getElevation: 30,
    //                                         onClick: (info, event) => {
    //                                             if (isSelect) {
    //                                                 console.log(info.layer.props.data); props.setTableData(info.object);
    //                                                 moveMapToBounds(info.object)
    //                                             }

    //                                         }
    //                                     })
    //                                 );
    //                             }
    //                         })
    //                 }
    //             }
    //         } catch (error) {
    //             // console.error('Error fetching or processing GeoJSON:', error);
    //         }
    //     };
    //     fetchData();
    // }, [props.masterLayers])
    useEffect(() => {

        const groupBySyStatus = (data) => {
            const result = {};

            data.features.forEach(feature => {
                const { Sy_Status, T_Extent, T_U_Extent, Un_U_Area } = feature.properties;

                // Parse float values and handle nulls
                const tExtent = T_Extent !== null ? parseFloat(T_Extent) : 0;
                const tUExtent = T_U_Extent !== null ? parseFloat(T_U_Extent) : 0;
                const unUArea = Un_U_Area !== null ? parseFloat(Un_U_Area) : 0;

                if (!result[Sy_Status]) {
                    result[Sy_Status] = {
                        count: 0,
                        T_Extent: 0,
                        T_U_Extent: 0,
                        Un_U_Area: 0
                    };
                }
                result[Sy_Status].count += 1;
                result[Sy_Status].T_Extent += tExtent;
                result[Sy_Status].T_U_Extent += tUExtent;
                result[Sy_Status].Un_U_Area += unUArea;
            });

            return result;
        };

        const fetchDashboardData = async () => {
            const response = await fetch(`\\hmdaData\\HMDA_Land_Digital_Survey.geojson`);
            const json = await response.json();
            const data = groupBySyStatus(json)
            setDashboardDetails(data)
        }
        fetchDashboardData()
    }, [])
    return (
        <>
            {/* <div id='map-container' style={{ position: 'relative', height: '400px' }} ref={mapContainer}> */}
            <div style={{ padding: 3, paddingRight: 4, zIndex: 10000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxHeight: 1000, borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* <Tooltip title='Dashboard' >
                        <IconButton sx={{ ...blackIcon }} onClick={() => { setIsDashboard(!isDashboard) }}><DashboardRounded /></IconButton>
                    </Tooltip> */}
                    <Tooltip title='Zoom In' >
                        <IconButton sx={{ ...blackIcon }} onClick={() => { handleZoomIn() }}><ZoomInRounded /></IconButton>
                    </Tooltip>
                    <Tooltip title='Zoom Out'>
                        <IconButton sx={{ ...blackIcon }} onClick={() => { handleZoomOut() }}><ZoomOutRounded /></IconButton>
                    </Tooltip>
                    <Tooltip title='Center'>
                        <IconButton sx={{ ...blackIcon }} onClick={() => { setCenter() }}><SettingsOverscanRounded /></IconButton>
                    </Tooltip>
                    <Tooltip title='Pan'>
                        <IconButton sx={{ ...blackIcon }} onClick={() => { changeDragPan() }}><PanToolRounded sx={{ color: isDragPan ? '#2d9ae3' : 'initial' }} /></IconButton>
                    </Tooltip>
                    <Tooltip title='Select'>
                        <IconButton sx={{ ...blackIcon }} onClick={() => { changeSelect() }} ><HighlightAltRounded sx={{ color: isSelect ? '#2d9ae3' : 'initial' }} /></IconButton>
                    </Tooltip>
                    <Tooltip title='Select'>
                        <IconButton sx={{ ...blackIcon }} onClick={() => { toggleDrawing() }}  disabled={!drawRef.current}>
                        {isDrawing ? <EditLocationAltIcon sx={{ color: isSelect ? '#2d9ae3' : 'initial' }} /> : <EditLocationIcon sx={{ color: isSelect ? '#2d9ae3' : 'initial' }} />}
                          </IconButton>
                          
                    </Tooltip>
                    <Tooltip title='Add Layer' sx={{ display: 'flex', flexWrap: 'nowrap' }}>
                        <IconButton onClick={handleClick} sx={{ ...blackIcon }}><Queue aria-controls={open ? 'long-menu' : undefined} aria-expanded={open ? 'true' : undefined} /></IconButton>
                    </Tooltip>
                    <Menu
                        id="long-menu"
                        MenuListProps={{
                            'aria-labelledby': 'long-button',
                        }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        PaperProps={{
                            style: {
                                maxHeight: ITEM_HEIGHT * 4.5,
                                width: '20ch',
                            },
                        }}
                    >
                        <MenuItem sx={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
                            <Button
                                component="label"
                                role={undefined}
                                variant="text"
                                tabIndex={-1}
                                sx={{ width: '100%', color: 'black' }}
                                startIcon={<CloudUploadRounded />}
                            >
                                GeoJSON
                                <VisuallyHiddenInput onChange={handleFileChange} type="file" />
                            </Button>
                        </MenuItem>
                        <MenuItem sx={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
                            <Button
                                component="label"
                                role={undefined}
                                variant="text"
                                tabIndex={-1}
                                sx={{ width: '100%', color: 'black' }}
                                startIcon={<CloudUploadRounded />}
                            >
                                KML
                                <VisuallyHiddenInput onChange={handleFileChange} type="file" />
                            </Button>
                        </MenuItem>
                        <MenuItem sx={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
                            <Button
                                component="label"
                                role={undefined}
                                variant="text"
                                tabIndex={-1}
                                sx={{ width: '100%', color: 'black' }}
                                onClick={() => {
                                    if (map.current.getLayer('uploadedGeoJSON')) {
                                        map.current.removeLayer('uploadedGeoJSON')
                                    }
                                }}
                            >
                                Clear
                            </Button>
                        </MenuItem>
                        {/* {options.map((option) => (
                            <MenuItem key={option} onClick={() => { handleDialogSelect(option) }}>
                                {option}
                            </MenuItem>
                        ))} */}
                    </Menu>
                    <Tooltip title='Scale'>
                        <IconButton sx={{ ...blackIcon }} onClick={() => handleDrawLine()}><StraightenRounded /></IconButton>
                    </Tooltip>
                    <Tooltip title='Measure Area'>
                        <IconButton sx={{ ...blackIcon }} onClick={() => handleDrawPolygon()}><SquareFootRounded /></IconButton>
                    </Tooltip>
                    <Tooltip title='Print'>
                        <IconButton sx={{ ...blackIcon }} onClick={() => { handlePrint() }}><PrintRounded /></IconButton>
                    </Tooltip>
                    <Tooltip title='Attribute Query'>
                        <IconButton sx={{ ...blackIcon }} onClick={() => { setIsFilter(!isFilter) }}><QueryBuilder /></IconButton>
                    </Tooltip>
                    {/* <Divider orientation='vertical' variant="middle" flexItem sx={{ color: 'black', marginRight: '2%', marginLeft: '1%' }} /> */}
                    {/* <Autocomplete
                        value={value}
                        onChange={(event, newValue) => {
                            const selectedFeature = revenueGeojson.features.find(feature => feature.properties.Site_Name === newValue);
                            console.log(selectedFeature)
                            // If feature found, move map to its location
                            if (selectedFeature) {
                                moveMapToBounds(selectedFeature)
                            }
                            setValue(newValue);
                        }}
                        size='small'
                        options={allSitesList}
                        sx={{ width: 270 }}
                        renderInput={(params) => <TextField {...params} label="Search Site" />}
                    /> */}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1%', cursor: 'pointer' }} onClick={() => { handleOptions() }}>
                        <ManageSearchRounded />
                        <Typography variant='p' noWrap component="div">Query</Typography>
                    </div> */}
                    {/* <Tooltip title='Logout'>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1%', cursor: 'pointer' }} onClick={() => { handleLogout() }}> */}
                    {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1%', cursor: 'pointer' }}> */}
                    {/* <Typography variant='p' noWrap component="div" sx={{ padding: 1 }}>Logout</Typography>
                            <Logout /> */}
                    {/* </div>
                    </Tooltip> */}
                </div>
            </div>
            <div id='map-container' style={{ height: '85vh', width: '100%' }} ref={mapContainer}>
                <div style={{ zIndex: 100, display: 'flex', flexDirection: 'column', position: 'absolute', left: 0, marginLeft: '0.5%', marginTop: '0.5%', borderRadius: 8, padding: '0.8%', background: isDrawing || isArea ? 'rgba(255, 255, 255, 0.85)' : '', width: '15%' }}>
                    <Collapse in={isDrawing} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Stack sx={{ textAlign: 'left' }}>
                                <Typography variant='h6' sx={{ fontSize: '1rem' }}><strong>Measure Distance</strong></Typography>
                                <Typography variant='caption'>Select points on map to draw a line</Typography>
                                <Typography variant='caption'>Line Distance:<Typography variant='h6' id='calculated-distance'></Typography></Typography>
                            </Stack>
                            <div>
                                <Button onClick={handleDelete}>Reset</Button>
                                <Button onClick={handleLineClose}>Close</Button>
                            </div>
                        </div>
                    </Collapse>
                    <Collapse in={isArea} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Stack sx={{ textAlign: 'left' }}>
                                <Typography variant='h6' sx={{ fontSize: '1rem' }}><strong>Measure Area</strong></Typography>
                                <Typography variant='caption'>Select points on map to draw a area</Typography>
                                <Typography variant='caption'>Area Measured:<Typography variant='h6' id='calculated-area'></Typography></Typography>
                            </Stack>
                            <div>
                                <Button onClick={handleDelete}>Reset</Button>
                                <Button onClick={handleAreaClose}>Close</Button>
                            </div>
                        </div>
                    </Collapse>
                </div>
                <div style={{ zIndex: 100, display: 'flex', flexDirection: 'column', position: 'absolute', left: 0, marginLeft: '20%', marginTop: '0.5%', borderRadius: 8, padding: '0.8%', background: isFilter ? 'rgba(255, 255, 255, 0.85)' : '' }}>
                    <Collapse in={isFilter} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant='h6'>Filters</Typography>
                                <div>
                                    <IconButton onClick={() => { setNewFilterToggle(true) }}><AddRounded /></IconButton>
                                    <IconButton onClick={() => { setIsFilter(false); setFilters([]) }}><CloseRounded /></IconButton>
                                </div>
                            </div>
                            <Divider />
                            <Stack direction='column' alignItems='center' sx={{ textAlign: 'left' }}>
                                {filters && filters.map((filter, index) => {
                                    return <Stack direction='row' key={index}>
                                        <FormControl size='small' sx={{ zIndex: 100, minWidth: 100, right: 0, marginTop: 0.5, marginRight: 0.5, backgroundColor: 'white', borderRadius: 2 }}>
                                            <InputLabel id="village-select-label">Attribute</InputLabel>
                                            <Select
                                                labelId="village-select-label"
                                                id="village-select"
                                                value={filter.filterType}
                                                disabled
                                            >
                                                <MenuItem value={'Site Name'}>
                                                    Site Name
                                                </MenuItem>
                                                <MenuItem value={'Area'}>
                                                    Area
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl size='small' sx={{ zIndex: 100, minWidth: 70, right: 0, marginTop: 0.5, marginRight: 0.5, backgroundColor: 'white', borderRadius: 2 }}>
                                            <InputLabel id="village-select-label">Operation</InputLabel>
                                            <Select
                                                labelId="village-select-label"
                                                id="village-select"
                                                value={filter.operator}
                                                disabled
                                            >
                                                {['=', '<', '>'].map(op => (
                                                    <MenuItem key={op} value={op}>
                                                        {op}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl size='small' sx={{ zIndex: 100, width: 100, right: 0, marginTop: 0.5, marginRight: 0.5, backgroundColor: 'white', borderRadius: 2 }}>
                                            <TextField value={filter.filterValue} label='Value' disabled size='small' />
                                        </FormControl>
                                        <IconButton onClick={() => removeFilter(index)}><RemoveRounded /></IconButton>
                                    </Stack>
                                })}
                                {(filters.length <= 0 || newFilterToggle) && <Stack direction='row'>
                                    <FormControl size='small' sx={{ zIndex: 100, minWidth: 100, right: 0, marginTop: 0.5, marginRight: 0.5, backgroundColor: 'white', borderRadius: 2 }}>
                                        <InputLabel id="village-select-label">Attribute</InputLabel>
                                        <Select
                                            labelId="village-select-label"
                                            id="village-select"
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                        >
                                            <MenuItem value={'Site Name'}>
                                                Site Name
                                            </MenuItem>
                                            <MenuItem value={'Area'}>
                                                Area
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl size='small' sx={{ zIndex: 100, minWidth: 70, right: 0, marginTop: 0.5, marginRight: 0.5, backgroundColor: 'white', borderRadius: 2 }}>
                                        <InputLabel id="village-select-label">Operation</InputLabel>
                                        <Select
                                            labelId="village-select-label"
                                            id="village-select"
                                            value={operator}
                                            onChange={(e) => { setOperator(e.target.value) }}
                                        // value={selectedMandal}
                                        // onChange={handleMandalChange}
                                        >
                                            {['=', '<', '>'].map(op => (
                                                <MenuItem key={op} value={op}>
                                                    {op}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl size='small' sx={{ zIndex: 100, width: 100, right: 0, marginTop: 0.5, marginRight: 0.5, backgroundColor: 'white', borderRadius: 2 }}>
                                        <TextField value={filterValue} label='Value' onChange={(e) => { setFilterValue(e.target.value) }} size='small' />
                                    </FormControl>
                                    <IconButton onClick={() => { handleSetFilters(); setNewFilterToggle(false) }}><DoneRounded /></IconButton>
                                    <IconButton onClick={() => { setNewFilterToggle(false) }}><CloseRounded /></IconButton>
                                </Stack>}
                            </Stack>
                        </div>
                    </Collapse>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', right: 0, marginTop: 0.5, marginRight: 0.5 }}>
                    {/* <Collapse in={isOptions} sx={{ display: 'flex', flexDirection: 'column' }}> */}
                    {/* <Stack>
                        <FormControl sx={{ zIndex: 100, minWidth: 200, maxWidth: 200, right: 0, marginTop: 0.5, marginRight: 0.5, backgroundColor: 'white', borderRadius: 2, textOverflow: 'ellipsis' }} size='small'>
                            <InputLabel id="village-select-label">Select District</InputLabel>
                            <Select
                                labelId="village-select-label"
                                id="village-select"
                                value={selectedDistrict}
                                onChange={handleDistrictChange}
                            >
                                {districtList && districtList.map(district => (
                                    <MenuItem key={district} value={district}>
                                        {district}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl sx={{ zIndex: 100, minWidth: 200, maxWidth: 200, right: 0, marginTop: 0.5, marginRight: 0.5, backgroundColor: 'white', borderRadius: 2, textOverflow: 'ellipsis' }} size='small'>
                            <InputLabel id="village-select-label">Select Mandal</InputLabel>
                            <Select
                                labelId="village-select-label"
                                id="village-select"
                                value={selectedMandal}
                                onChange={handleMandalChange}
                            >
                                {mandalList && mandalList.map(mandal => (
                                    <MenuItem key={mandal} value={mandal}>
                                        {mandal}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl sx={{ zIndex: 100, minWidth: 200, maxWidth: 200, right: 0, marginTop: 0.5, marginRight: 0.5, backgroundColor: 'white', borderRadius: 2, textOverflow: 'ellipsis' }} size='small'>
                            <InputLabel id="village-select-label">Select Land Parcel</InputLabel>
                            <Select
                                labelId="village-select-label"
                                id="village-select"
                                value={selectedVillage}
                                onChange={handleVillageChange}
                            >
                                {villagesList && villagesList.map(village => (
                                    <MenuItem key={village} value={village}>
                                        {village}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl sx={{ zIndex: 100, minWidth: 200, maxWidth: 200, right: 0, marginTop: 0.5, marginRight: 0.5, backgroundColor: 'white', borderRadius: 2, textOverflow: 'ellipsis' }} size='small'>
                            <Autocomplete
                                value={value}
                                onChange={(event, newValue) => {
                                    const selectedFeature = revenueGeojson.features.find(feature => feature.properties.Site_Name === newValue);
                                    // If feature found, move map to its location
                                    if (selectedFeature) {
                                        moveMapToBounds(selectedFeature)
                                    }
                                    setValue(newValue);
                                }}
                                size='small'
                                options={allSitesList}
                                sx={{ width: 270 }}
                                renderInput={(params) => <TextField {...params} label="Search Site" />}
                            />
                        </FormControl>
                    </Stack> */}
                    {/* </Collapse> */}
                </div>
                {hoverInfo.object && (
                    <div
                        style={{
                            position: 'absolute',
                            zIndex: 10,
                            pointerEvents: 'none',
                            left: hoverInfo.x,
                            top: hoverInfo.y,
                            background: 'rgba(255, 255, 255, 0.9)',
                            padding: '5px',
                            borderRadius: '5px',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {hoverInfo.object.properties.Name_of_the_lease}
                    </div>
                )}
                <Slide direction='right' in={isDashboard}>
                    <Box
                        sx={{
                            position: "absolute",
                            marginLeft: 0.5,
                            marginBottom: 0.5,
                            marginTop: 0.5,
                            left: 0,
                            top: 0,
                            zIndex: 100,
                            width: 950,
                        }}
                    >
                        <Paper sx={{ borderRadius: '8px' }}>
                            <Box sx={{ backgroundColor: 'rgba(148, 23, 0)', py: 1.5, borderRadius: '8px 8px 0px 0px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                    <Typography variant='h5' sx={{ color: 'white' }}>HMDA Lands' Digital Survey Status</Typography>
                                </div>
                                {/* <IconButton size='small' onClick={() => { setIsDashboard(false) }}><CloseRounded /></IconButton> */}
                            </Box>
                            <Divider sx={{ marginBottom: 1, borderTop: '1px solid white' }} flexItem />
                            <Box sx={{ p: 1.5, pt: 0 }}>
                                {(Object.keys(dashboardDetails)).map((key) => {
                                    return <><div key={key} style={{ padding: '10px 10px 10px 10px', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 3 }}><Typography variant='h6'><strong>{key}</strong></Typography><Typography variant='h6'><strong>{`${dashboardDetails[key].count} Sites/${dashboardDetails[key].T_Extent.toFixed(2)} Ac-Gt`}</strong></Typography></div>
                                        <Divider variant='middle' /></>
                                })}
                                {/* <div style={{ padding: '10px 10px 10px 10px', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 3 }}><Typography variant='h6'><strong>Ready for validation on Ground</strong></Typography><Typography variant='h6'>6568.52</Typography></div>
                                <Divider variant='middle' />
                                <div style={{ padding: '10px 10px 10px 10px', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 3 }}><Typography variant='h6'><strong>Survey not at initiated, Awaiting for Revenue records</strong></Typography><Typography variant='h6'>81.20</Typography></div>
                                <Divider variant='middle' />
                                <div style={{ padding: '10px 10px 10px 10px', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 3 }}><Typography variant='h6'><strong>Land boundary as per Revenue Record foxed, Awaiting for HMDA inputs</strong></Typography><Typography variant='h6'>629.99</Typography></div>
                                <Divider variant='middle' />
                                <div style={{ padding: '10px 10px 10px 10px', display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 3 }}><Typography variant='h6'><strong>Completed in all respects</strong></Typography><Typography variant='h6'>3665.16</Typography></div> */}
                            </Box>
                        </Paper>
                    </Box>
                </Slide>
            </div>
            <CustomizedSnackbars open={feedback} setOpen={setFeedback} />
            <div
        className="calculation-box"
        style={{
          height: 75,
          width: 150,
          position: 'absolute',
          bottom: 40,
          left: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 15,
          textAlign: 'center'
        }}
      >
        <p style={paragraphStyle}>Click the button to start drawing.</p>
        <div id="calculated-area">
          {areaDisplay && (
            <>
              <p style={paragraphStyle}>
                <strong>{areaDisplay}</strong>
              </p>
            </>
          )}
        </div>
      </div>

        </>
    )


}

const paragraphStyle = {
  fontFamily: 'Open Sans',
  margin: 0,
  fontSize: 13
};