import "./register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../state/ApiSlice";

export function Register() {

    const [data, setData] = useState({
        email: "",
        password:"",
        fullname:""
    });

    const [register, { isError, error }] = useRegisterMutation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        register(data)
        .unwrap()
        .then((response) => {
            console.log("User registered: ", response);
            navigate('/login', {replace: true});
        })
        .catch((error) => {
            console.error("User registration failed: ", error);
        })
    }

    const handleChange = (e) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
          });
    }

    return (
        <>
            <div className="maindiv">
                <h2>Regisztráció</h2>
                <div className="registerdiv">
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="fullname">Név</label>
                        <input type="text" name="fullname" onChange={handleChange} />
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" onChange={handleChange} />
                        <label htmlFor="password">Jelszó</label>
                        <input type="password" name="password" onChange={handleChange} />
                        <button type="submit">Regisztrálás</button>
                    </form>
                </div>
            </div>
        </>

    )
}