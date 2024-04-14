# Luminate: Structured Generation and Exploration of Design Space with Large Language Models for Human-AI Co-Creation

<p align="left">
<a href="https://luminate-research.netlify.app/" target="_blank"><img src="./public/luminate-interface.png" width="100%" style="vertical-align: middle;" alt="G"></img></a>
</p>


### Try <a href="https://luminate-research.netlify.app/" target="_blank">Demo</a>

For a quick overview, watch this <a href="https://youtu.be/_H8yt2OS7FE?si=UJ7hpb2B7yX4VfVJ" target="_blank">30-sec preview video</a>. 

### Motivation

Thanks to their generative capabilities, generative models are now an invaluable tool for creative tasks. They can instantly generate tens to hundreds of visual & textual outputs, offering an abundant source of inspiration. But are we using them to their full potential? Current interaction paradigms — such as prompt engineering (`enter prompt -> get response -> refine prompt ->  get response -> ... repeat until satisfied`) — guide people to rapidly converge on a set of initial — potentially suboptimal — ideas and refine them instead of using their generative capabilities to bolster our creativity. 

We argue that generative AI models should assist in the generation of the design space — a space of possible ideas — rather than individual artifacts at the early stage of the creative process to empower users and harness the creative potential of AI.

When users prompt, we can generate key dimensions relevant to a task or topic in the prompt (e.g., genre, plot, tone, etc. for writing a story) and then relevant values for these dimensions (e.g., sci-fi, romance, comedy, etc. for genre). Using these LLM-generated dimensions and values, we can generate a number of responses with different dimensional values. This enables the systematic generation of diverse responses/ideas, covering a wide range of possible responses (e.g., sci-fi, romance, comedy). 

To test the feasibility and scalability of this approach, we developed Luminate, an interactive system with novel features to support this proposed interaction paradigm.

(from https://x.com/sangho_suh/status/1718384100330156398)

---

For more details, look at our <a href="https://youtu.be/CwVodmRuLds?si=qKHIbdtxWtICXCG8" target="_blank">6-min video</a>, <a href="https://x.com/sangho_suh/status/1718384100330156398" target="_blank">tweet</a>, <a href="https://arxiv.org/abs/2310.12953" target="_blank">paper</a>, or <a href="https://luminate-research.github.io/" target="_blank">project page</a>.

## Installation

If running for the first time, install dependencies (required: node.js v14.17.0):

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

