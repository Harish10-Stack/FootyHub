import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AdminFixtures = () => {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFixture, setEditingFixture] = useState(null);
  const [formData, setFormData] = useState({
    league: "",
    home: "",
    away: "",
    date: "",
    time: "",
  });
  const [addFormData, setAddFormData] = useState({
    league: "",
    home: "",
    away: "",
    date: "",
    time: "",
  });

  // Fetch fixtures from backend
  const fetchFixtures = async () => {
    try {
      const { data } = await axios.get("https://footyhub-backend-cqir.onrender.com/api/fixtures");
      setFixtures(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFixtures();
  }, []);

  // Delete fixture
  const deleteFixture = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete fixture?",
      text: "This will permanently remove the fixture.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!isConfirmed) return;
    try {
      await axios.delete(`https://footyhub-backend-cqir.onrender.com/api/fixtures/${id}`, {
        withCredentials: true,
      });
      setFixtures(prevFixtures => prevFixtures.filter((f) => f._id !== id));
      Swal.fire("Deleted", "Fixture removed", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error?.response?.data?.message || "Failed to delete fixture", "error");
    }
  };

  // Open edit modal
  const editFixture = (fixture) => {
    setEditingFixture(fixture);
    setFormData({
      league: fixture.league,
      home: fixture.home,
      away: fixture.away,
      date: fixture.date.split("T")[0], // ISO date
      time: fixture.time,
    });
  };

  // Save edited fixture
  const saveFixture = async () => {
    try {
      const { data } = await axios.put(
        `https://footyhub-backend-cqir.onrender.com/api/fixtures/${editingFixture._id}`,
        formData,
        { withCredentials: true }
      );

      setFixtures(
        fixtures.map((f) => (f._id === data._id ? data : f))
      );
      setEditingFixture(null);
      Swal.fire("Success", "Fixture updated successfully", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error?.response?.data?.message || "Failed to update fixture", "error");
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://footyhub-backend-cqir.onrender.com/api/fixtures", addFormData, { withCredentials: true });
      setAddFormData({ league: "", home: "", away: "", date: "", time: "" });
      fetchFixtures();
      alert("Fixture added successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to add fixture");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-green-400">Fixtures</h1>

      {/* Add Fixture Form */}
      <form onSubmit={handleAddSubmit} className="mb-6 bg-gray-800 p-4 rounded-lg space-y-2">
        <input
          type="text"
          name="league"
          placeholder="League"
          value={addFormData.league}
          onChange={handleAddChange}
          className="w-full p-2 rounded bg-gray-700 text-gray-100"
          required
        />
        <input
          type="text"
          name="home"
          placeholder="Home Team"
          value={addFormData.home}
          onChange={handleAddChange}
          className="w-full p-2 rounded bg-gray-700 text-gray-100"
          required
        />
        <input
          type="text"
          name="away"
          placeholder="Away Team"
          value={addFormData.away}
          onChange={handleAddChange}
          className="w-full p-2 rounded bg-gray-700 text-gray-100"
          required
        />
        <input
          type="date"
          name="date"
          value={addFormData.date}
          onChange={handleAddChange}
          className="w-full p-2 rounded bg-gray-700 text-gray-100"
          required
        />
        <input
          type="time"
          name="time"
          value={addFormData.time}
          onChange={handleAddChange}
          className="w-full p-2 rounded bg-gray-700 text-gray-100"
          required
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-gray-900 px-4 py-2 rounded font-semibold"
        >
          Add Fixture
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : fixtures.length === 0 ? (
        <p>No fixtures available.</p>
      ) : (
        <table className="w-full border border-gray-700 text-left">
          <thead>
            <tr>
              <th className="border p-2">League</th>
              <th className="border p-2">Home</th>
              <th className="border p-2">Away</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Time</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.map((f) => (
              <tr key={f._id} className="hover:bg-gray-700">
                <td className="border p-2">{f.league}</td>
                <td className="border p-2">{f.home}</td>
                <td className="border p-2">{f.away}</td>
                <td className="border p-2">{f.date.split("T")[0]}</td>
                <td className="border p-2">{f.time}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => editFixture(f)}
                    className="bg-yellow-500 px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteFixture(f._id)}
                    className="bg-red-600 px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit Modal */}
      {editingFixture && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-green-400 mb-4">Edit Fixture</h2>
            <input
              type="text"
              name="league"
              placeholder="League"
              value={formData.league}
              onChange={handleChange}
              className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-100"
            />
            <input
              type="text"
              name="home"
              placeholder="Home Team"
              value={formData.home}
              onChange={handleChange}
              className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-100"
            />
            <input
              type="text"
              name="away"
              placeholder="Away Team"
              value={formData.away}
              onChange={handleChange}
              className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-100"
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-100"
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full p-2 mb-4 rounded bg-gray-800 text-gray-100"
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-green-500 px-4 py-2 rounded"
                onClick={saveFixture}
              >
                Save
              </button>
              <button
                className="bg-gray-700 px-4 py-2 rounded"
                onClick={() => setEditingFixture(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFixtures;




