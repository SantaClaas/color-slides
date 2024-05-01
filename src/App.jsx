import Home from "./components/Home";

import { Router, Route } from "@solidjs/router";
import Controller from "./components/Controller";
import Slides from "./components/Slides";

function App() {
  return (
    <Router>
      <Route path="/slides/:page?" component={Slides} />
      <Route path="/controller " component={Controller} />
      <Route path="/" component={Home} />
    </Router>
  );
}

export default App;
