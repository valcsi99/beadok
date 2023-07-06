import answerspng from "../assets/answers.png";
import clipboardpng from "../assets/clipboard.png";
import editpng from "../assets/edit.png";
import deletepng from "../assets/delete.png";
import { useSelector } from "react-redux";
import { getLoggedInUser } from "../state/authSlice";
import { useDelSurveyMutation, useGetSurveysWithLimitsQuery } from "../state/ApiSlice";
import { useNavigate } from "react-router-dom";

export function Survey({survey, index, surveyId, page}) {
    const [ delSurvey, { isLoading, isSuccess, isError } ] = useDelSurveyMutation();
    const user = useSelector(getLoggedInUser);
    const { refetch } = useGetSurveysWithLimitsQuery(`userId=${user.id}&$limit=5&$skip=${page * 5}`)

    const navigate = useNavigate();

    const handleDelete = () => {
        delSurvey(surveyId)
        .unwrap()
        .then((response) => {
            console.log("Survey Deleted: ", response);
            refetch();
        })
        .catch((error) => {
            console.error("Deleting survey failed: ", error);
        })
    }

    const handleEdit = () => {
        const routePath = `/new-survey?surveyId=${survey.id}&name=${encodeURIComponent(survey.name)}&content=${encodeURIComponent(survey.content)}&page=${page}`;
        navigate(routePath, { replace: true });
      };

    const copyToClipBoard = (hash) => {
        navigator.clipboard.writeText(`http://localhost:5173/survey?hash=${hash}`);
        alert("Link copied!");
    }
    
    const handleAnswers = () => {
        navigate(`/answers?surveyId=${survey.id}`, { replace: true });
    }

    if (isLoading) {
        console.log("loading");
    }
    if (isSuccess) {
        console.log("deleted successfully");
    }
    if (isError) {
        console.log("Error deleting");
    }
    
    return (
        <div className={index % 2 === 0 ? 'survey survey1' : 'survey survey2'}>
            <span className="name">{survey.name}</span>
            <div className="actions">
                <img src={answerspng} alt="" onClick={() => handleAnswers(survey.hash)} />
                <img src={clipboardpng} alt="" onClick={() => copyToClipBoard()} />
                <img src={editpng} alt="" onClick={handleEdit} />
                <img src={deletepng} alt="" onClick={handleDelete} />
            </div>
        </div>
    );
}