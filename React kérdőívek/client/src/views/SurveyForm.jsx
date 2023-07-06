import { useLocation, useNavigate } from "react-router-dom";
import { useGetSurveyByHashQuery, useSendAnswersMutation } from "../state/ApiSlice";
import "./surveyform.css";
import { useState, useEffect } from "react";

export function SurveyForm() {
  const [page, setPage] = useState(0);
  const [isNextDisabled, setIsNextDisabled] = useState();
  const [content, setContent] = useState([]);
  const [answers, setAnswers] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [pageCompletion, setPageCompletion] = useState([]);

  const location = useLocation();
  const urlparams = new URLSearchParams(location.search);
  const hash = urlparams.get("hash");
  const { isLoading, data } = useGetSurveyByHashQuery(hash);
  const [addSurvey, { isError, isSuccess, isLoading: answerLoading }] = useSendAnswersMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      const parsedContent = JSON.parse(data?.[0].content);
      setContent(parsedContent);
    }
  }, [data]);

  useEffect(() => {
    if (content.length > 0) {
      const currentPageAnswers = answers[`Page${page + 1}`] || {};
      setInputValues(currentPageAnswers);
    }
  }, [page, answers, content]);

  const nextPage = () => {
    if (page >= content.length - 1) {
      return;
    }
    setPage(page + 1);
  };

  const prevPage = () => {
    if (page <= 0) {
      return;
    }
    setPage(page - 1);
  };

  const handleClick = (pageIndex) => {
    const isCurrentPage = pageIndex === page;
    const isPreviousPage = pageIndex < page;
    const isPageCompleted = pageCompletion[pageIndex];
    const isNextPage = pageIndex > page;

    let pagesCompleted = true;
    for (let i = 0; i < pageIndex; i++) {
        if (!pageCompletion[i]) {
            pagesCompleted = false;
        }
    }
  
    if (isPreviousPage && isPageCompleted) {
      setPage(pageIndex);
    } else if (isNextPage && pagesCompleted) {
      setPage(pageIndex);
    }
  };

  const handleChange = (e) => {
    const { name, value, id } = e.target;
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [`Page${page + 1}`]: {
        ...prevAnswers[`Page${page + 1}`],
        [id]: value
      }
    }));
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [id]: value
    }));

    const currentPageInputs = Array.from(document.querySelectorAll(`.questions input`));
    const currentPageComplete = currentPageInputs.every(input => input.value !== "");
  
    setPageCompletion(prevPageCompletion => {
    const updatedPageCompletion = [...prevPageCompletion];
    updatedPageCompletion[page] = currentPageComplete;
    return updatedPageCompletion;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    addSurvey({content: JSON.stringify(answers), surveyId: data[0].id})
    .unwrap()
    .then((response) => {
        console.log("Answers sent: ", response);
        navigate('/', { replace: true });
    })
    .catch((error) => {
        console.error("Sending answers failed: ", error);
    })
  }

  const inputs = document.querySelectorAll('input');

  useEffect(() => {
    setIsNextDisabled(Array.from(inputs).every(input => input.value !== ""));
  }, [inputs]);

  if (isLoading) {
    return "Loading...";
  }

  if (isSuccess) {
    console.log("Success sending");
  }

  if (isError) {
    console.log("Error sending");
  }

  if (answerLoading) {
    console.log("Sending answers...");
  }

  return (
    <div className="mainDivv">
      <h2>{data?.[0].name}</h2>
      <div className="pages">
        {content?.map((_, index) => (
          <div
            onClick={() => handleClick(index)}
            key={index + 1}
            className={`pagesDiv ${page === index ? "activePage" : ""} ${pageCompletion[index] ? "donePage" : ""}`}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <div className="questions">
        {content[page]?.questions.map((question, index) => (
          <div key={`div-${index}`}>
            <label key={`${page}label-${index}`} htmlFor={`Question${index + 1}`}>
              {question}
            </label>
            <input
              key={`${page}input-${index}`}
              id={`q${index + 1}`}
              name={`Question${index + 1}`}
              type="text"
              value={inputValues[`q${index + 1}`] || ""}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>
      <div>
        <button disabled={!page} onClick={prevPage} className="buttonss">
          Vissza
        </button>
        <button
          disabled={!isNextDisabled || (content && page >= content.length - 1)}
          onClick={nextPage}
          className="buttonss"
        >
          Tovább
        </button>
        {page === content.length - 1 && (
          <button onClick={handleSubmit} className="buttonss">Küldés</button>
        )}
      </div>
    </div>
  );
}
