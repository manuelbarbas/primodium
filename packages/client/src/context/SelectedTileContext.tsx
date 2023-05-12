import { createContext, ReactNode, useContext, useState } from "react";
import { DisplayTile } from "../util/constants";

interface SelectedTileContextInterface {
  selectedTile: DisplayTile;
  selectedStartPathTile: DisplayTile;
  selectedEndPathTile: DisplayTile;
  setSelectedTile: React.Dispatch<React.SetStateAction<DisplayTile>>;
  setSelectedStartPathTile: React.Dispatch<React.SetStateAction<DisplayTile>>;
  setSelectedEndPathTile: React.Dispatch<React.SetStateAction<DisplayTile>>;
  showSelectedPathTiles: boolean;
  setShowSelectedPathTiles: React.Dispatch<React.SetStateAction<boolean>>;
  navigateToTile: boolean;
  setNavigateToTile: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SelectedTileContext = createContext<SelectedTileContextInterface>({
  selectedTile: {
    x: 0,
    y: 0,
  } as DisplayTile,
  selectedStartPathTile: {
    x: 0,
    y: 0,
  } as DisplayTile,
  selectedEndPathTile: {
    x: 0,
    y: 0,
  } as DisplayTile,
  setSelectedTile: () => {},
  setSelectedStartPathTile: () => {},
  setSelectedEndPathTile: () => {},
  showSelectedPathTiles: false,
  setShowSelectedPathTiles: () => {},
  navigateToTile: false,
  setNavigateToTile: () => {},
});

const SelectedTileProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTile, setSelectedTile] = useState({
    x: 0,
    y: 0,
  } as DisplayTile);

  const [showSelectedPathTiles, setShowSelectedPathTiles] = useState(false);
  const [selectedStartPathTile, setSelectedStartPathTile] = useState({
    x: 0,
    y: 0,
  } as DisplayTile);
  const [selectedEndPathTile, setSelectedEndPathTile] = useState({
    x: 0,
    y: 0,
  } as DisplayTile);

  // Setting to true navigates to the selectedTile in ResourceTileLayer
  const [navigateToTile, setNavigateToTile] = useState(false);

  return (
    <SelectedTileContext.Provider
      value={{
        selectedTile,
        selectedStartPathTile,
        selectedEndPathTile,
        setSelectedTile,
        setSelectedStartPathTile,
        setSelectedEndPathTile,
        showSelectedPathTiles,
        setShowSelectedPathTiles,
        navigateToTile,
        setNavigateToTile,
      }}
    >
      {children}
    </SelectedTileContext.Provider>
  );
};

export default SelectedTileProvider;

export function useSelectedTile() {
  const selectedTiles = useContext(SelectedTileContext);
  return selectedTiles;
}
