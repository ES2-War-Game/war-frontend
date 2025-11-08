import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/home";
import Login from "../pages/Login/login";
import Register from "../pages/Register/register";
import GameSetupPage from "../pages/GameSetup/gameSetup";
import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import Game from "../pages/Game/Game";
import Hub from "../pages/Hub/hub";
import Profile from "../pages/Profile/Profile";

const router = createBrowserRouter([
  {
    path: "",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/jogadores",
        element: (
          <ProtectedRoute>
            <GameSetupPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/hub",
        element: (
          <ProtectedRoute>
            <Hub />
          </ProtectedRoute>
        ),
      },
      {
        path: "/game",
        element: <Game />,
      },
      {
        path: "/game/:gameId",
        element: <Game />,
      },
    ],
  },
]);

export default router;
