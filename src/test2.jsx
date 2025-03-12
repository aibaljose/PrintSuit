import React, { useState, useEffect } from 'react';
import './ConnectionConstellation.css'; // Styles
import { v4 as uuidv4 } from 'uuid'; // Unique IDs

const interestsData = [ // Define interest list here or fetch from API.
  "Photography", "Hiking", "Board Games", "AI", "React.js", "Cooking", "Travel", "Music", "Coding", "Reading"
];

const ConnectionConstellation = () => {
  const [participants, setParticipants] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showInterestSelection, setShowInterestSelection] = useState(true);

  useEffect(() => {
    // Simulate data population (replace with actual user input if needed)
    if (!showInterestSelection) {
      // Simulate adding participants (for demo purposes)
      const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
      const randomInterests = () => {
        const numInterests = Math.floor(Math.random() * 3) + 1; // 1-3 interests
        const shuffledInterests = [...interestsData].sort(() => 0.5 - Math.random());
        return shuffledInterests.slice(0, numInterests);
      };

      const initialParticipants = names.map(name => ({
        id: uuidv4(),
        name: name,
        interests: randomInterests(),
        x: Math.random() * 800,  // Random X position
        y: Math.random() * 600   // Random Y position
      }));

      setParticipants(initialParticipants);
    }
  }, [showInterestSelection]);

  const handleInterestSelection = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmitInterests = () => {
    // Create a new participant
    const newParticipant = {
      id: uuidv4(),
      name: 'You', // Or get from input
      interests: selectedInterests,
      x: Math.random() * 800,
      y: Math.random() * 600
    };

    setParticipants(prevParticipants => [...prevParticipants, newParticipant]);
    setShowInterestSelection(false);  // Hide interest selection
  };

  const findConnections = () => {
    const connections = [];
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const sharedInterests = participants[i].interests.filter(interest =>
          participants[j].interests.includes(interest)
        );
        if (sharedInterests.length > 0) {
          connections.push({
            source: participants[i].id,
            target: participants[j].id,
            sharedInterests: sharedInterests
          });
        }
      }
    }
    return connections;
  };

  const connections = findConnections();

  return (
    <div className="constellation-container">
      <h1>Connection Constellation</h1>

      {showInterestSelection ? (
        <div className="interest-selection">
          <h2>Select Your Interests:</h2>
          <div className="interests-grid">
            {interestsData.map(interest => (
              <button
                key={interest}
                className={`interest-button ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                onClick={() => handleInterestSelection(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
          <button onClick={handleSubmitInterests} disabled={selectedInterests.length === 0}>
            Submit Interests
          </button>
        </div>
      ) : (
        <svg width="800" height="600">
          {connections.map((connection, index) => {
            const source = participants.find(p => p.id === connection.source);
            const target = participants.find(p => p.id === connection.target);

            return (
              <line
                key={index}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth={connection.sharedInterests.length} // Thicker lines for more shared interests
              />
            );
          })}

          {participants.map(participant => (
            <circle
              key={participant.id}
              cx={participant.x}
              cy={participant.y}
              r="10"
              fill="gold"
              stroke="white"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              title={`${participant.name}: ${participant.interests.join(', ')}`}  //Tooltip
            />
          ))}
        </svg>
      )}
    </div>
  );
};

export default ConnectionConstellation;