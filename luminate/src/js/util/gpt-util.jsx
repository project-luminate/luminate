import useEditorStore from "../store/use-editor-store";
import { nominalDimensionDef, ordinalDimensionDef } from "./prompts";

const MAX_TOKEN_BIG = 1000;
const MAX_TOKEN_SMALL = 256;
const MODEL = 'text-davinci-003';
const TEMPERATURE = 0.7;
const TOP_P = 1;

async function generateDimensions(query, context){
  // generate dimensions based on the query and context
  const start = new Date().getTime();
  let fail = 0;
  let total = 0;
  const {api} = useEditorStore.getState();
  const ejData = await api.save();
  console.log("ejData", ejData);
  // get the last block
  let prevContext = ""
  // if (ejData.blocks.length === 0 ){
  //     prevContext = "";
  // } else {
  //     prevContext = ejData.blocks[ejData.blocks.length - 1].data.text;
  // }
  console.log("ejData context", prevContext);
  let background = "";
  if (prevContext !== "" && context !== ""){
    background =`(${prevContext}) AND ( ${context})`;
  } else if (prevContext !== "" && context === ""){
    background = prevContext;
  } else if (prevContext === "" && context !== ""){
    background = context;
  }
  
  const message = background !== "" ?
    "This is the context:\n" + background + "\n---end context ---\n\n" + query
    : query;
  let categoricalDims = await generateCategoricalDimensions(message, 5, 6);
  let ordinalDims = await generateOrdinalDimensions(message, 5);
  // let numericalDims = {
  //     "Length": [200, 500],
  //     "Sentiment": [-1, 1],
  //     "Paragraph Count": [1, 3],
  // }
  let res = {}
  
  for (let i = 0; i < 5; i++){
    total += 1;
    if (validateFormatForDimensions(categoricalDims, false)) {
        res["categorical"] = JSON.parse(categoricalDims);
        break
    };
    // If first response fails, generate at high temperature
    fail += 1;
    categoricalDims = await generateCategoricalDimensions(message, 5, 6, 0.8)
  }

  for (let i = 0; i < 5; i++){
    total += 1;
    if (validateFormatForDimensions(ordinalDims, false)) {
        // add ordinal dimensions to the categorical dimensions
        // Object.entries(JSON.parse(ordinalDims)).forEach(([key, value]) => {
        //     res["categorical"][key] = value;
        // });
        // break
        res["ordinal"] = JSON.parse(ordinalDims);
        break
    };
    fail += 1;
    ordinalDims = await generateOrdinalDimensions(message, 7);
  }
  if (res){
    const end = new Date().getTime();
    console.log("Time to generate dimensions: ", end - start, "ms");
    console.log("Failed to generate dimensions: ", fail, "out of", total);
    // res["numerical"] = numericalDims;
    return res;
  }
  const end = new Date().getTime();
  console.log("Time to generate dimensions: ", end - start, "ms");
  console.log("Failed to generate dimensions: ", fail, "out of", total);
  // did not get a valid response after 5 tries
  console.log("failed to get a valid response")
  return { "categorical": {},  "ordinal": {} };
}

async function generateCategoricalDimensions(prompt, catNum, valNum, temperature){
    const message = nominalDimensionDef + `list ${catNum} nominal dimensions and associated ${valNum} possible values
     on which we can categorize and assess the content for the prompt: ${prompt}
    ####
    You MUST answer in the following JSON object format, wrapped in curly braces. Replace all strings with <...>. There must be ${catNum} items in the JSON object:
    {"<dimension name #1>": [<${valNum} values for this dimension>],..., "<dimension name #${catNum}>" : [<${valNum} values for this dimension>]}
    `

    const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          prompt: `${message}`,
          temperature: TEMPERATURE,
          max_tokens: MAX_TOKEN_BIG,
          top_p: 1,
          frequency_penalty: 0.75,
          presence_penalty: 0,
          stream: false
        }),
      });
    const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
    const {value, done} = await reader.read();
    console.log("categorical dimensions", JSON.parse(value)["choices"][0]["text"]);
    return JSON.parse(value)["choices"][0]["text"];
}
async function generateOrdinalDimensions(prompt, catNum){
  const message = `list ${catNum} ordinal dimensions
   on which we can assess the outcome for the prompt: ${prompt} to what extent represents the dimensions
  ####
  answer in the following JSON format: 
  {
      "<dimension name>": ["least", "less", "neutral", "more", "most"]
  }`

  const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: `${message}`,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKEN_BIG,
        top_p: 1,
        frequency_penalty: 0.75,
        presence_penalty: 0,
        stream: false
      }),
    });
  const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
  const {value, done} = await reader.read();
  console.log("ordinal dimensions", JSON.parse(value)["choices"][0]["text"]);
  return JSON.parse(value)["choices"][0]["text"];
}

