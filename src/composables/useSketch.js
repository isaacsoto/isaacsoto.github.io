import { onBeforeUnmount, onMounted } from 'vue'
import { run } from '@/lib/runner'

export function useSketch (canvasRef, sketch) {
  let stop

  onMounted(() => {
    stop = run(canvasRef.value, sketch)
  })

  onBeforeUnmount(() => stop?.())
}
