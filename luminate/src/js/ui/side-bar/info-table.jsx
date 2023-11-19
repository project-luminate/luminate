import React, { useState, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

import * as d3 from 'd3';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Typography } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';

import { Handle } from "reactflow";

import * as GPTUtil from '../../util/gpt-util';

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const red = (bigint >> 16) & 255;
    const green = (bigint >> 8) & 255;
    const blue = bigint & 255;
    return `${red}, ${green}, ${blue}`;
}

const columns = [
    {
        field: 'id',
        headerName: 'Dimension',
        width: 100,
        editable: false,
    },
    {
        field: 'color',
        headerName: 'Color',
        width: 100,
        editable: false,
        renderCell: (params) => (
            <div style={{ backgroundColor: params.value, width: '20px', height: '20px', borderRadius: '50%' }}></div>
        ),
    },
    {
        field: 'type',
        headerName: 'Type',
        width: 100,
        editable: false,
    },
    {
        field: 'value',
        headerName: 'Value',
        editable: false,
        isRowSelectable: (params) => params.row.type === 'numerical', // Disable selection for numerical cells

    },
    
];

const rows = (d) => {
    var data = [];
    // Create a color scale for categorical attributes
    const categoricalColorScale = d3.scaleOrdinal(d3.schemeCategory10);
    // Create a color scale for numerical attributes
    const numericalColorScale = d3.scaleSequential(d3.interpolateViridis);
    // Create a color scale for ordinal attributes
    const ordinalColorScale = d3.scaleOrdinal(d3.schemeTableau10);

    Object.entries(d.categorical).forEach(([attribute, value]) => {
        data.push({id: attribute, value: value, type: "categorical", color: categoricalColorScale(value)});
    });
    Object.entries(d.ordinal).forEach(([attribute, value]) => {
        data.push({id: attribute, value: value, type: "ordinal", color: ordinalColorScale(value)});
    });

    Object.entries(d.numerical).forEach(([attribute, value]) => {
        data.push({id: attribute, value: value, type: "numerical", color: numericalColorScale(value)});
    });
    return data;
}

const updateColoredText = (relevantText, originalText, color) => {
    // find the relevant text in the text
    // highlight the text with the same color as the button
    // add the text to the response panel
    // get all values from the json
    relevantText = JSON.parse(relevantText);
    var highlightedText = originalText;
    console.log("highlighted text", highlightedText);
    Object.values(relevantText).forEach(text => {
      const regex = new RegExp(text, 'gi');
      highlightedText = highlightedText.replace(regex, `<span style="background-color: rgba(${hexToRgb(color)}, 0.5)">${text}</span>`);
    });
    return highlightedText;

}

export default function DataGridDemo({d}) {
    const [selectedRows, setSelectedRows] = useState([]);
    const [response, setResponse] = useState(d.Result);
    const [highlightedText, setHighlightedText] = useState([]);
    const rowsData = rows(d.Dimension)
    const [loading, setLoading] = useState(false);


    const handleSelectionModelChange = (newSelection) => {
        console.log("new selection", newSelection)
        setSelectedRows(newSelection);
    };

    const handleHighlight = () => {
        setLoading(true);
        const highlightPromises = selectedRows.map(async (selectedRow) => {
            const attribute = rowsData.find(row => row.id === selectedRow).id;
            const value = rowsData.find(row => row.id === selectedRow).value;
            const color = rowsData.find(row => row.id === selectedRow).color;
            try {
                const relevantText = await GPTUtil.highlightTextBasedOnDimension(attribute, value, d['Result']);
                const highlighted = updateColoredText(relevantText, d['Result'], color);
                return {
                    attribute: attribute,
                    value: value,
                    color: color,
                    highlighted: highlighted
                };
            } catch (error) {
                console.error('Error while highlighting:', error);
                var toast = new bootstrap.Toast(document.getElementById('error-toast'));
                document.getElementById('error-toast-text').textContent = "Please try again.";
                toast.show();
                return null; // Return null or handle error case accordingly
            }
        });
        
        // Wait for all the promises to resolve
        Promise.all(highlightPromises).then((highlightedResults) => {
            // if there's null in the highlighted results, don't add it to the highlighted text
            if (!highlightedResults.includes(null)) {
                setHighlightedText(highlightedResults);
            }
            
            setLoading(false);
        });
    }


    const isRowSelectable = (params) => params.row.type === 'categorical';
    return (
        <>
        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <Typography variant="h5" component="div" style={{padding: '10px'}}>Summary</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="h6" component="div" style={{padding: '10px'}}>
                    {d.Summary}
                </Typography>
            </AccordionDetails>
        </Accordion>
        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <Typography variant="h5" component="div" style={{padding: '10px'}}>Structure</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography variant="h6" component="div" style={{padding: '10px'}}>
                    {d.Structure}
                </Typography>
            </AccordionDetails>
        </Accordion>
        <Accordion>
            <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
            <Typography variant="h5" component="div" style={{padding: '10px'}}>Dimension Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box sx={{ width:'100%' }}>  
                    <Paper sx={{ width: '100%', mb: 2 }}>
                    <DataGrid
                        rows={rowsData}
                        columns={columns}
                        initialState={{
                        pagination: {
                            paginationModel: {
                            pageSize: 5,
                            },
                        },
                        }}
                        pageSizeOptions={[5]}
                        checkboxSelection
                        isRowSelectable={isRowSelectable}
                        rowSelectionModel={selectedRows}
                        onRowSelectionModelChange={handleSelectionModelChange}
                    />
                    {/* <Button
                        sx = {{margin: '10px'}}
                        disabled={selectedRows.length === 0}
                        onClick={handleHighlight}
                    >
                        Highlight
                    </Button> */}
                    <LoadingButton
                        sx = {{margin: '10px'}}
                        size="small"
                        onClick={handleHighlight}
                        loading={loading}
                        disabled={selectedRows.length === 0 || loading}
                        >
                        Highlight
                    </LoadingButton>
                    </Paper>
                </Box>
            </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Typography variant="h5" component="div" style={{padding: '10px'}}>GPT Response</Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="div" style={{ padding: '10px', position: 'relative' }}>
                    {response}
                    {
                        highlightedText.map((res, index) => {
                            return (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        zIndex: 1,
                                        margin : '10px',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: res.highlighted }}
                                >
                                    
                                </span>
                            )
                        })
                    }
                </Typography>       
            </AccordionDetails>
        </Accordion>
        </>
    );
}