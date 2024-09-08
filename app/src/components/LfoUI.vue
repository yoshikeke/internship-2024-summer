<script setup>
import parameterDescriptor from "../parameterDescriptor.js"
</script>

<template>
  <h3 class="section-title">Tremoro</h3>

  <div class="section">
    
    <div class="param" id="lfoRate">
      <h5>{{ params.lfoRate.name }}</h5>
      <input type="range" :min="minLogLfoRate" :max="maxLogLfoRate" :step="0.01"
        v-model="logLfoRate" @input="lfoRateChanged" />
      <div>{{ lfoRate }} Hz</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FilterAndLfoUI",
  emits: ["parameterChanged"],
  data() {
    return {
      params: parameterDescriptor.parameters,
      
      lfoRate: parameterDescriptor.parameters.lfoRate.defaultValue,

      // for log scale slider (lfoRate)
      logLfoRate: parameterDescriptor.parameters.lfoRate.defaultValue === 0 ? 0 : Math.log(parameterDescriptor.parameters.lfoRate.defaultValue),
      minLogLfoRate: 0,  // Allow the LFO rate to be 0
      maxLogLfoRate: Math.log(parameterDescriptor.parameters.lfoRate.maxValue),
    };
  },
  methods: {
    lfoRateChanged(event) {
      // Handle the case where logLfoRate is 0
      let lfoRate;
      if (this.logLfoRate === 0) {
        lfoRate = 0;
      } else {
        lfoRate = Math.round(Math.exp(this.logLfoRate) * 100) / 100;
      }

      if (this.lfoRate !== lfoRate) {
        this.lfoRate = lfoRate;
        const param = { id: this.params.lfoRate.id, value: this.lfoRate };
        this.$emit("parameterChanged", param);
      }
    },
  }
}
</script>

<style scoped></style>
