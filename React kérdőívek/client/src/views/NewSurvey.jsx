import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./surveys.css";
import { useAddSurveyMutation, useGetSurveysQuery, useGetSurveysWithLimitsQuery, useModifySurveyMutation } from "../state/ApiSlice";
import { getLoggedInUser } from "../state/authSlice";
import { useLocation, useNavigate } from "react-router-dom";

export function NewSurvey() {

  const location = useLocation();
  const surveyDataGet = new URLSearchParams(location.search);

  const prepopulatedData = {
    surveyId: surveyDataGet.get("surveyId"),
    name: surveyDataGet.get("name"),
    content: surveyDataGet.get("content"),
    page: surveyDataGet.get("page"),
  };

  const user = useSelector(getLoggedInUser);

  const [surveyData, setSurveyData] = useState(prepopulatedData.surveyId !== null ? {name: prepopulatedData.name, content: prepopulatedData.content} : {});

  const [addSurvey, { isError, isSuccess, isLoading }] = useAddSurveyMutation();
  const [modify, { isError:modifyError, isSuccess:modifySuccess, isLoading:modifyLoading }] = useModifySurveyMutation();
  const { data } = useGetSurveysQuery(user.id);
  const totalPages = data?.total ? Math.ceil(data.total / 5) - 1 : 0;
  const { refetch } = useGetSurveysWithLimitsQuery(`userId=${user.id}&$limit=5&$skip=${prepopulatedData.page !== null ? prepopulatedData.page * 5 : totalPages * 5}`);

  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      refetch();
    }
  }, [data, refetch]);

  const handleOnChange = (e) => {
    const content = e.target.value;
    const lines = content.split('\n');
    const name = lines.shift();
    let pages = [];

    let rawdata = { name: name, content: pages };
    let pagenum = 0;
    let currentPageKey = "";

    for (let i = 0; i < lines.length; i++) {
      const page = lines[i];
      if (page === "") {
        continue;
      }
      pagenum++;
      currentPageKey = `Page${pagenum}`;
      rawdata.content.push({ name: currentPageKey, questions: [] });

      let endOfPage = false;
      for (let j = i + 1; j < lines.length && !endOfPage; j++) {
        const question = lines[j];
        if (question === "") {
          endOfPage = true;
          i = j;
          break;
        }
        rawdata.content[pagenum - 1].questions.push(question);
        if (j === lines.length - 1) {
          i = j;
          break;
        }
      }
    }
    rawdata.content = JSON.stringify(rawdata.content);
    setSurveyData(rawdata);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!prepopulatedData.surveyId) {
      addSurvey(surveyData)
        .unwrap()
        .then((response) => {
          console.log("Survey added: ", response);
          refetch();
          navigate('/surveys', { replace: true });
        })
        .catch((error) => {
          console.error("New survey failed: ", error);
        })
    }
    else {
      modify({surveyId: prepopulatedData.surveyId, body: surveyData})
        .unwrap()
        .then((response) => {
          console.log("Survey modified: ", response);
          refetch();
          navigate('/surveys', { replace: true });
        })
        .catch((error) => {
          console.error("Modifying survey failed: ", error);
        })
    }
  }

  const formatContent = (preData) => {
    if (!preData.surveyId) return '';

    let parsedContent = `${preData.name}\n\n`;

    const parsedContentObj = JSON.parse(preData.content);

    parsedContentObj.forEach(page => {
      parsedContent += `${page.name}\n`;
      page.questions.forEach(question => {
        parsedContent += `${question}\n`;
      })
      parsedContent += '\n';
    });

    return parsedContent;
  }

  if (isLoading) {
    console.log("Loading...");
  }

  if (isError) {
    console.log("Error creating new survey");
  }

  if (isSuccess) {
    console.log("New survey created successfully");
  }

  if (modifyLoading) {
    console.log("Loading modify...");
  }

  if (modifyError) {
    console.log("Error modifying survey");
  }

  if (modifySuccess) {
    console.log("Survey modified successfully");
  }

  return (
    <div className="mainDiv">
      <h1>Új kérdőív</h1>
      <form action="">
        <textarea defaultValue={formatContent(prepopulatedData)} onChange={handleOnChange} name="newsurvey" cols="70" rows="25" placeholder="Survey name&#13;&#10;&#13;&#10;Page1&#13;&#10;Question1&#13;&#10;Question2&#13;&#10;&#13;&#10;Page2&#13;&#10;Question3&#13;&#10;Question4&#13;&#10;&#13;&#10;Page3&#13;&#10;Question5&#13;&#10;Question6&#13;&#10;&#13;&#10;..."></textarea>
        <button className="addButton buttons" onClick={handleSubmit}>Kész</button>
      </form>

    </div>
  );
}