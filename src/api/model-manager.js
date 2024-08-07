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

    getModelList() {
        return this.models;
    }
}

// module.exports = ModelManager;
export default ModelManager;