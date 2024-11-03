import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { Collapse, Divider, ListSubheader } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import getAuthToken from '../utils/getAuthToken';
import Cookies from 'js-cookie';
import { SatelliteAlt } from '@mui/icons-material';

const combinedLayersList = [
    {
        title: 'Administrative Boundaries',
        layers: [
            { name: 'District Boundaries', color: '#ff00c5', type: 'boundary' },
            { name: 'Mandal Boundaries', color: '#729b6f', type: 'boundary' },
            { name: 'Village Boundaries', color: '#8d5a99', type: 'boundary' }
        ]
    },
    {
        title: 'HMDA Sites',
        layers: [
            { name: 'Land Classification Boundary', color: '#beb297', type: 'boundary' },
            // { name: 'Land Boundary as per Enjoyment', color: '#c43c39', type: 'boundary' },
            {
                title: 'Boundaries',
                layers: [
                    { name: 'Plotted Area Boundary', color: '#e5b636', type: 'boundary' },
                    { name: 'Allotted Area Boundaries', color: '#e15989', type: 'boundary' },
                    { name: 'Open Area Boundary', color: '#987db7', type: 'boundary' }
                ]
            },
        ]
    },
    {
        title:'Boundary Points',
        layers:[
            { name: 'Ground Control Points', color: '#987db7', type: 'point' },
            {
                name: 'Land Classification Boundary Point',
                color: '#e5b636',
                type: 'point'
            },
            {
                name: 'Land Parcel Boundary Point as per Revenue Record',
                color: '#a47158',
                type: 'point'
            },
        ]
    }
];

export default function LeftSelectorPanel({ onToggleMasterLayer, satellite, setSatellite, setAuthToken }) {
    const [masterLayersChecked, setMasterLayersChecked] = useState([]);
    const [openCategories, setOpenCategories] = useState({});
    const [openSubcategories, setOpenSubcategories] = useState({});

    const handleMasterLayersToggle = (layerName) => {
        if (!getAuthToken()) {
            Cookies.remove('token');
            setAuthToken(false);
            return;
        }

        const currentIndex = masterLayersChecked.indexOf(layerName);
        const newChecked = [...masterLayersChecked];
        let layerToggleValue;

        if (currentIndex === -1) {
            newChecked.push(layerName);
            layerToggleValue = true;
        } else {
            newChecked.splice(currentIndex, 1);
            layerToggleValue = false;
        }

        setMasterLayersChecked(newChecked);
        onToggleMasterLayer(layerName, layerToggleValue);
    };

    const handleCategoryToggle = (categoryTitle) => {
        setOpenCategories((prevOpenCategories) => ({
            ...prevOpenCategories,
            [categoryTitle]: !prevOpenCategories[categoryTitle]
        }));
    };

    const handleSubcategoryToggle = (subcategoryTitle) => {
        setOpenSubcategories((prevOpenSubcategories) => ({
            ...prevOpenSubcategories,
            [subcategoryTitle]: !prevOpenSubcategories[subcategoryTitle]
        }));
    };

    const renderLayers = (layers, parentLayerName) => (
        layers.map((layer, index) => (
            <React.Fragment key={index}>
                {layer.title ? (
                    <React.Fragment>
                        <ListItemButton onClick={() => handleSubcategoryToggle(layer.title)} sx={{ pl: 4 }}>
                            <ListItemText primary={layer.title} />
                            {openSubcategories[layer.title] ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={openSubcategories[layer.title]} timeout="auto" unmountOnExit>
                            <List component="div" dense disablePadding sx={{ pl: 4 }}>
                                {renderLayers(layer.layers, layer.title)}
                            </List>
                        </Collapse>
                    </React.Fragment>
                ) : (
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => handleMasterLayersToggle(layer.name)} sx={{ pl: 4 }}>
                            <Checkbox
                                edge="start"
                                checked={masterLayersChecked.indexOf(layer.name) !== -1}
                                inputProps={{ 'aria-labelledby': `layer-checkbox-${layer.name}` }}
                            />
                            <ListItemText id={`layer-checkbox-${layer.name}`} primary={layer.name} />
                            <span style={{ fontSize: 20, color: layer.color }}>{layer.type === 'boundary' ? '☐' : '●'}</span>
                        </ListItemButton>
                    </ListItem>
                )}
            </React.Fragment>
        ))
    );

    return (
        <List
            dense
            sx={{
                overflowY: 'auto',
                paddingBottom: 1,
            }}
            subheader={
                <ListSubheader component="div" id="nested-list-subheader" sx={{ fontSize: '1.2rem', color: 'black' }}>
                    Layers
                </ListSubheader>
            }
        >
            {combinedLayersList.map((category, index) => (
                <React.Fragment key={index}>
                    <ListItemButton onClick={() => handleCategoryToggle(category.title)}>
                        <ListItemText primary={category.title} />
                        {openCategories[category.title] ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={openCategories[category.title]} timeout="auto" unmountOnExit>
                        <List component="div" dense disablePadding>
                            {renderLayers(category.layers, category.title)}
                        </List>
                    </Collapse>
                </React.Fragment>
            ))}
            <Divider flexItem />
            <List
                dense
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader" sx={{ fontSize: '1.2rem', background: 'transparent', color: 'black' }}>
                        Satellite Imagery
                    </ListSubheader>
                }
            >
                <ListItem key={'satellite'} disablePadding sx={{ paddingTop: 0, paddingBottom: 0 }}>
                    <ListItemButton onClick={() => setSatellite(!satellite)} sx={{ paddingTop: 0, paddingBottom: 0 }}>
                        <Checkbox
                            edge="start"
                            checked={satellite}
                            inputProps={{ 'aria-labelledby': 'satellite' }}
                        />
                        <ListItemText primary="Satellite Image" />
                        <SatelliteAlt />
                    </ListItemButton>
                </ListItem>
            </List>
        </List>
    );
}
