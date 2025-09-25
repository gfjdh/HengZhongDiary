import { ref } from 'vue';

export function useExample() {
  const count = ref(0);
  function inc() { count.value++; }
  return { count, inc };
}
