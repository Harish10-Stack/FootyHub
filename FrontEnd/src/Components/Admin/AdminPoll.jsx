import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPoll() {
  const [poll, setPoll] = useState({ totalMessi: 0, totalRonaldo: 0, voters: [] });

  const fetchPoll = async () => {
    try {
      const res = await axios.get("https://footyhub-backend-cqir.onrender.com/api/poll");
      setPoll(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchPoll(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Fan Poll</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0f1720] p-6 rounded-lg border border-[#23303a]">
          <div className="text-sm text-gray-400">Messi</div>
          <div className="text-2xl font-semibold mt-2">{poll.totalMessi}</div>
        </div>
        <div className="bg-[#0f1720] p-6 rounded-lg border border-[#23303a]">
          <div className="text-sm text-gray-400">Ronaldo</div>
          <div className="text-2xl font-semibold mt-2">{poll.totalRonaldo}</div>
        </div>
      </div>

      <div className="bg-[#0b1114] border border-[#22282c] rounded-lg p-4 shadow-sm overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Voters List</h2>
        <table className="w-full text-left">
          <thead className="text-xs text-gray-400">
            <tr>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2">Voted For</th>
              <th className="py-2 px-2">Voted At</th>
            </tr>
          </thead>
          <tbody>
            {poll.voters && poll.voters.map((voter, index) => (
              <tr key={index} className="border-t border-[#11181b]">
                <td className="py-3 px-2">{voter.user?.name || 'Unknown'}</td>
                <td className="py-3 px-2">{voter.user?.email || 'Unknown'}</td>
                <td className="py-3 px-2 capitalize">{voter.player}</td>
                <td className="py-3 px-2">{new Date(voter.votedAt).toLocaleString()}</td>
              </tr>
            ))}
            {(!poll.voters || poll.voters.length === 0) && (
              <tr>
                <td colSpan="4" className="text-gray-500 py-3 px-2">No voters yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
