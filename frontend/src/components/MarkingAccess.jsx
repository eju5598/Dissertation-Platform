import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function MarkingAccess({ assignmentId }) {

  const [canStartMarking, setCanStartMarking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    const checkAccess = async () => {
      try {

        const res = await api.get(
          `/api/assignments/${assignmentId}/marking-access/`
        );

        setCanStartMarking(res.data.can_start_marking);

      } catch (error) {
        console.error("Error checking marking access", error);
      }
    };

    checkAccess();

  }, [assignmentId]);

  const handleStartMarking = () => {
    navigate(`/marking/${assignmentId}`);
  };

  return (
    <div>
      {canStartMarking ? (
        <button
          className="btn btn-primary"
          onClick={handleStartMarking}
        >
          Start Marking
        </button>
      ) : (
        <p style={{ color: "gray" }}>
          Marking available after submission deadline
        </p>
      )}
    </div>
  );
}

export default MarkingAccess;