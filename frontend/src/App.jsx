import { Navigate, Route, Routes } from "react-router";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import Layout from "./components/Layout.jsx";
import PageLoader from "./components/PageLoader.jsx";
import { StreamChatProvider } from "./context/StreamChatContext.jsx";

import { Toaster } from "react-hot-toast";

import useAuthUser from "./hooks/useAuthUser.js";
import usePushNotifications from "./hooks/usePushNotifications.js";
import useFriendRequestPoller from "./hooks/useFriendRequestPoller.js";
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  usePushNotifications();
  useFriendRequestPoller();
  const isAuthenticated = Boolean(authUser);
  const isVerified = authUser?.isVerified !== false;
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh" data-theme={theme}>
        <StreamChatProvider>
          <Routes>
            <Route path="*" element={<Navigate to={"/login"} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Routes>
        </StreamChatProvider>
        <Toaster />
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-dvh" data-theme={theme}>
        <StreamChatProvider>
          <Routes>
            <Route path="*" element={<Navigate to={"/verify-email"} />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/logout" element={<VerifyEmailPage />} />
          </Routes>
        </StreamChatProvider>
        <Toaster />
      </div>
    );
  }

  if (!isOnboarded) {
    return (
      <div className="min-h-dvh" data-theme={theme}>
        <StreamChatProvider>
          <Routes>
            <Route path="*" element={<Navigate to={"/onboarding"} />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Routes>
        </StreamChatProvider>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-dvh" data-theme={theme}>
      <StreamChatProvider>
        <Routes>
          <Route
            path="/"
            element={
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/chat/:id"
            element={
              <Layout showSidebar={false}>
                <ChatPage />
              </Layout>
            }
          />
          <Route
            path="/call/:id"
            element={<CallPage />}
          />
          <Route
            path="/notifications"
            element={
              <Layout showSidebar={true}>
                <NotificationsPage />
              </Layout>
            }
          />
          <Route
            path="/messages"
            element={
              <Layout showSidebar={true}>
                <MessagesPage />
              </Layout>
            }
          />
          <Route
            path="/friends"
            element={
              <Layout showSidebar={true}>
                <FriendsPage />
              </Layout>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <Layout showSidebar={true}>
                <ProfilePage />
              </Layout>
            }
          />
          <Route path="*" element={<Navigate to={"/"} />} />
        </Routes>
      </StreamChatProvider>
      <Toaster />
    </div>
  )
}

export default App
