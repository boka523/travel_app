import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar/Navbar";
import EditTripForm from "../../components/EditTripForm/EditTripForm";
import { API_URL } from "../../config";

const EditTrip = ({ darkMode, toggleMode }) => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setIsLoadingTrip(true);

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/trips/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error);
          return;
        }

        setTrip(data.trip);
      } catch (error) {
        toast.error(error);
      } finally {
        setIsLoadingTrip(false);
      }
    };
    fetchTrips();
  }, [id]);

  return (
    <div>
      <Navbar darkMode={darkMode} toggleMode={toggleMode} variant="add-trips" />
      {isLoadingTrip ? (
        <p>Učitavanje putovanja...</p>
      ) : trip ? (
        <EditTripForm darkMode={darkMode} trip={trip} setTrip={setTrip} />
      ) : (
        <p>Putovanje nije pronađeno.</p>
      )}
    </div>
  );
};

export default EditTrip;
