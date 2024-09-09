const oscTypes = {
    sawtooth: { index: 0, name: "Sawtooth" },
    sine: { index: 1, name: "Sine" },
    square: { index: 2, name: "square"},
    triangle: { index: 3, name: "triangle"},
    pseudo_sine: { index: 4, name: "pseudo_sine"},
}

const filterTypes = {
    bypass: { index: 0, name: "Bypass" },
    lowpass: { index: 1, name: "LowPass" },
    highpass: { index: 2, name: "highPass"},
    bandpass: { index: 3, name: "bandPass"},
    bandstop: { index: 4, name: "bandStop"},
}
                                         

const parameters = {
    oscType: {
        id: 0,
        name: "OSC Type",
        defaultValue: 0,
        minValue: 0,
        maxValue: Object.keys(oscTypes).length - 1,
    },
    frequency: {
        id: 1,
        name: "Frequency",
        defaultValue: 440.0,
        minValue: 20,
        maxValue: 10000,
    },
    filterType: {
        id: 2,
        name: "Filter Type",
        defaultValue: 0,
        minValue: 0,
        maxValue: Object.keys(filterTypes).length - 1,
    },
    cutoff: {
        id: 3,
        name: "Filter Cutoff",
        defaultValue: 1000,
        minValue: 20,
        maxValue: 20000,
    },
    resonance: {
        id: 4,
        name: "Filter Q",
        defaultValue: 0.7,
        minValue: 0.1,
        maxValue: 2,
    },
    volume: {
        id: 5,
        name: "Volume",
        defaultValue: 0.9,
        minValue: 0,
        maxValue: 1,
    },
    delayTime: {
        id: 6,
        name: "DelayTime",
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 5,
    },
    feedback: {
        id: 7,
        name: "Feedback",
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 1,
    },
    delayMix: {
        id: 8,
        name: "DelayMix",
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 1,
    },
    distortion:{
        id: 9,
        name: "Distortion",
        defaultValue: 1,
        minValue: 0.1,
        maxValue: 1,
    },
    tremoroRate:{
        id: 10,
        name: "tremoroRate",
        defaultValue: 0,
        minValue: 0,
        maxValue: 120,
    },
    vibratoRate:{
        id: 11,
        name: "vibratoRate",
        defaultValue: 0,
        minValue: 0,
        maxValue: 120,
    },
    vibratoDepth:{
        id: 12,
        name: "vibratoDepth",
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
    }
    
    
}

export default {
    oscTypes,
    filterTypes,
    parameters,
}