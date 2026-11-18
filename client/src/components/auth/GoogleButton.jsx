import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { googleLoginThunk } from "../../store/authSlice";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleButton({
  role = "user",
  text = "continue_with",
}) {
  const dispatch = useDispatch();
  const wrapperRef = useRef(null);
  const [width, setWidth] = useState(320);

  // Google draws the button at a fixed pixel width, so fit it to its container
  useEffect(() => {
    const measure = () => {
      if (!wrapperRef.current) return;
      const w = Math.floor(wrapperRef.current.getBoundingClientRect().width);
      setWidth(Math.min(Math.max(w, 200), 400));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  if (!CLIENT_ID) return null;

  const handleSuccess = (response) => {
    if (!response.credential) {
      toast.error("Google did not return a sign-in token. Please try again.");
      return;
    }
    dispatch(googleLoginThunk({ credential: response.credential, role }));
  };

  return (
    <div ref={wrapperRef} className="w-full flex justify-center">
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => toast.error("Google sign-in was cancelled or failed")}
          text={text}
          theme="outline"
          size="large"
          shape="rectangular"
          logo_alignment="left"
          width={String(width)}
        />
      </GoogleOAuthProvider>
    </div>
  );
}
