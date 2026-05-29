import { useEffect, useRef } from "react";
import { Navigate, useLocation, Route, Routes } from "react-router";

import HomePage from "../features/home/pages/HomePage.jsx";
import SignUpPage from "../features/auth/pages/SignUpPage.jsx";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import NotificationsPage from "../features/notifications/pages/NotificationsPage.jsx";
import CallPage from "../features/call/pages/CallPage.jsx";
import ChatPage from "../features/chat/pages/ChatPage.jsx";
import MessagesPage from "../features/chat/pages/MessagesPage.jsx";
import FriendsPage from "../features/friends/pages/FriendsPage.jsx";
import ProfilePage from "../features/profile/pages/ProfilePage.jsx";
import OnboardingPage from "../features/profile/pages/OnboardingPage.jsx";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage.jsx";
import VerifyEmailPage from "../features/auth/pages/VerifyEmailPage.jsx";
import Layout from "../shared/components/Layout.jsx";
import PageLoader from "../shared/components/PageLoader.jsx";
import { StreamChatProvider } from "../features/chat/context/StreamChatContext.jsx";

import { Toaster } from "react-hot-toast";

import useAuthUser from "../features/auth/hooks/useAuthUser.js";
import usePushNotifications from "../features/auth/hooks/usePushNotifications.js";
import useFriendRequestPoller from "../features/friends/hooks/useFriendRequestPoller.js";
import { useThemeStore } from "../shared/store/useThemeStore.js";


function PublicRouteGuard() {
  return <Navigate to="/login" replace />;
}

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  usePushNotifications();
  useFriendRequestPoller();

  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      console.log(`[NAV] ${prevPathRef.current} → ${location.pathname}`);
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  const isAuthenticated = Boolean(authUser);
  const isVerified = authUser?.isVerified !== false;
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh" data-theme={theme}>
        <StreamChatProvider>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="*" element={<PublicRouteGuard />} />
          </Routes>
        </StreamChatProvider>
        <Toaster />
      </div>
    );
  }

  if (!isVerified) {
    if (authUser?.email) {
      sessionStorage.setItem("verify_email", authUser.email);
    }
    return (
      <div className="min-h-dvh" data-theme={theme}>
        <StreamChatProvider>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="*" element={<Navigate to="/verify-email" replace />} />
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
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </StreamChatProvider>
      <Toaster />
    </div>
  )
}

export default App
