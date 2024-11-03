import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LeftSelectorPanel from "./LeftSelectorPanel";
import Mapbox from "./Mapbox";
import IconButton from '@mui/material/IconButton';
import HMDALogo from '../images/hmdaLogo.png'
import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  Card,
} from "@mui/material";
import { CloseRounded } from '@mui/icons-material';

const drawerWidth = 270;

export default function ClippedDrawer(props) {

  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [tableData, setTableData] = React.useState(null);
  const [selectedFile, setSelectedFile] = React.useState("");
  const [contourMB, setContourMB] = React.useState(null);
  const [contourDeck, setContourDeck] = React.useState(null);
  const [contourLines, setContourLines] = React.useState(null);
  const [handleToggleChangeGeoJSON, setHandleToggleChangeGeoJSON] = React.useState(null);
  const [mainListItems, setMainListItems] = React.useState([]);
  const [masterLayers, setMasterLayers] = React.useState([
    {
        "layer": "EnjoymentBoundary",
        "toggleValue": true
    }
]);

  const handleToggleMainListItem = (value, toggleState, mlbToggle, bufferToggle) => {
    const updatedItems = [{ value, toggleState, mlbToggle, bufferToggle }];
    setMainListItems(updatedItems);
  };
  React.useEffect(()=>{
    console.log(masterLayers)
  },[masterLayers])
  const handleToggleMasterLayer = (layer, toggleValue) => {
    setMasterLayers([{ layer, toggleValue }])
  }
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
  const flattenFolders = (folder) => {
    let files = [];
    if (folder.contents && Array.isArray(folder.contents)) {
      for (const item of folder.contents) {
        if (item.type === "file") {
          files.push(item);
        } else {
          files = files.concat(flattenFolders(item));
        }
      }
    }
    return files;
  };

  const handleChange = (event) => {
    setSelectedFile(event.target.value);
    console.log("1111");
  };
  const container =
    window !== undefined ? () => window().document.body : undefined;


  return (
    <Box sx={{ display: 'flex', background: 'linear-gradient(68.8deg, rgba(0, 0, 0, 0.95) 1.8%, rgb(0, 55, 79) 31.8%, rgb(9, 93, 134) 56.2%, rgb(15, 155, 217) 89%)' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: 'transparent', boxShadow: 'none' }}>
        <Toolbar>
          {/* <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 3, marginBottom: 1, marginRight: '1%' }}> */}
            <img src={HMDALogo} alt='HMDA' style={{ width: 100, backgroundColor:'white', borderRadius:8,marginLeft:'3%' }} />
          {/* </div> */}
          <Typography variant="h5" noWrap component="div" sx={{marginLeft:'auto',marginRight:'auto'}}>
            <strong>Hyderabad Metropolitan Development Authority Land Information System</strong>
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          background: 'transparent',
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', display:'flex', flexDirection:'column',height:'100vh', justifyContent:'space-between', background: 'transparent', padding: 1, paddingTop: 0 }}>
          <LeftSelectorPanel onToggleMainListItem={handleToggleMainListItem} onToggleMasterLayer={handleToggleMasterLayer}></LeftSelectorPanel>
          <a href='https://indgeos.in/' target='_blank' style={{textDecoration:'none'}}>
          <div style={{display:'flex', justifyContent:'center', alignItems:'center',padding:10}} className='glassBackground' onClick={()=>{}}>
            {/* <img src={IndgeosLogo} style={{width:50}} alt='IndgeosLogo' /> */}
            <Typography variant='p' sx={{color:'white'}}>Powered By Indgeos</Typography>
          </div>
          </a>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 0,height:'100vh' }}>
        <Toolbar />
        {tableData && (
          <Box
            sx={{
              position: "absolute",
              marginRight: 0.5,
              right: 0,
              bottom:130,
              zIndex: 100,
              width: 300,
              height: 300,
            }}
          >
            
            <div style={{display:'flex',justifyContent:'flex-end'}}>
            <IconButton onClick={() => setTableData(null)} style={{ backgroundColor: 'white', marginLeft: 'auto', marginRight: '5px' }}>
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
                maxWidth: 320,
                overflow: "auto",
              }}
            >
              <Table sx={{ maxWidth: 320, wordBreak: 'break-all', wordWrap: 'break-word' }} aria-label="Simple Table">
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
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        <Mapbox
          selectedFile={selectedFile}
          setTableData={setTableData}
          contourDeck={contourDeck}
          contourMB={contourMB}
          contourLines={contourLines}
          handleToggleChangeGeoJSON={handleToggleChangeGeoJSON}
          mainListItems={mainListItems}
          masterLayers={masterLayers}
        />
      </Box>
    </Box>
  );
}
