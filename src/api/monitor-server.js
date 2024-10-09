import { WebSocketServer } from 'ws';

/**
 * Creates a Websocket Server for handling monitor connections
 */

// Declare a global variable for index
let globalIndex = null;

class MonitorServer {
    /**
     * Creates the websocket server
     * @param {Controller} controller - The controller of the project
     */
    constructor(controller) {
        this.controller = controller;
        this.monitorSocketClients = [];

        this.monitorSocket = null;

        try {
            const host = process.env.WEB_APPLICATION_HOST || 'localhost';
            const port = parseInt(process.env.MONITOR_WS_PORT || '8080', 10);

            this.monitorSocket = new WebSocketServer({ host, port });
            console.log(`[MONITOR SERVER] Creating monitor server on: ws://${host}:${port}`);
        }catch (e) {
            console.error("[MONITOR SERVER] Failed to create WebSocket server", e);
        }

        this.monitorSocket.on('connection', (socket) => {
            this.monitorSocketClients.push(socket);
            console.log("[MONITOR SERVER] Connected to monitor server");
            this.sendMonitorJsonState();
            this.sendMonitorJsonSettings();
            socket.on('message', (message) => {
                try {
                    const jsonMonitor = JSON.parse(message);
                    const type = jsonMonitor['type'];
                    switch (type) {
                        case "launch_experiment":

                            if (globalIndex !== null && globalIndex >= 0 && globalIndex < this.controller.modelManager.getModelList().length) {
                                
                                this.controller.setChoosedLearningPackageIndex(globalIndex); 
                                this.controller.launchExperiment();
                            } else {
                                console.error("Invalid index for launching experiment");
                            }
                            break;
                            
                        case "stop_experiment":
                            this.controller.stopExperiment();
                            break;
                        case "pause_experiment":
                            this.controller.pauseExperiment();
                            break;
                        case "resume_experiment":
                            this.controller.resumeExperiment();
                            break;
                        case "try_connection":
                            this.controller.connectGama();
                            break;
                        case "add_every_players":
                            this.controller.addInGameEveryPlayers();
                            break;
                        case "remove_every_players":
                            this.controller.removeInGameEveryPlayers();
                            break;
                        case "add_player_headset":
                            this.controller.addInGamePlayer(jsonMonitor["id"]);
                            break;
                        case "restart":
                            this.controller.restart();
                            break;
                            
                        case "remove_player_headset":
                            // remove the player from the simulation
                            this.controller.removeInGamePlayer(jsonMonitor["id"]);
                            // Send message to socket Manager 
                            console.log("les joueurs après delete ::: ",this.controller.getPlayerList());
                            socket.send(JSON.stringify({ 
                                type: "remove_player_headset", 
                                id: jsonMonitor["id"], 
                                player: this.controller.getPlayerList() // list of player to udpdate in the webSocket -> web interface (seems not to render the accurate liste)
                            }));
                            break;
                        case "json_settings":
                            this.controller.changeJsonSettings(jsonMonitor);
                            break;
                        case "clean_all":
                            this.controller.cleanAll();
                            break;
                        case "get_simulation_informations":
                            // send to the Web socket Manager
                            socket.send(this.controller.getSimulationInformations());
                            break;

                        case "settings_change_model_file_path":

                            const modelList = this.controller.modelManager.getModelList();
                            let selectedSimulation = null; // useless

                            modelList.forEach((model, idx) => {

                                // Take the model_file_path from the message 
                                const modelFilePathNew = jsonMonitor['modelFilePath'];  

                                // Do the modification for the simulation "SimulationLaunchedManually"
                                if (model.jsonSettings.name === "SimulationLaunchedManually") {
                                    selectedSimulation = modelList[idx]; // useless not used 

                                    model.modelFilePath = modelFilePathNew;
                                    model.jsonSettings.model_file_path = modelFilePathNew;
                                    
                                }
                            });
                            break;

                        //  get simulation par index PUIS actions comme start simulation 
                        case "get_simulation_by_index":
                            globalIndex = jsonMonitor['simulationIndex'];  // Extract the index from the received message
                            
                            if (globalIndex !== undefined && globalIndex >= 0 && globalIndex < this.controller.modelManager.getModelList().length) {
                                
                                // change value of choosedLearningPackageIndex" in the controller 
                                this.controller.setChoosedLearningPackageIndex(globalIndex); 
                                
                                // Retrieve the simulation based on the index
                                const selectedSimulation = this.controller.modelManager.getModelList()[globalIndex]; 

                                // For retrieving data from the simulation, send a message to the monitor
                                socket.send(JSON.stringify({ 
                                    type: "get_simulation_by_index", 
                                    simulation: selectedSimulation.getJsonSettings() // Assuming getJsonSettings returns the relevant data
                                }));
                                
                            } else {
                                console.error("Invalid index received or out of bounds");
                            }

                        break;

                        // in the component that displays the monitoring screens, create a useEffect that listens to this variable
                        // directly use the variable in the component with conditional rendering                        
                        case "set_gama_screen":
                            socket.send(JSON.stringify({ 
                                type: "setMonitorScreen", 
                                mode: 'gama_screen'
                            }));
                            break;

                        case "set_shared_screen":
                            console.log("shared screen !");
                            socket.send(JSON.stringify({ 
                                type: "setMonitorScreen", 
                                mode: 'shared_screen'
                            }));      
                            break;

                        default:
                            console.warn("\x1b[31m-> The last message received from the monitor had an unknown type.\x1b[0m");
                            console.warn(jsonMonitor);
                    }
                } catch (exception) {
                    console.error("\x1b[31m-> The last message received from the monitor created an internal error.\x1b[0m");
                    console.error(exception);
                }
            });
        });

        this.monitorSocket.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`\x1b[31m-> The port ${process.env.MONITOR_WS_PORT} is already in use. Choose a different port in settings.json.\x1b[0m`);
            } else {
                console.log(`\x1b[31m-> An error occured for the monitor server, code: ${err.code}\x1b[0m`);
            }
        });
    }

    /**
     * Sends the json_state to the monitor
     */
    sendMonitorJsonState() {
        if (this.monitorSocketClients !== undefined) {
            this.monitorSocketClients.forEach((client) => {
                client.send(JSON.stringify(this.controller.modelManager.getModelList()[this.controller.choosedLearningPackageIndex].getAll()));
            });
        }
    }

    /**
     * Send the json_setting to the monitor
     */
    sendMonitorJsonSettings() {
        if (this.monitorSocketClients !== undefined) {
            this.monitorSocketClients.forEach((client) => {
                client.send(JSON.stringify(this.controller.modelManager.getModelList()[this.controller.choosedLearningPackageIndex].getJsonSettings()));
            });
        }
    }

    /**
     * Closes the websocket server
     */
    close() {
        this.monitorSocket.close();
    }
}

export default MonitorServer;