async function generateNumericalDimensions(prompt, numNum){
    const message = `list ${numNum}  numerical dimensions on which we can assess
     the story for the prompt: ${prompt} 
    ####
    no length/grammar/word count related dimensions are allowed
    no infinities or NaNs are allowed
    ####
    answer in the following JSON format: 
    {
        "<dimension name>": [<lowest value>, <highest value>]
    }`;
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: `${message}`,
        temperature: 0.7,
        max_tokens: MAX_TOKEN_SMALL,
        top_p: 1,
        frequency_penalty: 0.75,
        presence_penalty: 0,
      }),
    });
    const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
    const {value, done} = await reader.read();
    console.log("numerical dimensions", JSON.parse(value)["choices"][0]["text"]);
    return JSON.parse(value)["choices"][0]["text"];
}



async function highlightTextBasedOnDimension(dimension, val, text){
  let result = await getRelatedTextBasedOnDimension(dimension, val, text);
  for (let i = 0; i < 5; i++){
      if (validateFormatForHighlight(result)) {
          console.log("all related", result)
          return result;
      };
      result = await getRelatedTextBasedOnDimension(dimension, val, text);
  }
  // did not get a valid response after 5 tries
  console.log("failed to get a valid response")
  return null;
}

async function getRelatedTextBasedOnDimension(dimension, val, text){
    // given a dimension, highlight the text that is related to the dimension
    // return a html string with the highlighted text in the span tag
    const message = `list 3 excerpts of the text that reflect the dimension: ${dimension} ${val}  
    ####
    the story is: ${text}
    ####
    Don't include any text other than the json
    Don't show Answer at the beginning of the response
    ####
    answer in the following JSON format: 

    {
        "1": "<original text 1>", 
        "2": "<original text 2>", 
        "3": "<original text 3>"
    }`;
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: `${message}`,
        temperature: 0,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0.75,
        presence_penalty: 0,
      }),
    });
    const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
    const {value, done} = await reader.read();
    return JSON.parse(value)["choices"][0]["text"];
}



async function getKeyTextBasedOnDimension(kvPairs, text){
  // given several dimensions, return 3 sentences that reflect the dimension values

  // kvPairs is a list of key value pairs, break it into a string
  let valReq = "";
  for (let i = 0; i < kvPairs.length; i++){
    valReq += `${kvPairs[i]['dimension']} : ${kvPairs[i]['value']}`
  }
  
  const message = `list up to 3 excerpts of the text that reflect the dimension: ${valReq}  
  ####
  the story is: ${text}
  ####
  Don't include any text other than the json
  Don't show Answer at the beginning of the response
  ####
  answer in the following JSON format: 

  {
      "1": "<original text 1>", 
      "2": "<original text 2>", 
      "3": "<original text 3>"
  }`;
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: `${message}`,
      temperature: 0,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0.75,
      presence_penalty: 0,
    }),
  });
  const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
  const {value, done} = await reader.read();
  let result  = JSON.parse(value)["choices"][0]["text"]
  // only grep the {} part
  result = result.substring(result.indexOf("{"), result.lastIndexOf("}") + 1);
  return result;
}

function validateFormatForDimensions(response, isNumerical){
  // validate the format of the response
  // return true if the response is in the correct format
  // return false if the response is not in the correct format
  try {
      // check if the response is in the JSON format
      const result = JSON.parse(response);
      console.log("result format",result);
      //  check if there are any infinities or NaNs
      if (isNumerical)
          for (const [low, high] of Object.values(result)) {
              if (!isFinite(low) || !isFinite(high) || low >= high) {
                  console.log("invalid numerical dimension", low, high);
                  return false;
              }
          }
      return true
  }
  catch (e) {
      console.log(e, response);
      return false
  }
}

export function validateFormatForHighlight(response){
  // validate the format of the response
  // return true if the response is in the correct format
  // return false if the response is not in the correct format
  try {
      // check if the response is in the JSON format
      const result = JSON.parse(response);
      console.log("result format",result);
      //  check if there are any infinities or NaNs
      for (const [key, value] of Object.entries(result)) {
          if (key !== "1" && key !== "2" && key !== "3"){
              console.log("invalid key", key);
              return false;
          }
      }
      return true
  }
  catch (e) {
      console.log(e);
      return false
  }
}

async function generateDimensionBasedOnExample(examples, requirements){


}

export {
  highlightTextBasedOnDimension, 
  getKeyTextBasedOnDimension,
  // Dimension related functions
  generateDimensions, 
  generateCategoricalDimensions, 
  // generateNumericalDimensions, 
  generateDimensionBasedOnExample,
  // Validation related functions
  validateFormatForDimensions, 
};