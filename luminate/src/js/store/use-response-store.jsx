import { create } from 'zustand'

/*  
    Functionality: 
    Store all the response data related to the current response in the current block in the editor 
    This is only used when a new response is created in the editor and before it is saved to the database
    largely used in space-generation-util, ai-form
*/

const useResponseStore = create((set) => ({
    response: '',                // response text; only use for showing the very first response to the user
    responseId: null,            // response id
    generationState: 'dimension',
    context: '',
    setResponseId: (id) => set((state) => ({
        responseId: id})),
    setResponse: (r) => set((state) => ({
        response: r})),
    setGenerationState: (s) => set((state) => ({
        generationState: s})),
    setContext: (text) => set((state) => ({
        context: text,
    }))
  }))
  
export default useResponseStore;