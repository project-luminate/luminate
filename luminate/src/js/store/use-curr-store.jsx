import { create } from 'zustand'


/* store all the block related data in the editor and current node data in the visualization */
const useCurrStore = create((set) => ({
    currBlockId : null,
    maxBlockId : 0,
    focusedBlockId : 0,

    // what should be set opacity !!! actually, these are nodes that are ****NOT**** wanted!!!
    dimensionMap: {},
    setDimensionMap: (dimensionMap) => set((state) => {
        state.dimensionMap = dimensionMap;
        return state;
    }),
    addFilteredLabel: (dimName, label) => set((state) => {
        if (!state.dimensionMap[dimName].filtered) {
            state.dimensionMap[dimName].filtered = [label];
        } else {
            state.dimensionMap[dimName].filtered.push(label);
        }
        return state;
    }),
    removeFilteredLabel: (dimName, label) => set((state) => {
        if (state.dimensionMap[dimName].filtered) {
            state.dimensionMap[dimName].filtered = state.dimensionMap[dimName].filtered.filter(l => l !== label);
        }
        return state;
    }),


    wantedNodes: new Set(),
    setWantedNodes: (ids) => set((state) => {
        state.wantedNodes = ids;
        return state;
    }),
    addWantedNode: (id) => set((state) => {
        state.wantedNodes.add(id);
        return state;
    }),
    removeWantedNode: (id) => set((state) => {
        if (state.wantedNodes.has(id))
        state.wantedNodes.delete(id);
        return state;
    }),


    // the nodes that matches the keyword
    keywordNodes: new Set(),
    setKeywordNodes: (ids) => set((state) => {
        state.keywordNodes = ids;
        return state;
    }),
    addKeywordNode: (id) => set((state) => {
        state.keywordNodes.add(id);
        return state;
    }),
    removeKeywordNode: (id) => set((state) => {
        if (state.keywordNodes.has(id))
        state.keywordNodes.delete(id);
        return state;
    }),

    // the newly added nodes
    newNodes: new Set(),
    setNewNodes: (ids) => set((state) => {
        state.newNodes = ids;
        return state;
    }),
    addNewNode: (id) => set((state) => {
        state.newNodes.add(id);
        return state;
    }),
    removeNewNode: (id) => set((state) => {
        if (state.newNodes.has(id))
        state.newNodes.delete(id);
        return state;
    }),

    // editor instance
    editorInstance: null,
    setEditorInstance: (editor) => set({ editorInstance: editor }),

    // Currently hovered over label
    focusedDimensionLabel: null,
    setFocusedDimensionLabel: (label) => set((state) => {
        state.focusedDimensionLabel = label;
        return state;
    }),
    

    // current nodes in visulization
    nodeMap: {},
    setNodeMap: (nodeMap) => set((state) => {
        state.nodeMap = nodeMap;
        return state;
    }),

    // all nodes in visulization
    allNodeMap: {},
    setAllNodeMap: (nodeMap) => set((state) => {
        state.allNodeMap = nodeMap;
        return state;
    }),

    selectedLabelIds: {
        x: -1,
        y: -1,
    },
    setSelectedLabelIds: (x, y) => set((state) => {
        // If -1, ignore and don't update. If -2, reset to -1
        if (x !== -1) state.selectedLabelIds.x = x === -2 ? -1 : x;
        if (y !== -1) state.selectedLabelIds.y = y === -2 ? -1 : y;
        return state;
    }),

    // utility functions
    setCurrBlockId: (id) => set((state) => ({
        currBlockId: id})),
    setMaxBlockId: (id) => set((state) => ({
        maxBlockId: id})),
    setFocusedBlockId: (id) => set((state) => ({
        focusedBlockId: id})),

  }))
  
export default useCurrStore;