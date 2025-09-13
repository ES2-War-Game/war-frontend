import { Outlet } from "react-router-dom";
import MusicPlayer from "../router/MusicPlayer";

export default function MainLayout() {
  return (
    <>
      <MusicPlayer />
      <Outlet />
    </>
  );
}
