import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/home";
import Login from "../pages/Login/login";
import GameSetup from "../pages/GameSetup/gamesetup"; 

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/jogadores", 
    element: <GameSetup />,
  },
]);

export default router;
