import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/home";
import Login from "../pages/Login/login";
import Register from "../pages/Register/register";
import GameSetupPage from "../pages/GameSetup/gameSetup";

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
    element: <GameSetupPage />,
  },
  {
    path: "/register", 
    element: <Register />,
  },
]);

export default router;
