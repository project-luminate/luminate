# luminate
Luminate - an interactive system that enables structured generation and exploration of LLM outputs

required: node.js v14.17.0

## Installation

If running for the first time, install dependencies:

`npm install`

To run server, write:

```
npm run dev
```

To use OpenAI API, 

1. create `.env` file at the root of the directory.
2. Add the following in `.env`:

   ```
   VITE_OPENAI_API_KEY = "{YOUR_OPENAI_API_KEY}"
   ```
3. Replace `{YOUR_OPENAI_API_KEY}` with your openAI API key


## Bibtex
    
    ```
    @article{suh2023luminate,
    title = {Structured Generation and Exploration of Design Space with Large Language Models for Human-AI Co-Creation},
    author = {Suh, Sangho and Chen, Meng and Min, Bryan and Li, Toby Jia-Jun and Xia, Haijun},
    journal = {arXiv preprint arXiv:2310.12953},
    year = {2023},
    }
    ```

