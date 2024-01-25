import useCurrStore from "../store/use-curr-store";
import useResponseStore from "../store/use-response-store";
import useEditorStore from "../store/use-editor-store";
import DatabaseManager from "../db/database-manager";
import useSelectedStore from "../store/use-selected-store";
import * as bootstrap from 'bootstrap';
import { uuid, getEnvVal } from "./util";
import { generateCategoricalDimensions, validateFormatForDimensions } from "./gpt-util";

const DELIMITER = "####";
const MAX_TOKEN_BIG = 3500;
const MAX_TOKEN_SMALL = 1000;
const MODEL = "gpt-3.5-turbo-instruct";
const TEMPERATURE = 0.7;
const TOP_P = 1;

let fail_count = 0;
let total_count = 0;
let firstId = '';

// interface ResponseData {
//     [key: string]: {
//         Prompt: string;
//         Context: string;
//         Result: string;
//         Summary: string;
//         Keywords: string[];
//         Structure: string; // Adjust the type according to actual data structure
//         Title: string;
//         IsMyFav: boolean;
//     };
// }

async function editorBackgroundPrompt() {
    let context=""; // FIXME: unknown context
    const {api} = useEditorStore.getState();
    const ejData = await api.save();
    // get the last block
    let prevContext;
    if (ejData.blocks.length === 0 ){
        prevContext = "";
    } else {
        prevContext = ejData.blocks[ejData.blocks.length - 1].data.text;
    }
    let background = "";
    if (prevContext != "" && context != ""){
        background = `(${prevContext}) AND (${context})`;
    } else if (prevContext != "" && context == ""){
        background = prevContext;
    } else if (prevContext == "" && context != ""){
        background = context;
    }
    return background !== "" ? "This is the context:\n" + background + "\n---end context ---\n\n" : "";
}

/*  
    for each dimension, randomly choose a value
    if the dimension is categorical, choose a value from the list
    if the dimension is continuous, choose a value from the range
    concatenate the values into a string
    concatenate the string with the prompt
    use the OpenAI API to generate a response 
*/
export async function buildSpace(currBlockId, dimensions, numResponses, prompt, context){
    // generate a list of requirements for each dimension
    let {dimReqs, data} = genDimRequirements(dimensions, numResponses);
    // get the context from the editor
    const {api} = useEditorStore.getState();
    // // get the block id of the last block
    // const lastBlockId = api.blocks.getBlockByIndex(-1).id;

    const {maxBlockId, setMaxBlockId, } = useCurrStore.getState();
    const {selectedResponse, setSelectedResponse} = useSelectedStore.getState();
    // generate a response for each requirement
    const startTime = Date.now();
    let responses = [];
    console.log("dimReqs", dimReqs);
    const responsePromises = dimReqs.map(async (req, i) => {
        // parse req to get id and requirements
        const id = req["ID"];
        const wordLimit = "Limit the response to 150 words.\n####\n"
        const requirements = req["Requirements"];
        const message = wordLimit + editorBackgroundPrompt() + "Prompt: " + prompt + "\n" + DELIMITER + "\n" + "Requirements: " + requirements + "\n" + DELIMITER + "\n";
        // Call the generateResponse function to generate a response for each requirement
        const response = await generateResponse(message);
        console.log("check if there's a new line character", response);
        // response = response.replace(/\n/g, '<br>');
        if (id === useResponseStore.getState().responseId){
            // set the first response as the default response
            useResponseStore.getState().setResponse(response);
            // print responseId
            console.log("print in side the space", useResponseStore.getState().responseId)
        }
        // store the response in the data
        // let data: ResponseData = {};
        data[id]["Prompt"] = message;
        data[id]["Context"] = context;
        data[id]["Result"] = response;
        const summary = await abstraction(response);
        data[id]["Summary"] = summary["Summary"];
        data[id]["Keywords"] = summary["Key Words"];
        data[id]["Structure"] = summary["Structure"];
        data[id]["Title"] = summary["Title"];
        data[id]["IsMyFav"] = false;
        if (id === firstId){
            // set the first response as the default response
            setSelectedResponse(currBlockId, data[id]);
            console.log("print in side the space", selectedResponse)
            // useResponseStore.getState().setResponse(response);
            // useResponseStore.getState().setResponseId(id);
        }
    });
    await Promise.all(responsePromises);
    const endTime = Date.now();
    console.log("Time to generate " + numResponses + " responses: " + (endTime - startTime) + "ms");
    console.log(data);

    // store the responses in the local storage
    console.log("put all data in blockID", currBlockId);
    DatabaseManager.putAllData(currBlockId, data);
    const setCurrBlockId = useCurrStore.getState().setCurrBlockId;
    setCurrBlockId(currBlockId);
    console.log("currBlockId", currBlockId);
    console.log("original maxBlockId", useCurrStore.getState().maxBlockId);
    // increment the maxBlockId by setting the maxBlockId to the maxBlockId + 1
    setMaxBlockId(maxBlockId + 1);
    console.log("new maxBlockId", useCurrStore.getState().maxBlockId);
    return {"fail_count": fail_count, "total_count": total_count};
}

