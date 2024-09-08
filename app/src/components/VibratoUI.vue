<script setup>
import parameterDescriptor from "../parameterDescriptor.js"
</script>

<template>
<h3 class="section-title"></h3>

<div class="section">
    
    <div class="param" id="vibratoRate">
    <h5>{{ params.vibratoRate.name }}</h5>
    <input type="range" :min="minLogvibratoRate" :max="maxLogvibratoRate" :step="(maxLogvibratoRate - minLogvibratoRate) / 500" 
        v-model="logvibratoRate" @input="vibratoRateChanged" />
    <div>{{ vibratoRate}} </div>
    </div>
    <div class="param" id="vibratoDepth">
        <h5>{{ params.vibratoDepth.name }}</h5>
        <input type="range" :min="params.vibratoDepth.minValue" :max="params.vibratoDepth.maxValue" :step="0.01"
        v-model="vibratoDepth" @input="vibratoDepthChanged" />
        <div>{{ vibratoDepth }}</div>
    </div>
</div>
</template>

<script>
export default {
    name: "TremoroUI",
    emits: ["parameterChanged"],
        data() {
        return {
            params: parameterDescriptor.parameters,
        
            vibratoRate: parameterDescriptor.parameters.vibratoRate.defaultValue,
            vibratoDepth: parameterDescriptor.parameters.vibratoDepth.defaultValue,

            // for log scale slider (vibratoRate)
            logvibratoRate: Math.log(parameterDescriptor.parameters.vibratoRate.defaultValue),
            minLogvibratoRate: Math.log(0.001),  // Avoid log(0) and allow 0 in linear scale
            maxLogvibratoRate: Math.log(parameterDescriptor.parameters.vibratoRate.maxValue),
        };
    },
    methods: {
        vibratoRateChanged(event) {
        // Handle the case where logvibratoRate is close to 0
            let vibratoRate = Math.exp(this.logvibratoRate);
            if (vibratoRate < 0.01) vibratoRate = 0; // Set a threshold to treat small values as 
            if (this.vibratoRate != vibratoRate) {
                this.vibratoRate = Math.round(vibratoRate* 1000) / 1000;
                const param = { id: this.params.vibratoRate.id, value: this.vibratoRate };
                this.$emit("parameterChanged", param);
            }
        },
        vibratoDepthChanged(event){
            const param = { id: this.params.vibratoDepth.id, value: this.vibratoDepth};
            this.$emit("parameterChanged",param);
        }
    }
}
</script>

<style scoped></style>
