import { BrowserRouter, Routes, Route } from "react-router-dom";
import LeaguesPage from "../pages/LeaguesPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CreateLeaguePage from "../pages/CreateLeaguePage";
import LeagueDetailPage from "../pages/LeagueDetailPage";
import MatchPage from "../pages/MatchPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<ProtectedRoute><LeaguesPage /></ProtectedRoute>} />
                <Route path="/create-league" element={<ProtectedRoute><CreateLeaguePage /></ProtectedRoute>} />
                <Route path="/leagues/:leagueId" element={<ProtectedRoute><LeagueDetailPage /></ProtectedRoute>} />
                <Route path="/matches/:matchId" element={<ProtectedRoute><MatchPage /></ProtectedRoute>} />
                <Route path="*" element={<p style={{ padding: "20px" }}>Page not found :(</p>} />
            </Routes>
        </BrowserRouter>
    );
}