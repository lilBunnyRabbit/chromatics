import { Suspense } from "react";
import { Route, Routes } from "react-router";

import { LoadingOverlay } from "@/components/loading-overlay";
import { AppLayout } from "./app.layout";
import TestingRoute from "./testing.route";
import ParsingRoute from "./parsing.route";
import RGB255Route from "./models/rgb255.route";
import RGBRoute from "./models/rgb.route";
import PlaygroundRoute from "./playground.route";

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<TestingRoute />} />
          <Route path="parsing" element={<ParsingRoute />} />
          <Route path="playground" element={<PlaygroundRoute />} />
          <Route path="models">
            <Route path="rgb255" element={<RGB255Route />} />
            <Route path="rgb" element={<RGBRoute />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
