import { create } from 'zustand'

/* store all the dimension, filter and myFav data related to filtering in the visualization */
const useDimStore = create((set) => ({
    dimensions : [], // list of dimensions
    labels: {}, // Labels to filter {dimension: (val1, val2, ...)}
    compareMode: false,
    myFav: false,
    
    // Add a label
    addLabel: (l) => set((state) => ({ 
        // if the label is a key in the labels object, add the value to the set of values
        labels: state.labels[l.key] ? {...state.labels, [l.key]: state.labels[l.key].add(l.value)} : {...state.labels, [l.key]: new Set([l.value])} })),
    removeAllLabels: () => set((state) => ({
        labels: {}
    })),
    removeLabel: (l) => set((state) => ({
        labels: {...state.labels, [l.key]: new Set([...state.labels[l.key]].filter((value) => value !== l.value))}
    })),

    // Add a dimension
    setDimensions: (dims) => set((state) => ({
        dimensions: dims,
    })),
    addDimension: (d) => set((state) => ({ 
        dimensions: [...state.dimensions, d] })),
    removeDimension: (d) => set((state) => ({
        dimensions: state.dimensions.filter((value) => value.name !== d.name)
    })),
    removeAllDimensions: () => set((state) => ({
        dimensions: []})),

    // myFav
    toggleMyFav: () => set((state) => ({
        myFav: !state.myFav})),
  }))
  
export default useDimStore;