import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../WebSocketManager/WebSocketManager';
import { useEffect, useState } from 'react';
import Button from '../Button/Button';
import Navigation from '../Navigation/Navigation';
import VRHeadset from '../VRHeadset/VRHeadset';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const SelectorSimulations = () => {
  const { ws, isWsConnected, simulationList, playerList, gama } = useWebSocket();
  const [directoryPath, setDirectoryPath] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false); 
  const [connectionStatus, setConnectionStatus] = useState<string>('Waiting for connection ...'); 
  const {t} = useTranslation();
  const [indexSimulationCustom, setIndexSimulationCustom] = useState<number>(-1);

  const [formData, setFormData] = useState({
    ip_address_gama_server: '',
    gama_ws_port: '',
    model_file_path: '',
    model_file_path_type: 'Absolute',
    experiment_name: '',
    player_ws_port: '',
    player_web_interface: false,
    player_html_file: '',
    monitor_ws_port: '',
    app_port: '',
    enable_verbose: false,
  });


  const navigate = useNavigate(); 

  useEffect(() => {
    if (isWsConnected && ws !== null) {
      ws.send(JSON.stringify({ type: 'get_simulation_informations' }));
      setLoading(true);
    }
  }, [isWsConnected, ws]);

  useEffect(() => {
    if (simulationList.length > 0) {
      setLoading(false);
    }
  }, [simulationList]);

  const handleSimulation = (index: number) => {
    if (isWsConnected && ws !== null) {
      // console.log("INDEX: ",index);
      ws.send(JSON.stringify({ type: 'get_simulation_by_index', simulationIndex: index }));
      
      setTimeout(() => {
        navigate('/simulationManager');
      }, 100); 
    } else {
      console.error('WebSocket is not connected');
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRemove = (index: number) => {
    if (ws !== null) {
      ws.send(JSON.stringify({"type": "remove_player_headset", "id": index}));
    } else {
      console.error("WS is null");
    }
  };

  const handleRestart = (index: number) => {
    console.log(`Restart button clicked for headset ${index}`);
    // Logic for restart button ...
  };


  // In the dev mode, we can change the model path 
  const handleChangeModelPath = (modelFilePathParam:string) => {
    if (ws) {
      // console.log("ModelFilePathParam:", modelFilePathParam);
      // console.log("The default simulation is selected", selectedSimulation); // not nescessary

      ws.send(JSON.stringify({ type: 'settings_change_model_file_path', modelFilePath: modelFilePathParam}));
      

      // ws.send(JSON.stringify({ type: 'get_simulation_by_index', simulationIndex: index }));


      setTimeout(() => {
        navigate('/simulationManager');
      }, 100); 


      // Not necessary according to me to restart 
      // ws.send(JSON.stringify({ type: 'restart'}));
    }

  };

  // Loop which try to connect to Gama
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (ws && !gama.connected) {
      interval = setInterval(() => {
        ws.send(JSON.stringify({ type: 'try_connection' }));
        console.log('Tentative de connexion à Gama...');
      }, 3000); 
    }

    return () => {
      clearInterval(interval); 
    };
  }, [ws, gama.connected]);

  // Display connexion statue
  useEffect(() => {
    if (gama.connected) {
      setConnectionStatus('');
    } else {
      setConnectionStatus('Please launch Gama...');
    }
  }, [gama.connected]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">

     <LanguageSelector />   
      
      <Navigation />

      {loading ? (
        <div className="text-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24 mb-4"></div>
          <h2 className="text-gray-700">Loading simulations...</h2>
        </div>
      ) : (
        
        // Display simulations cards
        <div className="flex flex-col items-center justify-center bg-white p-8">
        <div className="flex items-center justify-between ">
          
          <div className="grid grid-cols-3 mt-5 mb-8" style={{ gap: '55px' }}>
            
            
            {simulationList.map((simulation, index) => (
             
              
             <div
              className={`bg-white shadow-lg rounded-3xl p-6 flex flex-col items-center h-40 cursor-pointer ${
                !gama.connected ? 'opacity-50 cursor-not-allowed' : ''
              }`}                
              
              style={{
                  backgroundImage: `url(${simulation.splashscreen})`,
                  backgroundSize: 'cover',
                  width: '100px',
                  height: '100px',
                }}
                key={index}
                onClick={ gama.connected ? () => handleSimulation(index) : () => {} }
                
              >
                <h2
                  className="text-gray-500 text-sm text-center"
                  style={{
                    marginTop: '80px',
                  }}
                >
                  {simulation.name}
                </h2>
              </div>
            ))}
          </div>
      
          {/* Right Button from the grid */}
          {import.meta.env.VITE_APP_ENV === 'development' && (
            <div className="ml-20 ">

              <div
              className={`bg-white shadow-lg rounded-3xl p-6 flex flex-col items-center h-40 cursor-pointer ${
                !gama.connected ? 'opacity-50 cursor-not-allowed' : ''
              }`}                
              
              style={{
                  backgroundImage: `url(/images/codecode.png)`,
                  backgroundSize: 'cover',
                  width: '100px',
                  height: '100px',
                  marginBottom:'13px'
                }}
                // key={index}
                onClick={() => setShowCustomInput(!showCustomInput)}
                
              >
                <h2
                  className="text-gray-500 text-sm text-center "
                  style={{
                    marginTop: '80px',
                  }}
                >
                  DevMode
                </h2>
              </div>

            </div>
          )}
        </div>


        {/* Display the statue, ask for the user to connect to Gama if still not */}
      <div className='flex gap-2 mt-6'>
        <span className={gama.connected ? 'text-green-500'  : 'text-red-500'}>    
           {gama.connected ? '' : connectionStatus }
        </span>

      </div>

      </div>
      

      )}

      
      {/* Show hidden sections*/}
      {showCustomInput && (
        
        // Section: path to start a custom simulation
        <div className="mt-4 w-full" style={{ marginTop: '20px', marginBottom: '-25px' }} >
          
          <h1 className="text-lg font-bold mb-4"> {t('enter_path')} </h1> 

        {/* New form for change the model file path  */}
        <div>
            <label htmlFor="model-file-path" className="block text-gray-700">
              Model file path
            </label>
            <input
              type="text"
              id="model-file-path"
              name="model_file_path"
              value={formData.model_file_path}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

        {/* <Link to="/simulationManager" className="text-white hover:text-gray-400"> */}
          <button
            onClick={() => handleChangeModelPath(formData.model_file_path)}
            className='bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 mt-4'
          >
            Change Model Path 
          </button>
        {/* </Link> */}

        <h1 className="text-lg font-bold mb-4"> Change simulation path</h1> 

        <Link to="/ParameterSettings" className="text-white hover:text-gray-400">
          <Button
            bgColor='bg-green-500'
            text='Change path'
          />
        </Link>


        {/* // Section: Get simulation informations */}
        <div className="mt-7">
         <h1 className="text-lg font-bold mb-5"> {t('get_sim_infos')} </h1>
         <Button
            onClick={() => {
              if (isWsConnected && ws !== null) {
                ws.send(JSON.stringify({ type: 'get_simulation_informations' }));
              } else {
                console.error('WebSocket is not connected');
              }
            }}
            text={t('get_sim_infos')}
            bgColor="bg-green-500"
            showText={true}
          />
        </div>
        

        { /* 
           *Section display headsets 
           */
        }
        {playerList && Object.keys(playerList).length > 0 && (
          <>
            <h1 className="text-lg  font-bold mb-4 mt-4">HeadSet connected:</h1>

            <div className="flex justify-center mt-8 space-x-4">
              {Object.keys(playerList).map((key, index) => {
                const player = playerList[key];
                return (
                  <div key={index} className="flex flex-col items-center">
                    
                    <VRHeadset
                      key={key}
                      selectedPlayer={player}  // Pass the player data as props
                    />

                    <p style={{ marginTop: "3px" }}>id player: {key}</p>
                    <p>{player.connected ? 'Connected' : 'Waiting for connection..'}</p>

                    {/* Buttons under each player */}
                    <div className="flex mt-4 space-x-2">
                      <Button
                        onClick={() => handleRemove(index)}
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
                        onClick={() => handleRestart(index)}
                        text="Restart"
                        bgColor="bg-orange-500"
                        icon={
                          <svg
                            className="w-6 h-6 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 24 24"
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
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
        
      )}

      {/* Footer of the page */}
      <footer className="flex justify-between items-center p-4 border-t border-gray-300  w-full" style={{ marginTop: '100px' }} >
        <div className='flex'>
          <img src="/images/global-gateway-euro.png" alt="Global Gateway" className="h-8" />
          <img src="/images/funded-by-ue.png" alt="Global Gateway" className="h-8" />
        </div>

        <div className='flex gap-3' >
          <img src="images/IRD-logo.png" alt="IRD" className="h-8" />
          <img src="images/nstda-logo.png" alt="CTU" className="h-8" />
          <img src="images/ctu-logo.png" alt="NSTDA" className="h-8" />
        </div>
      </footer>

    </div>
  );
};

export default SelectorSimulations;
