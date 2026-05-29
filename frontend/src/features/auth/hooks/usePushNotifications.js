import { useEffect } from "react";
import { subscribePush } from "../../../shared/lib/api";
import useAuthUser from "./useAuthUser";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const usePushNotifications = () => {
  const { authUser } = useAuthUser();

  useEffect(() => {
    if (!authUser || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    let mounted = true;

    const init = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        await navigator.serviceWorker.ready;

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          if (!VAPID_PUBLIC_KEY) {
            console.warn("VITE_VAPID_PUBLIC_KEY not set");
            return;
          }

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: VAPID_PUBLIC_KEY,
          });
        }

        if (!mounted) return;

        await subscribePush({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
            auth: arrayBufferToBase64(subscription.getKey("auth")),
          },
        });
      } catch (error) {
        console.error("Push notification setup error:", error);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [authUser?._id]);
};

export default usePushNotifications;
