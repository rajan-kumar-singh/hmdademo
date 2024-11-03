import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { Divider, ListSubheader } from '@mui/material';
import getAuthToken from '../utils/getAuthToken';
import { SatelliteAlt } from '@mui/icons-material';
import Cookies from 'js-cookie'

// const masterLayersList = ['RevenueBoundaryPoints', 'RevenueBoundary', 'EnjoymentBoundaryPoints', 'EnjoymentBoundary', 'TryJunctionPoints', 'districts']//['Enjoyment_Boundary', 'Revenue_Boundary', 'Try_Junction_points']// ['forest', 'railway', 'road', 'waterBodies','district','geologicalStructures','mandal','village'];
// const masterLayersList = ['SOI_Referene_Points', 'village_tri_bi_junctions', 'tertiary_points', 'HMDA_Sites', 'ClustersAsPerSOI', 'District_Boundaries', 'village_boundary','Mandal_Boundaries']
// const masterLayersList = ['SOI_Referene_Points', 'tertiary_points', 'HMDA_Sites', 'ClustersAsPerSOI', 'District_Boundaries', 'Mandal_Boundaries']
// const colorsList = ['yellow', 'red', 'purple','transparent','#00fa46','gold'];
// const colorsList = [
//     {color:'#4fff7f',type:'point'}, 
//     {color:'red',type:'point'}, 
//     {color:'yellow',type:'point'},
//     {color:'#ff0000',type:'boundary'},
//     {color:'#b2d4ff',type:'boundary'},
//     {color:'#ff00c5',type:'boundary'},
//     {color:'#cd23ff',type:'boundary'},
//     {color:'#0070ff',type:'boundary'},
// ];
// const colorsList = [
//     { color: '#4fff7f', type: 'point' },
//     { color: 'yellow', type: 'point' },
//     { color: '#ff0000', type: 'boundary' },
//     { color: '#b2d4ff', type: 'boundary' },
//     { color: '#ff00c5', type: 'boundary' },
//     { color: '#0070ff', type: 'boundary' },
// ];

const newSet = ['Open Land',
    'Private Land',
    'Road Area',
    'Builtup',
    'Water Body',
    'Narsary',
    'Plotted Area',
    'Open Area -Park',
    'Open Area',
    'Open Area -Rock Garden',
    'Open Area -Play Ground',
    'Nala',
    'Agriculture Land']
const combinedLayersList = [
    { name: 'District Boundaries', color: '#ff00c5', type: 'boundary' },
    { name: 'Ground Control Points', color: '#987db7', type: 'point' },
    { name: 'HMDA Sites', color: '#e15989', type: 'boundary' },
    {
        name: 'Hyderabad Mandal Boundaries',
        color: '#c43c39',
        type: 'boundary'
    },
    {
        name: 'Land Classification Boundary Point',
        color: '#e5b636',
        type: 'point'
    },
    {
        name: 'Land Classification Boundary',
        color: '#e5b636',
        type: 'boundary'
    },
    {
        name: 'Land Parcel Boundary as per Revenue Record',
        color: '#beb297',
        type: 'boundary'
    },
    {
        name: 'Land Parcel Boundary Point as per Revenue Record',
        color: '#a47158',
        type: 'point'
    },
    { name: 'Mandal Boundaries', color: '#729b6f', type: 'boundary' },
    { name: 'Village Boundaries', color: '#8d5a99', type: 'boundary' }
]

export default function LeftSelectorPanel({ onToggleMasterLayer, satellite, setSatellite, setAuthToken }) {
    const [masterLayersChecked, setMasterLayersChecked] = React.useState([]);

    const handleMasterLayersToggle = (index) => () => {
        if (!getAuthToken()) {
            Cookies.remove('token');
            setAuthToken(false);
        }
        const currentIndex = masterLayersChecked.indexOf(index);
        const newChecked = [...masterLayersChecked];
        let layerToggleValue;
        if (currentIndex === -1) {
            newChecked.push(index);
            layerToggleValue = true;
        } else {
            newChecked.splice(currentIndex, 1);
            layerToggleValue = false;
        }

        setMasterLayersChecked(newChecked);
        onToggleMasterLayer(combinedLayersList[index].name, layerToggleValue);
    };
    return <>
        <List
            dense
            sx={{
                // maxHeight: '50%',
                overflowY: 'auto',
                // height: 300,
                paddingBottom: 1,
            }}>
            <List
                dense
                sx={{
                    maxHeight: '60%',
                    overflowY: 'auto'
                }}
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader" sx={{ fontSize: '1.2rem', color: 'black' }}>
                        Layers
                    </ListSubheader>
                }
            >
                {combinedLayersList.map((layer, index) => (
                    <><ListItem key={index} disablePadding sx={{ paddingTop: 0, paddingBottom: 0 }}>
                        <ListItemButton id={layer.name} onClick={handleMasterLayersToggle(index)} sx={{ paddingTop: 0, paddingBottom: 0 }}>
                            <Checkbox
                                edge="start"
                                checked={masterLayersChecked.indexOf(index) !== -1}
                                inputProps={{ 'aria-labelledby': `master-layers-list-label-${index}` }}
                            />
                            <ListItemText id={`master-layers-list-label-${index}`} primary={layer.name} />
                            <span style={{ fontSize: 20, color: combinedLayersList[index].color }}>{combinedLayersList[index].type === 'boundary' ? '☐' : '●'}</span>

                            {/* Sublist for EnjoymentBoundary */}

                        </ListItemButton>

                    </ListItem>
                        {layer.name === 'EnjoymentBoundary' && (
                            <List dense disablePadding sx={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 4, color: 'black' }}>
                                <ListItem>
                                    <ListItemText id={`master-layers-list-label-${index}`} sx={{ color: 'black' }} primary={'Occupied'} />
                                    <span style={{ fontSize: 20, color: 'rgba(167, 38, 181, 250)' }}>&#9679;</span>
                                </ListItem>
                                <ListItem>
                                    <ListItemText id={`master-layers-list-label-${index}`} sx={{ color: 'black' }} primary={'Encroched'} />
                                    <span style={{ fontSize: 20, color: 'rgba(240, 240, 10, 50)' }}>&#9679;</span>
                                </ListItem>
                                <ListItem>
                                    <ListItemText id={`master-layers-list-label-${index}`} sx={{ color: 'black' }} primary={'Open Area'} />
                                    <span style={{ fontSize: 20, color: '#0af708' }}>&#9679;</span>
                                </ListItem>
                            </List>
                        )}</>
                ))}

            </List><Divider flexItem />
            <List
                sx={{
                    // maxHeight: '80%',
                    overflowY: 'auto',
                    // height: 300,
                    paddingBottom: 1,
                }}
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader" sx={{ fontSize: '1.2rem', background: 'transparent', color: 'black' }}>
                        Satelitte Imagery
                    </ListSubheader>
                }
            >
                <ListItem key={'satellite'} disablePadding sx={{ paddingTop: 0, paddingBottom: 0 }}>
                    <ListItemButton id={'satellite'} onClick={() => { setSatellite(!satellite) }} sx={{ paddingTop: 0, paddingBottom: 0 }}>
                        <Checkbox
                            edge="start"
                            checked={satellite}
                            inputProps={{ 'aria-labelledby': `satellite` }}
                        />
                        <ListItemText id={`satellite`} primary={`Satellite Image`} />
                        <span style={{ fontSize: 20 }}><SatelliteAlt /></span>
                    </ListItemButton>
                </ListItem>
            </List>
        </List>
    </>
}
