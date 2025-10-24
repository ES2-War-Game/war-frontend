import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/home";
import Login from "../pages/Login/login";
import Register from "../pages/Register/register";
import GameSetupPage from "../pages/GameSetup/gameSetup";
import Hub from "../pages/Hub/hub";
import MainLayout from "../layout/MainLayout";
<<<<<<< HEAD
import Hub from "../pages/Hub/hub";
import ProtectedRoute from "./ProtectedRoute";
=======
import Game from "../pages/Game/Game";
>>>>>>> origin/main

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
        path: "/hub",
        element: <Hub />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
<<<<<<< HEAD
        path: "/hub",
        element: (
          <ProtectedRoute>
            <Hub />
          </ProtectedRoute>
        ),
      }
=======
        path: "/game",
        element: <Game />,
      },
>>>>>>> origin/main
    ],
  },
]);

export default router;
