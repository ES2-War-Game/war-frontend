import { Outlet } from "react-router-dom";
import MusicPlayer from "../router/MusicPlayer";
import GameResumeChecker from "../components/GameResumeChecker/GameResumeChecker";

export default function MainLayout() {
  return (
    <>
      <MusicPlayer />
      <GameResumeChecker />
      <Outlet />
    </>
  );
}
