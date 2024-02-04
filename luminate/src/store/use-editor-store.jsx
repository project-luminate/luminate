import { create } from 'zustand'

/* store all the block related data in the editor and current node data in the visualization */
const useEditorStore = create((set) => ({
    //api
    api: null,
    // editedMap
    editedMap: {},
    
    // add a new block to the editedMap
    addBlockToEditedMap: (blockId) => set((state) => {
        state.editedMap[blockId] = false;
        return state;
    }),
    // toggle the edited value of a block
    toggleEdited: (blockId) => set((state) => {
        state.editedMap[blockId] = !state.editedMap[blockId];
        return state;
    }),


}));

export default useEditorStore;