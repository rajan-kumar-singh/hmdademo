import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LeftSelectorPanel from "../components/LeftSelectorPanel";
import Mapbox from "../components/Mapbox";
import HMDALogo from '../images/White.png'
import RevanthReddy from '../images/ApGovLogo.png'
import Amrapali from '../images/ApStateLogo.png'
import Telangana from '../images/Telangana.png'
import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  Card,
  useMediaQuery,
  Fade,
} from "@mui/material";
import { CloseRounded } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import IndgeosLogo from '../images/indgeoslogo.png'
import Sidebar from './Sidebar';

const drawerWidth = 270;

function ResponsiveDrawer(props) {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [tableData, setTableData] = React.useState(null);
  const [masterLayers, setMasterLayers] = React.useState(
    [
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
              }, {
                title: 'KankipaduMarketPrice',
                layer: 'kankipaduPolygons',
                // fillColor: feature, // Indigo
                lineColor:[90,90,90],
                type: 'fill',
                filled: true,
                lineWidth: 1, // Thinner line
                toggleValue: false,
                getFillColor: d=>{return [parseInt(d.properties.FID),0,0]}

                // getFillColor: d => {
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
  const [satellite, setSatellite] = React.useState(false)
  const [urls, setUrls] = React.useState('')
  const [isTable, setIsTable] = React.useState(false)

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'space-between', padding: 1, paddingTop: 0, borderRight: 0 }}>
      {/* <LeftSelectorPanel onToggleMasterLayer={handleToggleMasterLayer} satellite={satellite} setSatellite={setSatellite} setAuthToken={props.setAuthToken} /> */}
      <Sidebar masterLayers={masterLayers} setMasterLayers={setMasterLayers} satellite={satellite} setSatellite={setSatellite} setUrls={setUrls} setAuthToken={props.setAuthToken} />
      <a href='https://indgeos.in/' rel="noopener noreferrer" target='_blank' style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', padding: 10 }}>
          <img src={IndgeosLogo} style={{ width: 30 }} alt='IndgeosLogo' />
          <Typography variant='p' sx={{ color: 'black' }}>Powered By Indgeos</Typography>
        </div>
      </a>
    </Box>
  );

  // Remove this const when copying and pasting into your project.
  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        // color='warning'
        className='apbar MuiAppBar'
        position="fixed"
        sx={{
          boxShadow: 'none',
          background: '#12203c',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, }}
          >
            <MenuIcon />
          </IconButton>
          {/* <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 3, marginBottom: 1, marginRight: '1%' }}> */}
          <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '75%', marginLeft: 'auto', marginRight: 'auto' }}>
            {/* <img src={RevanthReddy} alt='Andhra Pradesh' style={{ width: 50, borderRadius: 8 }} /> */}
            {/* </div> */}
            {isLargeScreen && <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '50%' }}>
              <img src={RevanthReddy} alt='Andhra Pradesh' style={{ width: 60, transform: 'scale(0.9)' }} />
              <Typography variant="h5" noWrap component="div" sx={{ fontFamily: 'Oswald', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', display: { xl: 'initial' } }}>
                <strong style={{ fontSize: '1.1rem' }}>ANDHRA PRADESH</strong>
                <br /><strong> LAND INFORMATION SYSTEM</strong>
              </Typography>
              <img src={Amrapali} alt='AP' style={{ width: 60, transform: 'scale(1.5)' }} />
            </div>}
            {/* <img src={Amrapali} alt='AP' style={{ width: 80, borderRadius: 8 }} /> */}
          </div>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ flexShrink: { sm: 0 }, borderRight: 0 }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            // display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '0px' },
            boxShadow: 'none',
          }}
        >
          {drawer}
        </Drawer>
        {/* <Drawer
          className='MuiDrawer'
          variant="permanent"
          sx={{
            borderRight:0,
            padding:0,
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '0px' }
          }}
          open
        >
          <Toolbar />
          {drawer}
        </Drawer> */}
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` }, overflow: 'hidden', flexDirection: 'column' }}
      >
        <Toolbar />
        {tableData && (
          <Fade in={isTable}>
            <Box
              sx={{
                position: "absolute",
                marginRight: 0.5,
                marginBottom: 0.5,
                right: 0,
                bottom: 0,
                zIndex: 100,
                // width: 330,
                // height: 300,
              }}
            >

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={() => { setTableData(null); setIsTable(false) }} style={{ backgroundColor: 'white', marginLeft: 'auto', marginRight: '5px' }}>
                  <CloseRounded />
                </IconButton>
              </div>
              <TableContainer
                elevation={4}
                component={Card}
                sx={{
                  marginTop: 1,
                  border: "1px solid rgba(225,225,225,0.3)",
                  maxHeight: 800,
                  // maxWidth: 330,
                  overflow: "auto",
                }}
              >
                <Table size='small' sx={{ wordBreak: 'break-all', wordWrap: 'break-word' }} aria-label="Simple Table">
                  <TableHead sx={{ background: "black" }}>
                    <TableRow>
                      <TableCell sx={{ color: "white" }}>Properties</TableCell>
                      <TableCell sx={{ color: "white" }} align="right">
                        Values
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData &&
                      Object.keys(tableData.properties).map((key) => {
                        return (
                          <TableRow
                            key={key}
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {key}
                            </TableCell>
                            <TableCell align="right">
                              {tableData.properties[key]}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Fade>
        )}
        <div style={{ flexGrow: 1 }}>
          <Mapbox
            setAuthToken={props.setAuthToken}
            satellite={satellite}
            urls={urls}
            setTableData={setTableData}
            masterLayers={masterLayers}
            setIsTable={setIsTable}
          />
        </div>
        {/* <div style={{ display: 'flex', height: '100%', overflowY: 'scroll' }}>
          <TableContainer
            elevation={4}
            component={Card}
            sx={{
              marginTop: 0.1,
              border: "1px solid rgba(225,225,225,0.5)",
              borderRadius:0,
              width:'100%',
              overflow: "auto",
            }}
          >
            <Table sx={{ width: '100%', wordBreak: 'break-all', wordWrap: 'break-word' }} size='small' aria-label="Simple Table">
              <TableHead sx={{ background: "black" }}>
                <TableRow>
                  <TableCell sx={{ color: "white" }}>Properties</TableCell>
                  <TableCell sx={{ color: "white" }} align="right">
                    Values
                  </TableCell>
                </TableRow>
              </TableHead>
              {tableData ? <TableBody>
                {tableData &&
                  Object.keys(tableData.properties).map((key) => {
                    console.log(tableData)
                    return (
                      <TableRow
                        key={key}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {key}
                        </TableCell>
                        <TableCell align="right">
                          {tableData.properties[key]}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>: <TableBody><TableRow><TableCell colSpan={2} sx={{textAlign:'center'}}>Select a Boundary</TableCell></TableRow></TableBody>}
            </Table>
          </TableContainer>
        </div> */}
      </Box>
    </Box>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window: PropTypes.func,
};

export default ResponsiveDrawer;
