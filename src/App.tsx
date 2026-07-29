import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SiteNav from "./components/SiteNav.tsx";
import Index from "./pages/Index.tsx";
import Analytics from "./pages/Analytics.tsx";
import Standings from "./pages/Standings.tsx";
import Playoff from "./pages/Playoff.tsx";
import ChampionshipWeek from "./pages/ChampionshipWeek.tsx";
import PickReview from "./pages/PickReview.tsx";
import NotFound from "./pages/NotFound.tsx";
import Account from "./pages/Account.tsx";
import MyEntry from "./pages/MyEntry.tsx";
import Scorecards from "./pages/Scorecards.tsx";
import Groups from "./pages/Groups.tsx";
import FpiModel from "./pages/FpiModel.tsx";
import FpiSeason from "./pages/FpiSeason.tsx";
import EntryVsFpi from "./pages/EntryVsFpi.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <SiteNav />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/entry" element={<MyEntry />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/championships" element={<ChampionshipWeek />} />
            <Route path="/playoff" element={<Playoff />} />
            <Route path="/review" element={<PickReview />} />
            <Route path="/account" element={<Account />} />
            <Route path="/scorecards" element={<Scorecards />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/models/fpi" element={<FpiModel />} />
            <Route path="/models/fpi/season" element={<FpiSeason />} />
            <Route path="/compare/fpi" element={<EntryVsFpi />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
