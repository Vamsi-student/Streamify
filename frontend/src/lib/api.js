import axiosInstance  from "./axios.js";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const verifyEmail = async (otp) => {
  const response = await axiosInstance.post("/auth/verify-email", { otp });
  return response.data;
};
export const resendOTP = async () => {
  const response = await axiosInstance.post("/auth/resend-otp");
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    console.log("Error in getAuthUser:", error);
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export const getRecommendedUsers= async ()=>{
  const resposne = await axiosInstance.get("/users");
  return resposne.data;
}

export const getUserFriends = async ()=>{
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export const getOutgoingFriendReqs = async ()=>{
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export const sendFriendRequest = async (userId)=>{
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export const getFriendReqs = async ()=>{
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export const acceptFriendReq = async (requestId)=>{
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export const rejectFriendReq = async (requestId)=>{
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/reject`);
  return response.data;
}

export const getUserById = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

export const getStreamToken = async ()=>{
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

export const subscribePush = async (subscription) => {
  const response = await axiosInstance.post("/notifications/subscribe", subscription);
  return response.data;
};

export const unsubscribePush = async (endpoint) => {
  const response = await axiosInstance.post("/notifications/unsubscribe", { endpoint });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data;
};

export const verifyResetOTP = async (email, otp) => {
  const response = await axiosInstance.post("/auth/verify-reset-otp", { email, otp });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};