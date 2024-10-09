import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../WebSocketManager/WebSocketManager';

const SettingsForm: React.FC = () => {
  const { ws, isWsConnected, selectedSimulation } = useWebSocket();
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

  // Handle incoming WebSocket messages to populate form
  useEffect(() => {
    if (ws) {
      ws.onmessage = (event: MessageEvent) => {
        const jsonSettings = JSON.parse(event.data);
        if (jsonSettings.type === 'json_settings') {
          setFormData({
            ip_address_gama_server: jsonSettings.ip_address_gama_server || '',
            gama_ws_port: jsonSettings.gama_ws_port || '',
            model_file_path: jsonSettings.model_file_path || '',
            model_file_path_type: jsonSettings.type_model_file_path === 'absolute' ? 'Absolute' : 'Relative',
            experiment_name: jsonSettings.experiment_name || '',
            player_ws_port: jsonSettings.player_ws_port || '',
            player_web_interface: jsonSettings.player_web_interface || false,
            player_html_file: jsonSettings.player_html_file || '',
            monitor_ws_port: jsonSettings.monitor_ws_port || '',
            app_port: jsonSettings.app_port || '',
            enable_verbose: jsonSettings.verbose || false,
          });
        }
      };
    }
  }, [ws]);


  const handleChangeModelPath = (modelFilePathParam:string) => {

    if (ws) {

      // console.log("ModelFilePathParam:", modelFilePathParam);
      console.log("The default simulation is selected", selectedSimulation); // pas besoin dans 

      ws.send(JSON.stringify({ type: 'settings_change_model_file_path', modelFilePath: modelFilePathParam}));
      
      // Not necessary according to me to restart 
      // ws.send(JSON.stringify({ type: 'restart'}));
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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ws && isWsConnected) {
      const typePath = formData.model_file_path_type === 'Absolute' ? 'absolute' : 'relative';
      const jsonSettings = {
        type: 'json_settings',
        ...formData,
        type_model_file_path: typePath,
      };
      ws.send(JSON.stringify(jsonSettings));
      window.location.href = '/settings'; // Redirect to settings page
    } else {
      alert('WebSocket is not connected');
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gama Server Middleware</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Settings: </h2>
          
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

          <div>
            <label htmlFor="model-file-path-type" className="block text-gray-700">
              Path type
            </label>
            <select
              id="model-file-path-type"
              name="model_file_path_type"
              value={formData.model_file_path_type}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            >
              <option>Absolute</option>
              <option>Relative</option>
            </select>
          </div>

          <div>
            <label htmlFor="experiment-name" className="block text-gray-700">
              Experiment name
            </label>
            <input
              type="text"
              id="experiment-name"
              name="experiment_name"
              value={formData.experiment_name}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">
            Save changes & Restart
          </button>
        </div>
      </form>
      
      <button
        onClick={() => handleChangeModelPath(formData.model_file_path)}
        className='bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 mt-4'
      >
        Change Model Path 
      </button>

    </div>
  );
};

export default SettingsForm;