/**
 * Given the current state of the nodes, selected dimension labels, generate more nodes in that space.
 * labels: Label[] -> {dimensionId, name, type}[]
 */
export async function growSpace(currBlockId, dimensionMap, labels, numResponses, prompt, nodeMap, setNodeMap){
    // generate a list of requirements for each dimension
    let {dimReqs, data} = genFilteredDimRequirements(dimensionMap, numResponses);
    // let {dimReqs, data} = genLabelRequirements(dimensionMap, labels, numResponses);
    // generate a response for each requirement
    const startTime = Date.now();
    let responses = [];
    console.log("dimReqs", dimReqs);
    const responsePromises = dimReqs.map(async (req) => {
        // parse req to get id and requirements
        const id = req["ID"];
        const wordLimit = "Limit the response to 150 words.\n\n"
        const requirements = req["Requirements"];
        const message = wordLimit + editorBackgroundPrompt() + "Prompt: " + prompt + "\n" + DELIMITER + "\n" + "Requirements: " + requirements + "\n" + DELIMITER + "\n";
        // Call the generateResponse function to generate a response for each requirement
        const response = await generateResponse(message);
        // store the response in the data
        // let data: any;
        data[id]["Prompt"] = message;
        data[id]["Result"] = response;
        const summary = await abstraction(response);
        data[id]["Summary"] = summary["Summary"];
        data[id]["Keywords"] = summary["Key Words"];
        data[id]["Structure"] = summary["Structure"];
        data[id]["Title"] = summary["Title"];
        data[id]["IsMyFav"] = false;
    });
    await Promise.all(responsePromises);
    const endTime = Date.now();
    console.log("Time to generate " + numResponses + " responses: " + (endTime - startTime) + "ms");
    setNodeMap({
        ...nodeMap,
        ...data,
    })
    DatabaseManager.addBatchData(currBlockId, data);
    return {"fail_count": fail_count, "total_count": total_count};
}

export async function addLabelToSpace(dimensionMap, newLabel, numResponses, prompt, nodeMap, setNodeMap) {
        // generate a list of requirements for each dimension
        let {dimReqs, data} = genLabelDimRequirements(dimensionMap, newLabel, numResponses);
        // let {dimReqs, data} = genLabelRequirements(dimensionMap, labels, numResponses);
        const {maxBlockId, setMaxBlockId} = useCurrStore.getState();
        // generate a response for each requirement
        const startTime = Date.now();
        let responses = [];
        console.log("dimReqs", dimReqs);
        const responsePromises = dimReqs.map(async (req) => {
            // parse req to get id and requirements
            const id = req["ID"];
            const wordLimit = "Limit the response to 150 words.\n####\n"
            const requirements = req["Requirements"];
            const message = wordLimit + editorBackgroundPrompt() + "Prompt: " + prompt + "\n" + DELIMITER + "\n" + "Requirements: " + requirements + "\n" + DELIMITER + "\n";
            // Call the generateResponse function to generate a response for each requirement
            const response = await generateResponse(message);
            // store the response in the data
            // let data: ResponseData = {};
            data[id]["Prompt"] = message;
            data[id]["Result"] = response;
            const summary = await abstraction(response);
            data[id]["Summary"] = summary["Summary"];
            data[id]["Keywords"] = summary["Key Words"];
            data[id]["Structure"] = summary["Structure"];
            data[id]["Title"] = summary["Title"];
            data[id]["IsMyFav"] = false;
        });
        await Promise.all(responsePromises);
        const endTime = Date.now();
        console.log("Time to generate " + numResponses + " responses: " + (endTime - startTime) + "ms");
        console.log(data);
    
        setNodeMap({
            ...nodeMap,
            ...data,
        })
        const {currBlockId} = useCurrStore.getState();
        DatabaseManager.addBatchData(currBlockId, data);
        return {"fail_count": fail_count, "total_count": total_count};
}

