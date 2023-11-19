import { create } from 'zustand'

/*  
    Functionality:
    Store all the response data related to the current response in the current block in the editor 
    This is only used when a new response is created in the editor and before it is saved to the database
    largely used in space-generation-util, ai-form
*/

const useSelectedStore = create((set) => ({
    selectedResponse: {},                // response text; only use for showing the very first response to the user
    
    setSelectedResponse: (id,r) => set((state) => ({
        selectedResponse: {...state.selectedResponse, [id]: r}})),

    getSelectedResponse: (id) => set((state) => ({
        selectedResponse: state.selectedResponse[id]})),
    }))

        
  
export default useSelectedStore;