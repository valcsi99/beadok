import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../state/authSlice";

export function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
  

  useEffect(() => {
    deleteCookie("token");
    deleteCookie("user");
    dispatch(logout());
    navigate('/', { replace: true });
  }, [dispatch, navigate]);

  return null;
}
