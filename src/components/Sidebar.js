import React, { useState } from 'react';
import { List, ListItem, ListItemButton, ListItemText, Checkbox, Collapse, ListSubheader, Divider, Slider } from '@mui/material';
import { ExpandLess, ExpandMore, SatelliteAlt } from '@mui/icons-material';
import getAuthToken from '../utils/getAuthToken';
import Cookies from 'js-cookie'

const years = [1990, 2010, 2020, 2024];
  const yearUrls = {
    1990: 'mapbox://styles/mapbox/dark-v11',
    2010: 'mapbox://styles/mapbox/navigation-night-v1',
    2020: 'mapbox://styles/mapbox/navigation-day-v1',
    2024: 'mapbox://styles/mapbox/outdoors-v12',
  };
const marks = [
    { value: 0, label: '1990' },
    { value: 1, label: '2010' },
    { value: 2, label: '2020' },
    { value: 3, label: '2024' },
  ];

export default function Sidebar({ masterLayers, setMasterLayers, satellite, setSatellite, setAuthToken, setUrls }) {
    const [year, setYear] = useState(0);

    const handleChange = (event, newValue) => {
        setUrls(yearUrls[marks[newValue].label])
        setYear(newValue);
    };
    const handleParentToggle = (layer, parentLayers) => {
        const newLayers = [...masterLayers];
        let target = newLayers;
        for (const index of parentLayers) {
            target = Array.isArray(target) ? target[index] : target.subLayers[index];
        }
        const newToggleValue = !target.toggleValue;
        target.toggleValue = newToggleValue;
        if (target.subLayers) {
            toggleSubLayers(target.subLayers, newToggleValue);
        }
        setMasterLayers(newLayers);
    };

    const toggleSubLayers = (subLayers, value) => {
        subLayers.forEach((subLayer) => {
            if (Array.isArray(subLayer)) {
                toggleSubLayers(subLayer, value);
            } else {
                subLayer.toggleValue = value;
                if (subLayer.subLayers) {
                    toggleSubLayers(subLayer.subLayers, value);
                }
            }
        });
    };

    const handleToggle = (layer, parentLayers) => {
        // if (!getAuthToken()) {

        //     console.log(getAuthToken())
        //     Cookies.remove('token');
        //     setAuthToken(false);
        //     return;
        // }
        const newLayers = [...masterLayers];
        let target = newLayers;

        // Traverse the parent layers to find the target layer
        for (const index of parentLayers) {
            if (Array.isArray(target)) {
                target = target[index];
            } else {
                target = target.subLayers[index];
            }
        }
        target.toggleValue = !target.toggleValue;
        setMasterLayers(newLayers);
    };

    const renderList = (Obj, parentLayers = []) => {
        return Array.isArray(Obj) ? Obj.map((subLayer, index) => renderList(subLayer, [...parentLayers, index])) : (
            <React.Fragment key={Obj.title}>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => { Obj.parentDrop === true ? handleParentToggle(Obj, parentLayers) : handleToggle(Obj, parentLayers) }}>
                        <Checkbox
                            edge="start"
                            checked={Obj.toggleValue}
                        // onChange={() => handleToggle(Obj, parentLayers)}
                        />
                        <ListItemText sx={{whiteSpace:'break-all'}} id={`layer-checkbox-${Obj.title}`} primary={Obj.title} />
                        {Obj.color && Obj.type && <span style={{ fontSize: 20, color: `rgb(${Obj.color.join(', ')})` }}>{Obj.type === 'boundary' ? '☐' : '●'}</span>}
                        {(Obj.subLayers || Obj.properties) && (Obj.toggleValue ? <ExpandLess /> : <ExpandMore />)}
                    </ListItemButton>
                </ListItem>
                {Obj.subLayers && (
                    <Collapse in={Obj.toggleValue}>
                        <List dense sx={{ pl: 4 }} disablePadding>
                            {Obj.subLayers.map((subLayer, index) => renderList(subLayer, [...parentLayers, index]))}
                        </List>
                    </Collapse>
                )}
                {Obj.properties && (
                    <Collapse in={Obj.toggleValue}>
                        <List dense sx={{ pl: 4 }} disablePadding>
                            {Object.keys(Obj.properties).map((key) => <ListItemButton key={key}>
                                <ListItemText sx={{wordBreak:'break-all',whiteSpace:'break-all'}} id={`layer-checkbox-${key}`} primary={key} />
                                <span style={{ fontSize: 20, color: `rgb(${Obj.properties[key].join(', ')})` }}>{'☐'}</span>
                            </ListItemButton>)}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
    };

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
            {masterLayers.map((Obj, index) => renderList(Obj, [index]))}
            {/* <Divider flexItem /> */}
            {/* <List
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
                <ListItem sx={{ width: 249 }}>
                    <Slider
                        value={year}
                        min={0}
                        max={3}
                        marks={marks}
                        step={null}
                        valueLabelDisplay="off"
                        valueLabelFormat={(value) => years[value]}
                        onChange={handleChange}
                    />
                </ListItem>
            </List> */}
        </List>
    );
}