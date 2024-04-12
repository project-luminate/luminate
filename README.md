# Luminate: Structured Generation and Exploration of Design Space with Large Language Models for Human-AI Co-Creation

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


## CHI 2024 Paper

**Luminate: Structured Generation and Exploration of Design Space with Large Language Models for Human-AI Co-Creation**<br />
Sangho Suh\*, Meng Chen\*, Bryan Min, Toby Jia-Jun Li, Haijun Xia

**Please cite this paper if you used the code or prompts in this repository.**

> Sangho Suh, Meng Chen, Bryan Min, Toby Jia-Jun Li, and Haijun Xia. 2024. Luminate: Structured Generation and Exploration of Design Space with Large Language Models for Human-AI Co-Creation. In Proceedings of the CHI Conference on Human Factors in Computing Systems (CHI ’24), May 11–16, 2024, Honolulu, HI, USA. ACM, New York, NY, USA, 26 pages. https://dl.acm.org/doi/10.1145/3613904.3642400

## Bibtex
    
 ```bibtex
 @article{suh2023luminate,
   title = {Luminate: Structured Generation and Exploration of Design Space with Large Language Models for Human-AI Co-Creation},
   author = {Suh, Sangho and Chen, Meng and Min, Bryan and Li, Toby Jia-Jun and Xia, Haijun},
   booktitle = {Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems},
   pages = {1--26},
   year = {2024},
   url = {https://doi.org/10.1145/3613904.3642400},
   doi = {10.1145/3613904.3642400}
 }
 ```