/**
 * Given the current state of the nodes, selected dimension labels, generate more nodes in that space.
 * labels: Label[] -> {dimensionId, name, type}[]
 */
export async function addSimilarNodesToSpace(node, nodeMap, setNodeMap){
    // generate a list of requirements for each dimension
    // let {dimReqs, data} = genFilteredDimRequirements(dimensionMap, numResponses);
    // let {dimReqs, data} = genLabelRequirements(dimensionMap, labels, numResponses);

    // generate a response for each requirement
    const startTime = Date.now();
    // const data = {};
    // let data: ResponseData = {};
    const responsePromises = [0,1,2,3,4].map(async (i) => {
        // parse req to get id and requirements
        const id = uuid();
        const wordLimit = "Limit the response to 150 words.\n\n"
        const message = wordLimit + editorBackgroundPrompt() + "Prompt: " + node.Prompt;
        // Call the generateResponse function to generate a response for each requirement
        const response = await generateResponse(message);
        // store the response in the data
        data[id] = {
            ...node,
            ID: id,
        }
        data[id]["Prompt"] = message;
        data[id]["Result"] = response;
        const summary = await abstraction(response);
        data[id]["Summary"] = summary["Summary"];
        data[id]["Keywords"] = summary["Key Words"];
        data[id]["Structure"] = summary["Structure"];
        data[id]["Title"] = summary["Title"];
        data[id]["IsMyFav"] = false;
        data[id]["IsNew"] = true; // when generting dots via see more
    });
    await Promise.all(responsePromises);
    const endTime = Date.now();
    console.log(data)
    setNodeMap({
        ...nodeMap,
        ...data,
    })
    const {currBlockId} = useCurrStore.getState();
    DatabaseManager.addBatchData(currBlockId, data);
    return {"fail_count": fail_count, "total_count": total_count};
}


