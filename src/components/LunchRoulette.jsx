import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function CategorySelection() {
  const [categories, setCategories] = useState([]);
  const [menuData, setMenuData] = useState({});
  const [restaurantData, setRestaurantData] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [randomSelections, setRandomSelections] = useState([]);
  const [randomRestaurantSelections, setRandomRestaurantSelections] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    console.log("📂 엑셀 데이터 로드 시작...");
    fetch("/menu.xlsx")
      .then(response => {
        console.log("📂 엑셀 파일 응답 상태:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP 오류 발생: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            if (!workbook.Sheets["category"] || !workbook.Sheets["detail_menu"] || !workbook.Sheets["restaurants"]) {
              throw new Error("❌ 'category', 'detail_menu' 또는 'restaurants' 시트가 존재하지 않음! 엑셀 파일 확인 필요");
            }

            const categorySheet = XLSX.utils.sheet_to_json(workbook.Sheets["category"]);
            const detailMenuSheet = XLSX.utils.sheet_to_json(workbook.Sheets["detail_menu"]);
            const restaurantSheet = XLSX.utils.sheet_to_json(workbook.Sheets["restaurants"]);
            console.log("📂 불러온 데이터:", { categorySheet, detailMenuSheet, restaurantSheet });

            if (categorySheet.length === 0 || detailMenuSheet.length === 0 || restaurantSheet.length === 0) {
              throw new Error("❌ 시트에 데이터가 비어 있음!");
            }

            setCategories(categorySheet.map(row => row.Category));
            const menuMap = detailMenuSheet.reduce((acc, row) => {
              if (!acc[row.Category]) acc[row.Category] = [];
              acc[row.Category].push(row.Menu);
              return acc;
            }, {});
            setMenuData(menuMap);

            const restaurantMap = restaurantSheet.reduce((acc, row) => {
              if (!acc[row.Category]) acc[row.Category] = [];
              acc[row.Category].push(row.Restaurant);
              return acc;
            }, {});
            setRestaurantData(restaurantMap);
          } catch (error) {
            console.error("❌ 데이터 처리 중 오류 발생:", error);
            setErrorMessage(error.message);
          }
        };
        reader.readAsArrayBuffer(blob);
      })
      .catch(error => {
        console.error("❌ 엑셀 파일 로드 오류:", error);
        setErrorMessage(error.message);
      });
  }, []);

  const toggleCategorySelection = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleRestaurantSelection = (category) => {
    setSelectedRestaurants(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const getRandomMenus = () => {
    if (selectedCategories.length === 0) {
      setRandomSelections(["❌ 선택된 카테고리가 없습니다."]);
      return;
    }
    const allMenus = selectedCategories.flatMap(category => menuData[category] || []);
    if (allMenus.length === 0) {
      setRandomSelections(["❌ 선택된 카테고리에 메뉴가 없습니다."]);
      return;
    }
    const shuffledMenus = allMenus.sort(() => 0.5 - Math.random());
    setRandomSelections(shuffledMenus.slice(0, 2));
  };

  const getRandomRestaurants = () => {
    if (selectedRestaurants.length === 0) {
      setRandomRestaurantSelections(["❌ 선택된 카테고리가 없습니다."]);
      return;
    }
    const allRestaurants = selectedRestaurants.flatMap(category => restaurantData[category] || []);
    if (allRestaurants.length === 0) {
      setRandomRestaurantSelections(["❌ 선택된 카테고리에 식당이 없습니다."]);
      return;
    }
    const shuffledRestaurants = allRestaurants.sort(() => 0.5 - Math.random());
    setRandomRestaurantSelections(shuffledRestaurants.slice(0, 2));
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="bg-black text-white p-6 rounded-lg text-center">
        
      </div>
      <div className="bg-gray-100 p-6 rounded-lg mt-6">
        <h2 className="text-xl font-bold mb-2">🍳 오늘 점심 뭐 먹지?</h2>
        <p className="text-sm text-gray-600">오늘 땡기는 카테고리를 선택해보세요! (복수선택 가능)</p>
        <div className="mt-4">{categories.map((category, index) => (
          <label key={index} className="flex items-center mt-2">
            <input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategorySelection(category)} className="mr-2" />
            {category}
          </label>
        ))}</div>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded w-full" onClick={getRandomMenus}>랜덤 메뉴 선택</button>
        {randomSelections.length > 0 && randomSelections.map((menu, index) => <p key={index} className="mt-2">🎲 {menu}</p>)}
      </div>
      <div className="bg-white p-6 rounded-lg mt-6 shadow-md">
        <h2 className="text-xl font-bold mb-2">🏠 오늘 점심 어디서 먹지?</h2>
        <p className="text-sm text-gray-600">오늘 땡기는 카테고리를 선택해보세요! (복수선택 가능)</p>
        <div className="mt-4">{categories.map((category, index) => (
          <label key={index} className="flex items-center mt-2">
            <input type="checkbox" checked={selectedRestaurants.includes(category)} onChange={() => toggleRestaurantSelection(category)} className="mr-2" />
            {category}
          </label>
        ))}</div>
        <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded w-full" onClick={getRandomRestaurants}>랜덤 식당 선택</button>
        {randomRestaurantSelections.length > 0 && randomRestaurantSelections.map((restaurant, index) => <p key={index} className="mt-2">🏠 {restaurant}</p>)}
      </div>
    </div>
  );
}
