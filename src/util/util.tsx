import introJs  from 'intro.js';
import 'intro.js/introjs.css';

export const uuid = (): string => new Date().getTime().toString(36) + Math.random().toString(36).slice(2);

export const saveEnvVal = (key: string, value: string) => {
  import.meta.env[key] = value;
};

export const getEnvVal = (key: string): string => {
  return import.meta.env[key];
}

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

export const startTutorial = () => {
  const intro = introJs();
  intro.setOptions({
    tooltipClass: 'tutorialTooltip',
    steps: [
      {
        title: 'Luminate Tutorial <img src="luminate-logo.png" style="width:30px; height:30px;"/>',
        intro: 'This is a walkthrough to get you acquainted with each component of Luminate and help you understand the system.'
      },
      {
        title: 'Text Editor',
        element: document.querySelector('#text-editor-container'),
        intro: "This is the text editor where you can write your story."
      },
      {
        title: 'Prompt AI',
        element: document.querySelector('#ai-form'),
        intro: "You can also use this input box to ask AI for ideas.\
        The AI takes a few seconds to figure out important attributes to this prompt and generates multiple responses. "
      },
      {
        title: 'Exploration View',
        element: document.querySelector('#my-spaceviz'),
        intro: "This is the exploration view where you can see multiple responses once you prompt AI for ideas."
      },
      {
        title: 'Collapse Text Editor',
        element: document.querySelector('#collapse-button'),
        intro: "You can collapse the text editor to get a better view of the exploration view."
      },
      {
        title: 'Search Bar',
        element: document.querySelector('#searchbar'),
        intro: "You can use the search bar to quickly find responses that contain a specific word or phrase."
      },
      {
        title: 'Favorites',
        element: document.querySelector('#fav-button'),
        intro: "You can click the bookmark icon to see your favorite responses of current space."
      },
      {
        title:'Filter',
        element: document.querySelector('#filter-dims'),
        intro: 'Once the design space is generated, you can see dimensions like the one shown here. You can filter the responses based on these dimensions and the associated values.\
        <img src="filter-bar.png" style="width:100%; height:auto;"/>'
      },
      {
        title:'Semantic Zoom',
        element: document.querySelector('.semantic-level-panel'),
        intro: 'You can use the semantic zoom to see responses at different levels of abstraction (dot,title, keywords, summary, and full text).\
        <img src="semantic-zoom.png" style="width:100%; height:auto;"/>'
      },
      {
        title:'Select Dimension',
        element: document.querySelector('#x-trigger'),
        intro: "You can select a dimension to arrange the responses in the exploration view based on the values in that dimension."
      },
      {
        title:'Menu',
        intro: ' At the top right corner, you can see 4 icon buttons.\
                <ul style=\"list-style-type: none; padding-left: 0; margin-top: 10px;\">\
                  <li style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 10px;\">\
                      <img src=\"tutorial-menu.png\" alt=\"Tutorial\" style=\"width: 30px; height: 30px;\">\
                      <strong>Tutorial:</strong> You can watch the tutorial of Luminate.\
                  </li>\
                  <li style=\"display: flex; align-items: center; gap: 10px; margin-bottom: 10px;\">\
                      <img src=\"contact-menu.png\" alt=\"Settings\" style=\"width: 30px; height: auto;\">\
                      <strong>Contact:</strong> You can contact researchers via email.\
                  </li>\
                  <li style="display: flex; flex-direction: column; align-items: center; gap: 20px; margin-bottom: 10px;">\
                      <div style="display: flex; width: 100%; gap: 10px;">\
                          <img src="settings-menu.png" alt="Settings" style="width: 30px; height: 30px;">\
                          <strong>Settings:</strong> You can enter your OpenAI API key and change the batch size and number of dimensions.\
                          The default batch size is 20 and the number of dimensions is 3.\
                      </div>\
                      <img src="settings-input.png" alt="Semantic Zoom" style="width: auto; height: 350px; ">\
                  </li>\
                  <li style=\"display: flex; gap: 10px; margin-bottom: 10px;\">\
                      <img src=\"about-menu.png\" alt=\"About\" style=\"width: 30px; height: 30px;\">\
                      <strong>About:</strong> You can learn more about the research paper and the framework that Luminate instantiates.\
                  </li>\
              </ul>\
        ',
      },
      {
        title: 'Luminate Tutorial <img src="luminate-logo.png" style="width:30px; height:30px;"/>',
        intro: 'This is the end of the tutorial. You can also watch a 30s video demo video to get a better understanding of Luminate.\
        <video width="540px" height="360px" controls>\
          <source src="luminate-video-preview.mp4" type="video/mp4">\
          Your browser does not support the video tag.\
        </video>\
        If you want to watch the tutorial again, click <img src="tutorial-menu.png" style="width:30px; height:auto;"/>\
        on the top right corner. Enjoy using Luminate!'
      },
    ]
  });
  intro.setOption("dontShowAgain", false).start();
}
