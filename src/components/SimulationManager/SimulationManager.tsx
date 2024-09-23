import React, { useState, useEffect } from 'react';
import Button from '../Button/Button';
import VRHeadset from '../VRHeadset/VRHeadset';
import { useWebSocket } from '../WebSocketManager/WebSocketManager';
import SimulationManagerButtons from './SimulationManagerButtons';
import Navigation from '../Navigation/Navigation';
import { useNavigate } from 'react-router-dom';
import { useScreenModeState, useScreenModeSetter } from '../ScreenModeContext/ScreenModeContext';

interface Player {
  connected: boolean;
  date_connection: string;
  in_game: boolean;
}

const SimulationManager: React.FC = () => {
  const { ws, gama, playerList, selectedSimulation, isWsConnected } = useWebSocket(); // `removePlayer` is now available
  const navigate = useNavigate();
  const [userInfos, setUserInfos] = useState<Player | null>(null);
  const [clickedUserInfos, setClickedUserInfos] = useState<boolean>(false);
  const [showPopUp, setShowPopUp] = useState(false);

  // const {setScreenModeDisplay, screenModeDisplay } = useScreenMode();
  // Separate hooks for reading and updating screenModeDisplay
  const screenModeDisplay = useScreenModeState();
  const setScreenModeDisplay = useScreenModeSetter();


  const popPup = () => {  
    setShowPopUp(!showPopUp);
  };

  const togglePopUp = (mode?: string) => {
    if (mode) {
      setScreenModeDisplay(mode); // Update screenModeDisplay from the context
      console.log(`Selected mode: ${mode}, current screenModeDisplay: ${screenModeDisplay}`);
    }
    setShowPopUp(!showPopUp); // Toggle pop-up visibility
  };


  // useEffect(() => {
  //   if (isWsConnected && ws !== null) {
  //     // console.log('WebSocket connected');
  //   }
  // }, [isWsConnected, ws]);

  // Add players to the WebSocket server automatically when the WebSocket connection is established

  // Not add Player List When player has been removed, add again if relaunch the application
  // Redirect to the main page if no simulation is selected
  useEffect(() => {
    if (!selectedSimulation) {
      navigate('/');
    }
  }, [selectedSimulation, navigate]);

  useEffect(() => {
    if (isWsConnected && ws !== null) {
      Object.keys(playerList).forEach((key) => {
        // const player = playerList[key];

        // reconnect player only if in game , if not mean that player has been removed
        // if (player.in_game === true) {
          ws.send(JSON.stringify({ type: 'add_player_headset', id: key }));
        // }
      });
    }
  }, [playerList, isWsConnected, ws]);

  // Handler for removing players
  const handleRemove = (id: string) => {
    if (ws !== null) {
      console.log(`ID headset ${id}`);
      ws.send(JSON.stringify({ "type": "remove_player_headset", id }));
     // removePlayer(id);  // already did in WebSocketManagers
    } else {
      console.error('WebSocket is not connected');
    }
  };

  const handleGetPlayers = () => {
    if (ws !== null) {
      console.log('Player list:', playerList);
    } else {
      console.error('WebSocket is not connected');
    }
  };

  const handleRestart = (id: string) => {
    console.log(`Restart button clicked for headset ${id}`);
    // Logic for restart button
  };

  const handleGetInformation = (id: string) => {
    if (clickedUserInfos === true){
      setClickedUserInfos(false);
    }else{
      setClickedUserInfos(true);
    }
    setUserInfos(playerList[id]);
    // console.log("Infos user : ",userInfos);
  };

  // useEffect((id : string) => {
  //   console.log("Updated playerList in SimulationManager:", playerList);
  //   ws.send(JSON.stringify({ type: 'add_player_headset', id }));

  // }, [playerList]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Navigation />
      <div className="w-2/3 bg-white p-8 shadow-lg rounded-lg text-center">
        {selectedSimulation ? (
          <div>
            <div className="text-3xl mb-4">{selectedSimulation.name}</div>
            <div className="flex justify-center mb-4">
              <div
                style={{ marginTop: '7.5px', marginRight: '15.2px' }}
                className={`w-3 h-3 rounded-full ${gama.connected ? 'bg-green-500' : 'bg-gray-500'}`}
              ></div>
              <span className={gama.connected ? 'text-green-500' : 'text-gray-500'}>
                {gama.connected ? 'Connected' : 'Waiting for connection'}
              </span>
            </div>

            <SimulationManagerButtons />

            {/* AJOUTER LE BOUTON MONOTORING ICI */}
            {/* + Déplacer la logique ici : les functions, appels du context*/}
            
            {/* Monitoring Button */}
            <div className='flex justify-center mt-3'>
              <Button
                text="Monitoring"
                bgColor="bg-blue-500"
                showText={true}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="35" height="35">
                    <rect x="5" y="5" width="30" height="20" rx="2" ry="2" fill="#d1d1d1" stroke="#333" strokeWidth="1"/>
                    <rect x="7" y="7" width="26" height="16" fill="#fff" stroke="#333" strokeWidth="1"/>
                    <line x1="7" y1="15" x2="33" y2="15" stroke="#333" strokeWidth="1"/>
                    <line x1="20" y1="7" x2="20" y2="23" stroke="#333" strokeWidth="1"/>
                    <rect x="18" y="26" width="4" height="4" fill="#333"/>
                    <rect x="16" y="30" width="8" height="2" fill="#333"/>
                  </svg>
                }
                onClick={() => togglePopUp()}
              />

              {/* The PopUp */}
              {showPopUp && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-64 text-center">
                    <h2 className="text-lg font-semibold mb-4">Choose an Option</h2>

                    
                    <div className="flex flex-col space-y-4">
                      
                      <Button
                        text="Gama Screen"
                        bgColor="bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          // setModeScreen("full_screen");
                          // console.log(modeScreen);
                          togglePopUp("gama_screen");
                        }}
                      />

                      <Button
                        text="Shared Screen"
                        bgColor="bg-blue-500 hover:bg-blue-600 "
                        onClick={() => {
                            // setModeScreen("shared_screen");
                            // console.log(modeScreen);
                            togglePopUp("shared_screen");
                        }}
                      />
                      
                    </div>

                    <button
                      className="bg-red-500 mt-4 text-white hover:underline"
                      onClick={() => {togglePopUp()}}
                    >
                      Cancel
                    </button>
                  
                  </div>
                </div>
              )}
            </div>
            {/* End Monotoring button */}

            <div className="flex justify-center mt-8 space-x-4">
              {Object.keys(playerList).map((key) => {
                const player = playerList[key];
                return (
                  <div key={key} className="flex flex-col items-center">
                    <VRHeadset isConnected={player.connected} />
                    <p style={{ marginTop: '3px' }}>id player: {key}</p>
                    <p>{player.connected ? 'Connected' : 'Waiting for connection...'}</p>

                    <div className="flex mt-4 space-x-2">
                      <Button
                        onClick={() => handleRemove(key)}
                        text="Remove"
                        bgColor="bg-red-500"
                        icon={
                          <svg
                            className="w-6 h-6 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        }
                        showText={false}
                      />
                      <Button
                        onClick={() => handleRestart(key)}
                        text="Restart"
                        bgColor="bg-orange-500"
                        icon={
                          <svg
                            className="w-6 h-6 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 4v6h6M20 20v-6h-6M4 10c1.5-2 4-3 6-3h4c2 0 4 1 5 3M4 14c1.5 2 4 3 6 3h4c2 0 4-1 5-3"
                            />
                          </svg>
                        }
                        showText={false}
                      />
                      <Button
                        onClick={() => handleGetInformation(key)}
                        text="Get Information"
                        bgColor="bg-yellow-500"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                           >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20zm0 4h.01"
                            />
                          </svg>             
                        }
                        showText={false}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-3xl mb-4">No simulation selected</div>
        )}
      </div>

      {/* Get Player */}
      <div className="w-2/3 mt-8 grid grid-cols-2 gap-4">
        {/* Column 1 */}
        
        {
        import.meta.env.VITE_APP_ENV === 'development' && (  
        <div>
          {/* <div className="text-lg mt-3 mb-3">Get Players connected:</div> */}
          <Button onClick={handleGetPlayers} text="Get Player list logs" bgColor="bg-purple-500" showText={true} 
            icon= {
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2"/>
                <line x1="12" y1="17" x2="12" y2="12" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="8.5" r="1" fill="white"/>
              </svg>
            }
          />
        </div>
        )}

        {/* Column 2 */}
        <div>
          { userInfos && clickedUserInfos && playerList ? (
          <div>
            <div className="text-xl mt-3 mb-3">Informations Player:</div>
            <p>Connected ? : {String(userInfos.connected)}</p>
            <p>Hour of connection : {userInfos.date_connection}</p>
            <p>Connected in game ? : {String(userInfos.in_game)}</p>
          </div>

          ) : null }
        </div>
      </div>
    
    
    </div>
  );
};

export default SimulationManager;
