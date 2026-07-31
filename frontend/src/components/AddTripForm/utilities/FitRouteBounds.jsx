import { useEffect } from "react";
import { useMap } from "react-leaflet";

const FitRouteBounds = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length === 0) {
      return;
    }

    map.fitBounds(positions, {
      padding: [30, 30],
    });
  }, [map, positions]);

  return null;
};

export default FitRouteBounds;
