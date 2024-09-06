<script setup>
import parameterDescriptor from "../parameterDescriptor.js"
</script>


<template>
    <h3 class="section-title">Distortion</h3>
    <div class="section">
      <div class="param" id="distortion">
        <h5>
          {{ params.distortion.name }}
        </h5>
        <input type="range" :min="params.distortion.minValue" :max="params.distortion.maxValue" step="0.01" v-model="distortion"
          @input="distortionChanged" />
        <div>
          {{ distortion }} 
        </div>
      </div>
    </div>
</template>

<script>
export default {
  name: "DistortionUI",
  emits: ["parameterChanged"],
  data() {
    return {
      params: parameterDescriptor.parameters,

      distortion: parameterDescriptor.parameters.distortion.defaultValue,
    }
  },
  methods:
  {
    distortionChanged() {
      const param = { id: this.params.distortion.id, value: this.distortion }
      this.$emit("parameterChanged", param)
    },
  },
}
</script>

<style scoped></style>