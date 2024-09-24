import React, { useState } from 'react';

interface VRHeadsetProps {
  selectedPlayer?: any;  
  className?: string;
}

const VRHeadset: React.FC<VRHeadsetProps> = ({ selectedPlayer, className }) => {
  const [showPopUp, setShowPopUp] = useState(false);

  // Determined if the player is available
  const isAvailable = !!selectedPlayer;

  const togglePopUp = () => {
    setShowPopUp(!showPopUp);
  };

  return (
    <>
      <div
        className={`flex flex-col items-center ${className} ${isAvailable ? 'grayscale-0' : 'opacity-50 cursor-not-allowed'}`}
        style={{ transition: 'all 0.3s ease', cursor: isAvailable ? 'pointer' : 'not-allowed' }}
      >
        <img
          src="/images/virtual-reality-headset-removebg-preview.png" 
          alt="VR Headset"
          className={`w-32 h-32 object-cover mb-2 ${isAvailable ? 'hover:scale-105' : ''}`} 
          onClick={() => {
            if (isAvailable) {
              togglePopUp(); 
            }
          }}
        />

      {/* Pop-up pour afficher les informations du joueur */}
      </div>
        
      {showPopUp && isAvailable && (
        <>
          {/* Grey Overley */}
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50"></div>

          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-72 text-center">
              <h2 className="text-lg font-semibold mb-4">Player Informations</h2>
              <p>Status : {String(selectedPlayer.connected)}</p>
              <p>Hour of connection : {selectedPlayer.date_connection}</p>
              <p>In game : {String(selectedPlayer.in_game)}</p>

              <button
                className="bg-red-500 text-white px-4 py-2 mt-4 rounded"
                onClick={togglePopUp}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default VRHeadset;
