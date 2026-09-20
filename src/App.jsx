import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AssessmentProvider } from "./context/AssessmentContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Welcome from "./pages/Welcome";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CareerProfile from "./pages/CareerProfile";
import Home from "./pages/Home";
import AssessmentIntro from "./pages/AssessmentIntro";
import AssessmentQuestion from "./pages/AssessmentQuestion";
import AssessmentResult from "./pages/AssessmentResult";
import CareerRecommendations from "./pages/CareerRecommendations";
import CareerDetail from "./pages/CareerDetail";
import SkillAssessment from "./pages/SkillAssessment";
import CompareCareers from "./pages/CompareCareers";
import MentorMarketplace from "./pages/MentorMarketplace";
import MentorDetail from "./pages/MentorDetail";
import MentorChat from "./pages/MentorChat";
import SkillGap from "./pages/SkillGap";
import Roadmap from "./pages/Roadmap";
import MockInterview from "./pages/MockInterview";
import ProgressDashboard from "./pages/ProgressDashboard";
import InterviewFeedback from "./pages/InterviewFeedback";
import MarketInsights from "./pages/MarketInsights";
import NotFound from "./pages/NotFound";
import Preview from "./pages/Preview";

function App() {
  return (
    <AuthProvider>
      <AssessmentProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Welcome />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/preview" element={<Preview />} />

            {/* Protected */}
            <Route path="/profile" element={<ProtectedRoute><CareerProfile /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><AssessmentIntro /></ProtectedRoute>} />
            <Route path="/assessment/question" element={<ProtectedRoute><AssessmentQuestion /></ProtectedRoute>} />
            <Route path="/assessment/result" element={<ProtectedRoute><AssessmentResult /></ProtectedRoute>} />
            <Route path="/careers" element={<ProtectedRoute><CareerRecommendations /></ProtectedRoute>} />
            <Route path="/careers/:career" element={<ProtectedRoute><CareerDetail /></ProtectedRoute>} />
            <Route path="/skill-assessment/:careerId" element={<ProtectedRoute><SkillAssessment /></ProtectedRoute>} />
            <Route path="/compare" element={<ProtectedRoute><CompareCareers /></ProtectedRoute>} />
            <Route path="/mentors" element={<ProtectedRoute><MentorMarketplace /></ProtectedRoute>} />
            <Route path="/mentors/:mentor" element={<ProtectedRoute><MentorDetail /></ProtectedRoute>} />
            <Route path="/mentors/:mentor/chat" element={<ProtectedRoute><MentorChat /></ProtectedRoute>} />
            <Route path="/skill-gap" element={<ProtectedRoute><SkillGap /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
            <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><ProgressDashboard /></ProtectedRoute>} />
            <Route path="/interview-feedback" element={<ProtectedRoute><InterviewFeedback /></ProtectedRoute>} />
            <Route path="/market-insights" element={<ProtectedRoute><MarketInsights /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AssessmentProvider>
    </AuthProvider>
  );
}

export default App;
