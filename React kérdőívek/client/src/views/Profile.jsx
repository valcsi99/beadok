import { useSelector } from "react-redux";
import "./App.css";
import { getLoggedInUser } from "../state/authSlice";
import { useGetSurveysQuery } from "../state/ApiSlice";

export function Profile() {
    const user = useSelector(getLoggedInUser);

    const { isLoading, data } = useGetSurveysQuery(user.id);

    if (isLoading) {
        return "Loading...";
    }
    return (
        <div className="maindiv profile">
            <h2>Profilom</h2>
            <table>
                <tbody>
                    <tr>
                        <th>Név:</th>
                        <td>{user.fullname && user.fullname}</td>
                    </tr>
                    <tr>
                        <th>Email:</th>
                        <td>{user.email && user.email}</td>
                    </tr>
                    <tr>
                        <th>Kérdőíveim:</th>
                        <td>{data.total}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}