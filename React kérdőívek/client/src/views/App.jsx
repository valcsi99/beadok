import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainPage } from "./MainPage";
import { Register } from "./Register";
import { Login } from "./Login";
import Navbar from './NavBar';
import { Profile } from './Profile';
import { Surveys } from './Surveys';
import { Logout } from './logout';
import { NewSurvey } from './NewSurvey';
import { RequireAuth } from './RequireAuth';
import { SurveyForm } from './SurveyForm';
import { Answers } from './Answers';

function App() {

  return (

    <BrowserRouter>
      <Navbar></Navbar>
      <Routes>
        <Route exact path="/" element={<MainPage />} />
        <Route exact path="/register" element={<Register />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route exact path="/surveys" element={<RequireAuth><Surveys /></RequireAuth>} />
        <Route exact path="/new-survey" element={<RequireAuth><NewSurvey /></RequireAuth>} />
        <Route exact path="/logout" element={<RequireAuth><Logout /></RequireAuth>} />
        <Route exact path="/survey" element={<RequireAuth><SurveyForm /></RequireAuth>} />
        <Route exact path="/answers" element={<RequireAuth><Answers /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