async function generateResponse(message){
    // call the OpenAI API to generate a response
    try{
        /* text-davinci-003 */
        const response = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
            Authorization: `Bearer ${getEnvVal('VITE_OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            model: MODEL,
            prompt: `${message}`,
            temperature: 0,
            max_tokens: MAX_TOKEN_BIG,
            top_p: TOP_P,
            frequency_penalty: 0.75,
            presence_penalty: 0,
            stream: false
            }),
        });
        const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
        if (!reader) {
            throw new Error('No reader found');
        }
        const {value, done} = await reader.read();
        // console.log("value", value)
        // console.log(JSON.parse(value)["choices"][0]["text"]);
        total_count += 1; // increment total count
        if (value){
            return JSON.parse(value)["choices"][0]["text"];
        } else {
            throw new Error('No value found');
        }
        /* 'gpt-3.5-turbo' / 'gpt-4' */
        // const response = await fetch('https://api.openai.com/v1/chat/completions', {
        //     method: 'POST',
        //     headers: {
        //     Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        //     'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //     model: 'gpt-4',
        //     messages: [{role: "user", content: `${message}`}],
        //     temperature: 0.7,
        //     max_tokens: 7900,
        //     top_p: 1,
        //     frequency_penalty: 0.75,
        //     presence_penalty: 0,
        //     stream: false,
        //     }),
        // });
        // const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
        // const {value, done} = await reader.read();
        // total_count += 1; // increment total count
        // console.log("value", value)
        // return JSON.parse(value)["choices"][0]["message"]["content"];
    } catch (error) {
        fail_count += 1; // increment fail count
        total_count += 1; // increment total count
        console.log(error);
        return "Error";
    }
}


function genDimRequirements(dimensions, numResponses){
    // generate a list of requirements for each dimension
    // return a list of requirements
    // **** IMPORTANT ****
    // the ID of the requirement is the (index + 1) of the requirement in the list
    let dimReqs = [];
    let data = {};
    console.log("numResponse", numResponses);
    for (let i = 0; i < numResponses; i++){
        let req = ""
        let datum = {};
        datum["ID"] = uuid();
        if ( useResponseStore.getState().responseId === null){
            useResponseStore.getState().setResponseId(datum["ID"]);
            useCurrStore.getState().setCurrDataId(datum["ID"]);

        }
        datum["Dimension"] = {"categorical": {}, "numerical": {}, "ordinal": {}};
        Object.entries(dimensions["categorical"]).forEach(([d, v]) => {
            // choose a random value from v
            let randVal = v[Math.floor(Math.random() * v.length)];
            req += d + ": " + randVal + "\n";
            datum["Dimension"]["categorical"][d] = randVal;
        });
        Object.entries(dimensions["ordinal"]).forEach(([d, v]) => {
            // choose a random value from v
            let randVal = v[Math.floor(Math.random() * v.length)];
            req += d + ": " + randVal + "\n";
            datum["Dimension"]["ordinal"][d] = randVal;
        });
        dimReqs.push({"ID": datum["ID"], "Requirements": req});
        data[datum["ID"]] = datum;
    }
    return {dimReqs, data};
}

function genFilteredDimRequirements(dimensionMap, numResponses){
    // generate a list of requirements for each dimension
    // return a list of requirements
    // **** IMPORTANT ****
    // the ID of the requirement is the (index + 1) of the requirement in the list
    let dimReqs = [];
    let data = {};
    // console.log("numResponse", numResponses);
    for (let i = 0; i < numResponses; i++){
        let req = ""
        let datum = {};
        datum["ID"] = uuid();
        datum["Dimension"] = {"categorical": {}, "numerical": {}, "ordinal": {}};
        Object.values(dimensionMap).forEach((dimension) => {
            let values = [];
            if (dimension.filtered && dimension.filtered.length > 0) {
                values = dimension.filtered;
            } else {
                values = dimension.values;
            }
            let randVal = values[Math.floor(Math.random() * values.length)];
            req += dimension.name + ": " + randVal + "\n";
            datum["Dimension"][dimension.type][dimension.name] = randVal;
        })
        console.log(req)
        dimReqs.push({"ID": datum["ID"], "Requirements": req});
        data[datum["ID"]] = datum;
    }
    return {dimReqs, data};
}

/**
 * Hardcoded to add one new label
 */
function genLabelDimRequirements(dimensionMap, label, numResponses){
    // generate a list of requirements for each dimension
    // return a list of requirements
    // **** IMPORTANT ****
    // the ID of the requirement is the (index + 1) of the requirement in the list
    // let dimReqs: { ID: string; Requirements: string }[] = [];
    let data = {};
    // console.log("numResponse", numResponses);
    for (let i = 0; i < numResponses; i++){
        let req = ""
        let datum = {};
        datum["ID"] = uuid();
        datum["Dimension"] = {"categorical": {}, "numerical": {}, "ordinal": {}};
        Object.values(dimensionMap).forEach((dimension) => {
            let values = [];
            if (dimension.id === label.dimensionId) {
                values = [label.name]
            } else {
                values = dimension.values;
            }
            let randVal = values[Math.floor(Math.random() * values.length)];
            req += dimension.name + ": " + randVal + "\n";
            datum["Dimension"][dimension.type][dimension.name] = randVal;
        })
        console.log(req)
        dimReqs.push({"ID": datum["ID"], "Requirements": req});
        data[datum["ID"]] = datum;
    }
    return {dimReqs, data};
}

export async function abstraction(text){
  let response = await summarizeText(text);
  response = response.substring(response.indexOf("{"), response.lastIndexOf("}") + 1);

  for (let i = 0; i < 5; i++){
    if (validateFormatForSummarization(response)) {
        const responseJson = JSON.parse(response);
        // using regular expression to remove the '' or <> before and after first and last letter in title
        responseJson["Title"] = responseJson["Title"].replace(/(^['<])|(['>]$)/g, '');
        return {"Key Words": responseJson["Key Words"], "Summary": responseJson["Summary"], "Structure": responseJson["Structure"], "Title": responseJson["Title"]};
    };
    response =  await summarizeText(text);
    response = response.substring(response.indexOf("{"), response.lastIndexOf("}") + 1);
  }
  // did not get a valid response after 5 tries
  // make toasts to notify the user
    var toast = new bootstrap.Toast(document.getElementById('error-toast'));
    document.getElementById('error-toast-text').textContent = "Error: Failed to generate the summary. Please try again.";
    toast.show();
    return {"Key Words": [], "Summary": "", "Structure": "", "Title": ""};
  
}

async function summarizeText(text){
    const message = `Given following text, return key words and a one sentence summary, a structure , and a title of the text.
      ####
      Text is: ${text}
      ####
      Don't include any text other than the json
      Word limit of the summary text is 20 words
      Word limit of the title is 5 words
      Maximum 5 key words
      ####
      Should be in the following JSON format: 
      {
          "Key Words": ["<key word 1>", "<key word 2>", ...], 
          "Summary": "<summary>",
          "Structure": "<part 1>-<part 2>-<part 3>...",
          "Title": "<title>"
      }`;
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getEnvVal('VITE_OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: `${message}`,
        temperature: 0,
        max_tokens: 256,
        top_p: TOP_P,
        frequency_penalty: 0.75,
        presence_penalty: 0,
      }),
    });
    const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
    if (!reader) {
        throw new Error('No reader found');
    }
    const {value, done} = await reader.read();
    // console.log("text summary",JSON.parse(value)["choices"][0]["text"]);
    if (value){
        return JSON.parse(value)["choices"][0]["text"];
    } else {
        throw new Error('No value found');
    }
  }

/*  validate the format of the response
    return true if the response is in the correct format
    return false if the response is not in the correct format 
*/
function validateFormatForSummarization(response){
    try {
        // check if the response is in the JSON format
        // only care about the text in between the {}
        const result = JSON.parse(response);
        // console.log("result format",result);
        //  check if there are any infinities or NaNs
        for (const [key, value] of Object.entries(result)) {
            if (key !== "Summary" && key !== "Structure" && key !== "Key Words" && key !== "Title"){
                console.log("invalid key", key);
                return false;
            }
            // check if the value in Key Words is a list
            if (key === "Key Words"){
                if (!Array.isArray(value)){
                    console.log("invalid value", value);
                    return false;
                }
            }
        }
        total_count += 1; // increment total count
        return true
    }
    catch (e) {
        console.log(e);
        fail_count += 1; // increment fail count
        total_count += 1; // increment total count
        return false
    }
  }

/**
 * Given the current dimensions, generate a brand new dimension and its labels.
 * For each response, select a random value of the dimension.
 * Update that response to also include that dimension label.
 * abstraction() of that new response
 * 
 * 
 * Not doing this: Then, for each response, apply one of the dimension labels to the current response.
 * 
 */
export async function addNewDimension(prompt, dimensionName, dimensionMap, setDimensionMap, nodeMap, setNodeMap) {
    let newDimResponse = await createLabelsFromDimension(prompt, dimensionName);
    console.log("newDimension", newDimResponse);
    let newDimension = null;
    for (let i = 0; i < 5; i++){
        if (validateFormatForDimensions(newDimResponse, false)) {
            newDimension = JSON.parse(newDimResponse);
            break
        };
        newDimResponse = await createLabelsFromDimension(prompt, dimensionName)
    }
    // separate the dimension name and values
    if (!newDimension) {
        console.log('failed add new dimension. Please try again.');
        var toast = new bootstrap.Toast(document.getElementById('error-toast'));
        var msg = document.getElementById('errortoast-text');
        if (msg) {
            msg.textContent = "Failed add a new dimension. Please try again.";
            toast.show();
        }
        return;
    }
    var toast = new bootstrap.Toast(document.getElementById('fav-toast'));
    var msg = document.getElementById('toast-text');
      if (msg) {
        msg.textContent = "New dimension added.";
        toast.show();
    }


    const name = Object.keys(newDimension)[0];
    const values = Object.values(newDimension)[0];

    // Add dimension to dimension Map
    dimensionMap[name] = {
        id: Object.keys(dimensionMap).length,
        name: name,
        type: "categorical",
        values: values,
        filtered: [],
    }
    setDimensionMap(dimensionMap);
    console.log("dimensionMap", dimensionMap);
    // update dimensiosn in the local storage
    const newDimensionToStore = {
        "name": name,
        "type": "categorical",
        "values": values,
    }
    const {currBlockId} = useCurrStore.getState();
    DatabaseManager.postDimension(currBlockId, name, newDimensionToStore) 

    // for each response, run reviseResponseWithNewDimensionLabel
    const assignLabelPrompt = 
        `\nThis is the newly added dimension: ${dimensionName}
        ####
        these are the dimension values: [${values.join(', ')}]
        ####
        Assign a value from the dimension ${dimensionName} to the following response.`
    const data = {};
    const responsePromises = Object.entries(nodeMap).map(async ([id, node], i) => {
        try{
            const wordLimit = "Limit the response to 150 words."
            const formatReq = `
            ####
            answer in the following JSON format: 
            {
                "label": "<label>"
            }`
            const assignLabelMessage = "Prompt: " + assignLabelPrompt + "####" + "Current response: " + node["Result"]+ "####" + formatReq;
            var labelResponse = await generateResponse(assignLabelMessage);
            var label = "";
            for (let i = 0; i < 5; i++){
                try {
                    label = JSON.parse(labelResponse)["label"];
                    break;
                } catch (error) {
                    labelResponse = await generateResponse(assignLabelMessage);
                }
            }
            // parse the response to get the dimension label
            const reviseResponsePrompt = `Revise this response such that it shows ${label} in the sense of ${dimensionName}.`;
            const reviseResponseMessage = wordLimit + "####" + "Prompt: " + reviseResponsePrompt + "####" + "Current response: " + node["Result"];
            var result = await generateResponse(reviseResponseMessage);
            result = result.trim();
            const summary = await abstraction(result);
            // add the new label to the Dimension - categorical
            node["Dimension"]["categorical"][dimensionName] = label;
            data[id] = {
                ...node,
                ID: id,
                Result: result,
                Summary: summary["Summary"],
                Keywords: summary["Key Words"],
                Structure: summary["Structure"],
                Title: summary["Title"],
            }
        } catch (error) {
            console.log(error);
            return;
        }
    })
     await Promise.allSettled(responsePromises);
    setNodeMap({
        ...data,
    });

    // get all the data from the local storage
    // DatabaseManager.getAllData(currBlockId);
    // update the data in the local storage

    // show a toast to notify the user
    DatabaseManager.addBatchData(currBlockId, data);
    var toast = new bootstrap.Toast(document.getElementById('fav-toast'));
    msg = document.getElementById('toast-text');
      if (msg) {
        msg.textContent = "Current responses updated.";
        toast.show();
    }
    return;

}

/*
 * Create new labels for a given dimension
 */
async function createLabelsFromDimension(prompt, dimensionName){
    const message =  `Given a dimension name, return a list of labels for that dimension for the prompt ${prompt}
    ####
    Dimension name is: ${dimensionName}
    ####
    answer in the following JSON format: 
    {
        "${dimensionName}": ["<label 1>", "<label 2>", "<label 3>",...."<label 6>"]
    }`;

    const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getEnvVal('VITE_OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          prompt: `${message}`,
          temperature: TEMPERATURE,
          max_tokens: MAX_TOKEN_BIG,
          top_p: TOP_P,
          frequency_penalty: 0.75,
          presence_penalty: 0,
          stream: false
        }),
      });
    const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
    if (!reader) {
        throw new Error('No reader found');
    }
    const {value, done} = await reader.read();
    if (value){
        console.log("value", JSON.parse(value)["choices"][0]["text"]);
        return JSON.parse(value)["choices"][0]["text"];
    } else {
        throw new Error('No value found');
    }
}





