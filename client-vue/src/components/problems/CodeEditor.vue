<template>
  <div class="code-editor">
    <div class="editor-header flex justify-content-between align-items-center mb-3">
      <span class="font-bold">Code Editor</span>
      <Select
        v-model="selectedLanguage"
        :options="languages"
        optionLabel="name"
        optionValue="value"
        placeholder="Select Language"
        class="w-10rem"
      />
    </div>

    <div class="editor-container border-1 surface-border border-round">
      <textarea
        ref="editorRef"
        v-model="code"
        class="code-textarea w-full"
        :style="{ height: editorHeight + 'px' }"
      ></textarea>
    </div>

    <div class="editor-actions flex justify-content-end gap-2 mt-3">
      <Button label="Run Code" icon="pi pi-play" severity="secondary" @click="handleRunCode" />
      <Button label="Submit" icon="pi pi-check" @click="handleSubmit" />
    </div>

    <div v-if="output" class="output-container mt-3">
      <Card>
        <template #title>Output</template>
        <template #content>
          <pre class="output-content">{{ output }}</pre>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted,watch } from 'vue'

interface Props {
  problemId: number
}

const props = defineProps<Props>()

const editorRef = ref<HTMLTextAreaElement>()
const code = ref('')
const selectedLanguage = ref('javascript')
const output = ref('')
const editorHeight = 400

const languages = [
  { name: 'JavaScript', value: 'javascript' },
  { name: 'TypeScript', value: 'typescript' },
  { name: 'Python', value: 'python' },
  { name: 'Java', value: 'java' },
  { name: 'C++', value: 'cpp' },
]

const defaultCode = {
  javascript: `function solve(input) {
    // Your code here
    return input;
}`,
  typescript: `function solve(input: any): any {
    // Your code here
    return input;
}`,
  python: `def solve(input):
    # Your code here
    return input`,
  java: `public class Solution {
    public Object solve(Object input) {
        // Your code here
        return input;
    }
}`,
  cpp: `#include <iostream>
#include <vector>

using namespace std;

class Solution {
public:
    vector<int> solve(vector<int>& input) {
        // Your code here
        return input;
    }
};`,
}

const handleRunCode = () => {
  // Mock execution
  output.value =
    'Running your code...\n\nTest Cases:\n✓ Test case 1 passed\n✓ Test case 2 passed\n\nAll test cases passed!'
}

const handleSubmit = () => {
  output.value =
    'Submitting your solution...\n\n✓ Solution accepted!\n✓ Runtime: 45ms (beats 85% of submissions)\n✓ Memory: 42.1MB (beats 78% of submissions)'
  emit('codeSubmit', code.value)
}

const emit = defineEmits<{
  codeSubmit: [code: string]
}>()

onMounted(() => {
  code.value = defaultCode[selectedLanguage.value as keyof typeof defaultCode]
})

// Watch language change
watch(selectedLanguage, (newLang) => {
  code.value = defaultCode[newLang as keyof typeof defaultCode]
})
</script>

<style scoped>
.code-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  border: none;
  outline: none;
  resize: none;
  padding: 1rem;
  background: #1e1e1e;
  color: #d4d4d4;
}

.output-content {
  white-space: pre-wrap;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  margin: 0;
}
</style>
