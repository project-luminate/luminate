import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from "react-dom/client";

// components
import ModalHead from './modal-head.jsx';
import DataGridDemo from './info-table.jsx';

import * as bootstrap from 'bootstrap';
import DatabaseManager from '../../db/database-manager.js';
import useResponseStore from '../../store/use-response-store.jsx';

export default class detailInfoOffcanvas {
    // constructor
    constructor(data) {
        this.data = data; // data object
        this.responsePanel = new bootstrap.Offcanvas('#response-panel');
        const root1 = createRoot(document.getElementById("offcanvas-header"));
        root1.render(<ModalHead d={this.data}/>);
        this.offCanvasBody = document.getElementById('offcanvas-body');
        this.information = document.getElementById('basic-info');
        this.responsePanel.show();
        const root2 = createRoot(document.getElementById("basic-info"));
        root2.render(<DataGridDemo d={this.data}/>);
        // if offcanvas is show, the user click outside the offcanvas, close the offcanvas 
        document.addEventListener('click', (event) => {
            const isClickInside = this.offCanvasBody.contains(event.target);
            if (!event.target.closest('.offcanvas') && this.responsePanel._element.classList.contains('show')) {
                this.closeOffcanvas();
            }
        });

    }

    // a function update that takes in a json data object and updates the div
    updateText() {
        // open panel & display selected response text
        this.responsePanel.show();
        const root = createRoot(document.getElementById("basic-info"));
        root.render(<DataGridDemo d={this.data}/>);
        
    }

    // if offcanvas is show, the user click outside the offcanvas, close the offcanvas 
    closeOffcanvas() {
        this.responsePanel.hide();
    }
}
