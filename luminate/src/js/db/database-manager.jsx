const DIM = "dimensions";
const DATA = "data";
const BLOCK = "block";
const BATCH = "batch";
const NUM_DIM = "dim";

/*
A class that manages the local storage
    DIM: dimensions
    DATA: data
    BLOCK: block
*/
export default class DatabaseManager {
    // use the test data
    static initTestData() {
        DatabaseManager.storePair(DIM, {"0": 0});
        DatabaseManager.storePair(DATA, {"0":0});
        DatabaseManager.storePair(BLOCK, {"0":0})
        DatabaseManager.storePair(BATCH, 40);
        DatabaseManager.storePair(NUM_DIM, 6);
    }

    // store the data into the local storage
    static storePair(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // get the batch size
    static getBatchSize() {
        const param = JSON.parse(localStorage.getItem(BATCH));
        return param;
    }

    // get the dimension size
    static getDimensionSize() {
        const param = JSON.parse(localStorage.getItem(NUM_DIM));
        return param;
    }

    // set the batch size
    static setBatchSize(size) {
        DatabaseManager.storePair(BATCH, size);
    }

    // set the dimension size
    static setDimensionSize(size) {
        DatabaseManager.storePair(NUM_DIM, size);
    }

    /* ************************************ BLOCK ************************************ */
    static postBlock(id, prompt, content, responseId) {
        const block  = JSON.parse(localStorage.getItem(BLOCK));
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
        console.log("data after add batch", data);
    }

    /* given a certain data, return the dimensions in the data */
    static getDataDimensions(id, key) {
        const data = JSON.parse(localStorage.getItem("data"));
        const categorical =  data[id][key]["Dimension"]["categorical"];
        const ordinal = data[id][key]["Dimension"]["ordinal"];
        var response = ""; 
        Object.entries(categorical).forEach(([k, v]) => {
            response += k + ": " + v + "\n";
        });
        Object.entries(ordinal).forEach(([k, v]) => {
            response += k + ": " + v + "\n";
        });
        return response;
    }
}