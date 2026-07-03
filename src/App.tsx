import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { CommandPalette } from "./components/CommandPalette";
import { ShortcutLayer } from "./components/ShortcutLayer";
import { AppShell } from "./components/layout/AppShell";
import { AuthPage } from "./pages/AuthPage";
import { GalleryPage } from "./pages/GalleryPage";
import { LandingPage } from "./pages/LandingPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SimpleCollectionPage } from "./pages/SimpleCollectionPage";
import { UploadPage } from "./pages/UploadPage";
import { ViewerPage } from "./pages/ViewerPage";

export default function App() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      <CommandPalette />
      <ShortcutLayer />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<GalleryPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/viewer/:photoId" element={<ViewerPage />} />
              <Route
                path="/albums"
                element={<SimpleCollectionPage kind="albums" />}
              />
              <Route
                path="/favorites"
                element={<SimpleCollectionPage kind="favorites" />}
              />
              <Route
                path="/profile"
                element={<SimpleCollectionPage kind="profile" />}
              />
              <Route
                path="/settings"
                element={<SimpleCollectionPage kind="settings" />}
              />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
