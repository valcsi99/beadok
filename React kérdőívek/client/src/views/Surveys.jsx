import { useSelector } from "react-redux";
import { useGetSurveysWithLimitsQuery } from "../state/ApiSlice";
import "./surveys.css";
import { getLoggedInUser } from "../state/authSlice";
import { Survey } from "./Survey.jsx";
import { useState } from "react";

export function Surveys() {
    const user = useSelector(getLoggedInUser);
    const [page, setPage] = useState(0);
    const { isLoading, data } = useGetSurveysWithLimitsQuery(`userId=${user.id}&$limit=5&$skip=${page * 5}`);
    
    const nextPage = () => {
        if (data.length < 5) {
            return;
        }
        setPage(page + 1);
    }

    const prevPage = () => {
        if (page <= 0) {
            return;
        }
        setPage(page - 1);
    }

    if (isLoading) {
        return 'Loading...';
    }

    return (
        <div className="mainDiv">
            <h2>Kérdőívek</h2>
            <div>
                <div className="headDiv">
                    <span className="nameH">Név</span><span className="actionsH">Opciók</span>
                </div>
                {data && data.map((survey, index) => (
                            <Survey surveyId={survey.id} key={index} survey={survey} index={index} page={page}/>
                        ))}
            </div>
            <div>
                <button disabled={!page} onClick={prevPage} className="buttons">Előző</button>
                <button disabled={data && (data.length < 5)} onClick={nextPage} className="buttons">Következő</button>
            </div>
        </div>
    );
}