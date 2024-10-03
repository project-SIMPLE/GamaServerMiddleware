// const fs = require('fs');
// const path = require('path');

// const Model = require('./model.js');
// const {useVerbose} = require("../index");

import fs from 'fs';
import path from 'path';
import Model from './model.js';
import { useVerbose } from './index.js';


class ModelManager {

    /**
     * Creates the model manager
     * @param {Controller} controller - The controller of the server project
     */

    constructor(controller) {
        this.controller = controller;
        this.models = this.initModelsList();
        // console.log("cocuocu"+JSON.stringify(this.models)+"cocuocu");
    }

    initModelsList() {
        let modelList = [];
        const packageRootDir = path.join(process.cwd(), process.env.LEARNING_PACKAGE_PATH);

        const packageFolder = fs.readdirSync(packageRootDir);

        // Browser in learning package folder to find available packages
        packageFolder.forEach((file) => {
            const folderPath = path.join(packageRootDir, file);
            const stat = fs.statSync(folderPath);

            if (stat && stat.isDirectory()) {
                // Verify has a settings file, or it's noise
                if (fs.existsSync(path.join(folderPath,"settings.json"))){
                    if(useVerbose){
                        console.log("[DEBUG] Append new package to ModelManager : "+folderPath);
                    }
                    modelList = modelList.concat(
                        new Model(this.controller, path.join(folderPath,"settings.json"))
                    );
                }else{
                    if(useVerbose){
                        console.warn("Couldn't find settings file for folder "+folderPath);
                    }
                }
            }
        })

        return modelList;
    }
    
    getListPlayers() {
        if (this.models.length > 0) {
            // console.log("this.models : ",this.models);
            const players = this.models[0].getAllPlayers();  // Appelle getAllPlayers() sur la première instance de Model
            console.log("Les playeurs :",players);
            return players;
        } else {
            console.log('No models available.');
            return null;
        }
    }

    /**
         * Removes a player from the list by ID
         * @param {String} playerId - The ID of the player to be removed
         */
    removePlayerById(playerId) {
        if (this.models.length > 0) {
            const model = this.models[0];

            console.log("MODEL : ",model);
            // console.log("model.getAllPlayers() : ",model.getAllPlayers());

            const players = model.getAllPlayers();

            //Verify if ID player exist in "players" object
            if (players.hasOwnProperty(playerId)) {
                delete players[playerId]; // delete the player from the object
                console.log(`Player with ID ${playerId} has been removed.`);
                // update list of player in model 
                model.setPlayers(players);
            } else {
                console.log(`Player with ID ${playerId} not found.`);
            }
        } else {
            console.log('No models available to remove players from.');
        }
    }

    getModelListJSON() {
        const jsonSafeModels = this.models.map(model => model.toJSON());
        return JSON.stringify(jsonSafeModels);   
    }

    getModelList() {
        return this.models;
    }
}

// module.exports = ModelManager;
export default ModelManager;