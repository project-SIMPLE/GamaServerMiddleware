import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../WebSocketManager/WebSocketManager';

const SettingsForm: React.FC = () => {
  const { ws, isWsConnected } = useWebSocket();
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
          <h2 className="text-xl font-semibold">About GAMA Server</h2>
          <div>
            <label htmlFor="ip-address-gama-server" className="block text-gray-700">
              IP address
            </label>
            <input
              type="text"
              id="ip-address-gama-server"
              name="ip_address_gama_server"
              value={formData.ip_address_gama_server}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="gama-ws-port" className="block text-gray-700">
              WebSocket port
            </label>
            <input
              type="number"
              id="gama-ws-port"
              name="gama_ws_port"
              value={formData.gama_ws_port}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

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

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">About Players</h2>
          <div>
            <label htmlFor="player-ws-port" className="block text-gray-700">
              Player WebSocket port
            </label>
            <input
              type="number"
              id="player-ws-port"
              name="player_ws_port"
              value={formData.player_ws_port}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="player-web-interface"
              name="player_web_interface"
              checked={formData.player_web_interface}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="player-web-interface" className="text-gray-700">
              Player web interface
            </label>
          </div>

          <div>
            <label
              htmlFor="player-html-file"
              className={`block text-gray-700 ${!formData.player_web_interface ? 'text-gray-400' : ''}`}
            >
              Player HTML file (in /player directory)
            </label>
            <input
              type="text"
              id="player-html-file"
              name="player_html_file"
              value={formData.player_html_file}
              onChange={handleChange}
              disabled={!formData.player_web_interface}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">About Monitor</h2>
          <div>
            <label htmlFor="monitor-ws-port" className="block text-gray-700">
              Monitor WebSocket port
            </label>
            <input
              type="number"
              id="monitor-ws-port"
              name="monitor_ws_port"
              value={formData.monitor_ws_port}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="app-port" className="block text-gray-700">
              Application port
            </label>
            <input
              type="number"
              id="app-port"
              name="app_port"
              value={formData.app_port}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Other</h2>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enable-verbose"
              name="enable_verbose"
              checked={formData.enable_verbose}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="enable-verbose" className="text-gray-700">
              Enable verbose in log messages
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">
            Save changes & Restart
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsForm;
