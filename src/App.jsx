import Home from "./components/Home";

import { Router, Route } from "@solidjs/router";
import Presentation from "./components/Presentation";
import Notes from "./components/Notes";

function App() {
  return (
    <Router>
      <Route path="/presentation/:page?" component={Presentation} />
      <Route path="/notes" component={Notes} />
      <Route path="/" component={Home} />
    </Router>
  );
}

export default App;
