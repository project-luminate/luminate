import { defineConfig, loadEnv } from 'vite'

export const uuid = (): string => new Date().getTime().toString(36) + Math.random().toString(36).slice(2);

export const saveEnvVal = (key: string, value: string) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  console.log('API Key:', apiKey);
  // save api key
  import.meta.env[key] = value;
  const testKey = import.meta.env.VITE_OPENAI_API_KEY;
  console.log('Test Key:', testKey);
};

export const colors : string[] = [
  '#FF6E67',
  '#6AB2FF',
  '#48D6C1',
  '#FFC37A',
  '#C67BF2',
  '#2ECC71',
  '#6A7485',
  '#ADDF71',
  '#FFA054',
  "#6AB2FF",
  "#FFC37A",
  "#BB72E6",
  "#FF9350",
  "#6A7485",
  "#68DB8E",
  "#A45CCF",
  "#FF9350",
  "#BB72E6",
  "#6AB2FF",
  "#FFC37A",
  "#BB72E6",
  "#FF9350",
  '#FF7451',
  '#FF6E67',
  '#6AB2FF',
  '#48D6C1',
  '#FFC37A',
  '#C67BF2',
  '#6A7485',
  '#4DCFB1',
  '#FFA054',
];
