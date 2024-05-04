import Home from "./components/Home";

import { Router, Route } from "@solidjs/router";
import Presentation from "./components/Presentation";
import Notes from "./components/Notes";
import { PresentationProvider } from "./components/PresentationContext";

function App() {
  return (
    <Router root={PresentationProvider}>
      <Route path="/presentation/" component={Presentation} />
      <Route path="/notes/" component={Notes} />
      <Route path="/" component={Home} />
    </Router>
  );
}

export default App;
