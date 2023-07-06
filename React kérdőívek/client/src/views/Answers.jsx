import { useLocation } from "react-router-dom";
import { useGetAnswersQuery } from "../state/ApiSlice";
import { useState, useEffect } from "react";

export function Answers() {
  const [content, setContent] = useState({}); // Initialize as an empty object

  const location = useLocation();
  const url = new URLSearchParams(location.search);

  const surveyId = url.get("surveyId");

  const { isLoading, data } = useGetAnswersQuery(surveyId);

  useEffect(() => {
    if (data && data[0]?.content) {
      const parsedContent = JSON.parse(data[0].content);
      setContent(parsedContent);
    }
  }, [data]);

  console.log(data);
  console.log(content);

  if (isLoading) {
    return "Data is Loading";
  }

  if (data.length === 0) {
    return <p>No answers yet.</p>;
  }

  return (
    <div className="mainDiv">
      <h2>{data[0]?.survey.name}</h2>
      {Object.keys(content).map((pageKey, index) => {
        return (
          <div key={`div-${index}`}>
            <h3>{pageKey}</h3>
            <div>
              {Object.keys(content[pageKey]).map((questionKey, questionIndex) => {
                const questionNumber = questionIndex + 1;
                return (
                  <div key={`question-${questionIndex}`}>
                    <h4>{`Question ${questionNumber}`}</h4>
                    {data.map((answer, answerIndex) => {
                      const cont = JSON.parse(answer.content);
                      const answerNumber = answerIndex + 1;
                      return (
                        <div key={`answer-${answerIndex}`}>
                          <p>
                            <strong>{`Answer ${answerNumber}`}</strong>: {cont[pageKey][questionKey]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
