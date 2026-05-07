import { BrowserRouter, Routes, Route } from "react-router-dom";
import LeaguesPage from "../pages/LeaguesPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import CreateLeaguePage from "../pages/CreateLeaguePage";
import LeagueDetailPage from "../pages/LeagueDetailPage";
import MatchPage from "../pages/MatchPage";
import TournamentsPage from "../pages/TournamentsPage";
import CreateTournamentPage from "../pages/CreateTournamentPage";
import TournamentDetailPage from "../pages/TournamentDetailPage";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/Layout";
import { useTranslation } from "react-i18next";

function NotFound() {
    const { t } = useTranslation();
    return <p>{t('common.notFound')}</p>;
}

export default function AppRouter() {
    return(
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/" element={<ProtectedRoute><LeaguesPage /></ProtectedRoute>} />
                    <Route path="/leagues" element={<ProtectedRoute><LeaguesPage /></ProtectedRoute>} />
                    <Route path="/create-league" element={<ProtectedRoute><CreateLeaguePage /></ProtectedRoute>} />
                    <Route path="/leagues/:leagueId" element={<ProtectedRoute><LeagueDetailPage /></ProtectedRoute>} />
                    <Route path="/matches/:matchId" element={<ProtectedRoute><MatchPage /></ProtectedRoute>} />
                    <Route path="/tournaments" element={<ProtectedRoute><TournamentsPage /></ProtectedRoute>} />
                    <Route path="/create-tournament" element={<ProtectedRoute><CreateTournamentPage /></ProtectedRoute>} />
                    <Route path="/tournaments/:tourneyId" element={<ProtectedRoute><TournamentDetailPage /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}