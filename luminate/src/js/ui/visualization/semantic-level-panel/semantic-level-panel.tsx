import React, { useEffect, useReducer, useState } from "react"
import { IconButton, Tooltip} from "@mui/material"
import { BlurOn, Title, Abc, FormatAlignJustify, FormatListBulleted, Layers } from "@mui/icons-material";
import './semantic-level-panel.scss';
import * as d3 from "d3";
import { zoom } from 'd3-zoom';



export  const  SemanticLevelPanel = ({ zoom, setZoomLevel}) => {
    const [showAllButtons, setShowAllButtons] = useState(false);

    // a map match level to zoom number
    const levelToZoom = {
        dot: 1.5,
        title: 3,
        labels: 7,
        sum: 12,
        full: 13,
    }

    const onClickHandler = (level) => {
        console.log("level", levelToZoom[level]);
        setZoomLevel(null,levelToZoom[level]);
    }

    const onHoverHandler = (state) => {
        // show all buttons
        setShowAllButtons(state);

    }

  // Define an array of button components
  const buttons = [
    {
      level: 'dot',
      tooltip: 'Dot',
      placement: 'right',
      icon: <BlurOn />,
      minZoom: 0,
      maxZoom: 1.5, // No upper limit for this button
      id : 'dot-button'
    },
    {
      level: 'title',
      tooltip: 'Title',
      placement: 'right',
      icon: <Title />,
      minZoom: 1.5,
      maxZoom: 3,
      id : 'title-button'
    },
    {
      level: 'labels',
      tooltip: 'Keywords',
      placement: 'right',
      icon: <Abc />,
      minZoom: 3,
      maxZoom: 7,
      id : 'keyword-button'
    },
    {
      level: 'sum',
      tooltip: 'Summary',
      placement: 'right',
      icon: <FormatListBulleted />,
      minZoom: 7,
      maxZoom: 12,
      id : 'summary-button'
    },
    {
      level: 'full',
      tooltip: 'Full text',
      placement: 'right',
      icon: <FormatAlignJustify />,
      minZoom: 12,
      maxZoom: Number.POSITIVE_INFINITY, // No upper limit for this button
      id : 'full-text-button'
    },
  ];

  // Find the button that matches the current zoom level
  const matchingButton = buttons.find(
    (button) => zoom >= button.minZoom && zoom <= button.maxZoom
  );

  return (
    <div className="semantic-level-panel" 
        onMouseEnter={() => onHoverHandler(true)}
        onMouseLeave={() => onHoverHandler(false)}>
      <div className="menu">
      {
        buttons.map((button) => {
              return (
                <Tooltip key={button.level} title={button.tooltip} placement={button.placement}>
                  <IconButton
                    type="button"
                    aria-label="filter"
                    onClick={() => onClickHandler(button.level)}
                    style={{
                      background:  matchingButton?.level === button.level ? '#1b1b1b99' : '#ffffff99',
                      color: matchingButton?.level === button.level ? '#fff' : '#aaa',
                      display: showAllButtons ? 'flex' : 'none',
                    }}
                    id={button.id}
                  >
                    {button.icon}
                  </IconButton>
                </Tooltip>
              );
            })
        }
        {matchingButton && (
          showAllButtons ? 
              <Tooltip title='Layer' placement={matchingButton.placement}>
                <IconButton
                type="button"
                aria-label="filter"
                onClick={() => onClickHandler(matchingButton.level)}
                style={{
                  background: '#1b1b1b99',
                  color: '#fff',
                }}
              >
                <Layers/>
              </IconButton>
            </Tooltip>
            :
            <Tooltip title={matchingButton.tooltip} placement={matchingButton.placement}>
              <IconButton
                type="button"
                aria-label="filter"
                onClick={() => onClickHandler(matchingButton.level)}
                style={{
                  background: '#1b1b1b99',
                  color: '#fff',
                }}
              >
                {matchingButton.icon}
              </IconButton>
          </Tooltip>
          )
        }
      </div>
    </div>
  );
};