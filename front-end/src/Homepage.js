import React, {useState} from "react";
import { Switch, Route, Link } from "react-router-dom";

import "./Homepage.css";

import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";

// import your component functions for use in route links
import SubwayLinesInfo from "./SubwayLinesInfo";
import SubwayStation from "./SubwayStation";
import SubwayStations from "./SubwayStations";
import Subwaylines from "./Subwaylines";
import Login from "./Login";
import Signup from "./Signup";

function App() {
  const [user, setUser] = useState({})
  // add links to your pages for now
  return (
    <Switch>
      <Route exact path="/" component={Homepage}></Route>
      <Route path="/subwayLinesInfo/:id" component={SubwayLinesInfo}></Route>
      <Route exact path="/stations" component={SubwayStations}></Route>
      <Route path="/stations/:id" component={SubwayStation}></Route>
      <Route exact path="/stationView" component={SubwayStation}></Route>
      <Route exact path="/lines" component={Subwaylines}></Route>
      <Route path="/login"> 
        <Login user = {user} setuser = {setUser} />
      </Route>
      <Route path="/signup"> 
        <Signup user = {user} setuser = {setUser} />
      </Route>
      
    </Switch>
  );
}

const Homepage = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <div>
      <h2>Welcome to NYCRoute!</h2>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        Start your route here!
      </Button>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        onClose={handleClose}
        open={Boolean(anchorEl)}
      >
        <Link className="App-link" to="/stations">
          {" "}
          <MenuItem onClick={handleClose}>List of Stations</MenuItem>{" "}
        </Link>
        <Link className="App-link" to="/lines">
          {" "}
          <MenuItem onClick={handleClose}>List of Subway Lines</MenuItem>
        </Link>
      </Menu>
    </div>
  );
};

export default App;