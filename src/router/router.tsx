import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/home";
import Login from "../pages/Login/login";
import Register from "../pages/Register/register";
import GameSetupPage from "../pages/GameSetup/gameSetup";
import Hub from "../pages/Hub/hub";
import MainLayout from "../layout/MainLayout";
import Game from "../pages/Game/Game";

const router = createBrowserRouter([
  {
    path: "",
    element: <MainLayout />,
    children: [
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
        path: "/hub",
        element: <Hub />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/game",
        element: <Game />,
      },
    ],
  },
]);

export default router;
