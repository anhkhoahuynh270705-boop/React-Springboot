import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const GithubLoginSuccess = ({ onLogin }) => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const user = {
      id: params.get("id"),
      username: params.get("username"),
      email: params.get("email"),
      fullName: params.get("fullName"),
      avatarUrl: params.get("avatarUrl"),
      provider: "GITHUB"
    };

    if (!user.id) {
      navigate("/", { replace: true });
      return;
    }

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    const token = params.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
    }
    localStorage.setItem("currentUser", JSON.stringify(user));

    if (onLogin) 
      onLogin(user);

    window.dispatchEvent(
      new CustomEvent("authChanged", {
        detail: { user } 
      })
    );

    navigate("/");
  }, [params, navigate, onLogin]);

  return <div>Logging in with GitHub...</div>;
};

export default GithubLoginSuccess;