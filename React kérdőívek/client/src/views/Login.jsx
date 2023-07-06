import { useDispatch } from "react-redux";
import { useLoginMutation } from "../state/ApiSlice";
import "./register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../state/authSlice";

export function Login() {

    const [data, setData] = useState({
        email: "",
        password:"",
    });

    const [authLogin] = useLoginMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { email, password } = data;

        try {
            const result = await authLogin({
                strategy: 'local',
                email,
                password
            }).unwrap();
            dispatch(login({user: result.user, token: result.accessToken}));
            setCookie('token', result.accessToken, 1);
            setCookie('user', JSON.stringify(result.user), 1);
            navigate('/', {replace: true});
        } catch (error) {
            console.error("Login error");
        }
    }

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
          });
    }

    function setCookie(name, value, days) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);
      
        const cookieValue = value + '; expires=' + expirationDate.toUTCString() + '; secure=false; path=/';
      
        document.cookie = `${name}=${cookieValue}`;
      }
      

    return (
        <>
            <div className="maindiv">
                <h2>Bejelentkezés</h2>
                <div className="registerdiv">
                    <form onSubmit={handleSubmit} >
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" onChange={handleChange} />
                        <label htmlFor="password">Jelszó</label>
                        <input type="password" name="password" onChange={handleChange} />
                        <button type="submit">Bejelentkezés</button>
                    </form>
                </div>
            </div>
        </>

    )
}