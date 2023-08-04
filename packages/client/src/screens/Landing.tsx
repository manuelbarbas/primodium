import { useNavigate, useLocation } from "react-router-dom";

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handlePlay = () => {
    navigate("/game" + location.search);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-700 text-white font-mono">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Primodium</h1>
        <button onClick={handlePlay} className="text-lg">
          Play
        </button>
      </div>
    </div>
  );
};
