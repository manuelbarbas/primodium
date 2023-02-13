import { createContext, ReactNode, useState } from "react";
import { DisplayTile } from "../util/constants";

interface SelectedTileContextInterface {
  selectedTile: DisplayTile;
  selectedStartPathTile: DisplayTile;
  selectedEndPathTile: DisplayTile;
  setSelectedTile: React.Dispatch<React.SetStateAction<DisplayTile>>;
  setSelectedStartPathTile: React.Dispatch<React.SetStateAction<DisplayTile>>;
  setSelectedEndPathTile: React.Dispatch<React.SetStateAction<DisplayTile>>;
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
});

const SelectedTileProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTile, setSelectedTile] = useState({
    x: 0,
    y: 0,
  } as DisplayTile);
  const [selectedStartPathTile, setSelectedStartPathTile] = useState({
    x: 0,
    y: 0,
  } as DisplayTile);
  const [selectedEndPathTile, setSelectedEndPathTile] = useState({
    x: 0,
    y: 0,
  } as DisplayTile);

  return (
    <SelectedTileContext.Provider
      value={{
        selectedTile: selectedTile,
        selectedStartPathTile: selectedStartPathTile,
        selectedEndPathTile: selectedEndPathTile,
        setSelectedTile: setSelectedTile,
        setSelectedStartPathTile: setSelectedStartPathTile,
        setSelectedEndPathTile: setSelectedEndPathTile,
      }}
    >
      {children}
    </SelectedTileContext.Provider>
  );
};

export default SelectedTileProvider;
