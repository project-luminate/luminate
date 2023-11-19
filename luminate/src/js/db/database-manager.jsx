import dimensions from '../../data/dimensions-new.json';
import data from '../../data/responses.json';
import fs from 'fs';
import path from 'path';

const DIM = "dimensions";
const DATA = "data";
const BLOCK = "block";
const FAV = "favorite";
const CURR = "current";

export default class DatabaseManager {
    // use the test data
    static initTestData() {
        DatabaseManager.storePair(DIM, {"0": dimensions});
        DatabaseManager.storePair(DATA, {"0":data});
        DatabaseManager.storePair(BLOCK, {"0":0})
        DatabaseManager.storePair(FAV, {"0":null})
    }

    // store the data into the local storage
    static storePair(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // // set the current block id
    // static setCurrentBlock(id) {
    //     localStorage.setItem(CURR, id);
    // }
    
    // // get the current block id
    // static getCurrentBlock() {
    //     return localStorage.getItem(CURR);
    // }

    /* ************************************ BLOCK ************************************ */
    static postBlock(id, prompt, content, responseId) {
        const block = JSON.parse(localStorage.getItem(BLOCK));
        // if the id is not in the local storage, create a new id
        if (!block[id]) {
            block[id] = {};
        }
        let blockInfo = {
            "id": id,
            "prompt": prompt,
            "content": content,
            "responseId": responseId,
        }
        block[id] = blockInfo;
        DatabaseManager.storePair(BLOCK, block);
    }

    static getBlock(id) {
        const block = JSON.parse(localStorage.getItem(BLOCK));
        return block[id];
    }

    static putBlock(id, prompt, content, responseId) {
        const block = JSON.parse(localStorage.getItem(BLOCK));
        let blockInfo = {
            "id": id,
            "prompt": prompt,
            "content": content,
            "responseId": responseId,
        }
        block[id] = blockInfo;
        DatabaseManager.storePair(BLOCK, block);
    }

    static deleteBlock(id) {
        const block = JSON.parse(localStorage.getItem(BLOCK));
        block[id] = {};
        DatabaseManager.storePair(BLOCK, block);
    }


    /* ************************************ DIMENSION ************************************ */

    //get a dimension value for a block from the local storage
    static getDimension(id, key) {
        const dimensions = JSON.parse(localStorage.getItem("dimensions"));
        return dimensions[id][key];
    }

    // get all the dimensions for a block from the local storage
    static getAllDimensions(id) {
        const dimensions = JSON.parse(localStorage.getItem("dimensions"));
        return dimensions[id];
    }
    //put a new dimension value for a block into the local storage
    static postDimension(blockId, key, dimension) {
        const dimensions = JSON.parse(localStorage.getItem("dimensions"));
        // if the id is not in the local storage, create a new id
        if (!dimensions[blockId]) {
            dimensions[blockId] = {};
        }
        dimension["id"] = Object.keys(dimensions[blockId]).length;
        dimensions[blockId][key] = dimension;
        DatabaseManager.storePair(DIM, dimensions);
    }

    // update a existing dimension value for a block in the local storage
    static putDimension(id, key, dimension) {
        const dimensions = JSON.parse(localStorage.getItem("dimensions"));
        Object.entries(dimension).forEach(([k, v]) => {
            dimensions[id][key][k] = v;
        });
        DatabaseManager.storePair(DIM, dimensions);
    }

    // delete a dimension value for a block from the local storage
    static deleteDimension(id, key) {
        const dimensions = JSON.parse(localStorage.getItem("dimensions"));
        delete dimensions[id][key];
        console.log("dimensions after delete", dimensions);
        DatabaseManager.storePair(DIM, dimensions);
    }

    static deleteAllDimensions(id) {
        const dimensions = JSON.parse(localStorage.getItem("dimensions"));
        dimensions[id] = {};
        DatabaseManager.storePair(DIM, dimensions);
    }

    /* ************************************ DATA ************************************ */
    static getAllData(id) {
        const data = JSON.parse(localStorage.getItem("data"));
        return data[id];
    }

    static getData(id, key) {
        const data = JSON.parse(localStorage.getItem("data"));
        return data[id][key];
    }

    static postData(id, key, value) {
        const data = JSON.parse(localStorage.getItem("data"));
        data[id][key] = value;
        DatabaseManager.storePair(DATA, data);
    }

    static putData(id, key, value) {
        const data = JSON.parse(localStorage.getItem("data"));
        Object.entries(value).forEach(([k, v]) => {
            data[id][key][k] = v;
        });
        DatabaseManager.storePair(DATA, data);
    }

    static putAllData(id, value) {
        const data = JSON.parse(localStorage.getItem("data"));
        data[id] = value;
        DatabaseManager.storePair(DATA, data);
    }

    static changeFavorite(id, key) {
        const data = JSON.parse(localStorage.getItem("data"));
        console.log("enter check favorite",data[id][key]);
        data[id][key]["IsMyFav"] = !data[id][key]["IsMyFav"];
        DatabaseManager.storePair(DATA, data);
    }

    static checkFavorite(id, key) {
        const data = JSON.parse(localStorage.getItem("data"));
        console.log("enter check favorite",data[id][key]);
        return data[id][key]["IsMyFav"];
    }

    static deleteAllData(id) {
        const data = JSON.parse(localStorage.getItem("data"));
        data[id] = {};
        DatabaseManager.storePair(DATA, data);
    }

    static addBatchData(id, value) {
        const data = JSON.parse(localStorage.getItem("data"));
        Object.entries(value).forEach(([k, v]) => {
            data[id][k] = v;
        });
        DatabaseManager.storePair(DATA, data);
    }


    /* ************************************ FAVORITE ************************************ */

    static postFavorite(id, value) {
        var favorite = JSON.parse(localStorage.getItem(FAV));
        // if favorite is null, create a new favorite
        if (favorite[id] === undefined) {
            favorite[id] = {};
        }
        // if the value is already in the favorite, skip
        if (favorite[id][value.ID] !== undefined) {
            return;
        }
        // append the new favorite to the array
        console.log(value)
        const key = value.ID;
        favorite[id][key] = value;
        DatabaseManager.storePair(FAV, favorite);
    }

    static deleteFavorite(id, key) {
        var favorite = JSON.parse(localStorage.getItem(FAV));
        if (!this.isInFavorite(id, key)) {
            return;
        }
        delete favorite[id][key];
        DatabaseManager.storePair(FAV, favorite);
    }

    static isInFavorite(id, key) {
        var favorite = JSON.parse(localStorage.getItem(FAV));
        // check if favorite is null
        if (favorite === null) {
            return false;
        }
        // check if the id is in the favorite
        if (favorite[id] === undefined) {
            return false;
        }
        // check if the key is in the favorite id
        if (favorite[id][key] === undefined) {
            return false;
        }
        return true;
    }

    static getAllFavorite(id) {
        var favorite = JSON.parse(localStorage.getItem(FAV));
        // check if favorite is null
        if (favorite === null) {
            return {};
        }
        // check if the id is in the favorite
        if (favorite[id] === undefined) {
            return {};
        }
        return favorite[id];
    }

    static updateEnv (key, value) {
        const envPath = path.resolve(process.cwd(), '.env');
        const envContents = fs.readFileSync(envPath, 'utf-8');
        const newEnvContents = envContents.replace(new RegExp(`^${key}=.*`, 'm'), `${key}=${value}`);
        fs.writeFileSync(envPath, newEnvContents);
    };
}