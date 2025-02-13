import React from "react";
import "./App.css";
import LunchRoulette from "./components/LunchRoulette.jsx";  // ✅ .jsx 확장자로 변경

function App() {
  return (
    <div>
      <h1>🍽️ 점심 메뉴 룰렛</h1>  
      <LunchRoulette />  
    </div>
  );
}

export default App;
