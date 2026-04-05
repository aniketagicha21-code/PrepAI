import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Interview from "./pages/Interview.jsx";
import SessionDetail from "./pages/SessionDetail.jsx";
import SessionSummary from "./pages/SessionSummary.jsx";
import Sessions from "./pages/Sessions.jsx";
import Setup from "./pages/Setup.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/interview/:sessionId" element={<Interview />} />
        <Route path="/summary/:sessionId" element={<SessionSummary />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/sessions/:id" element={<SessionDetail />} />
      </Routes>
    </Layout>
  );
}
