import type { Sketch } from '@/types'
import type { Ref } from 'vue'
import { onBeforeUnmount, onMounted } from 'vue'
import { run } from '@/lib/runner'

export function useSketch (canvasRef: Ref<HTMLCanvasElement | undefined>, sketch: Sketch) {
  let stop: (() => void) | undefined

  onMounted(() => {
    if (canvasRef.value) {
      stop = run(canvasRef.value, sketch)
    }
  })

  onBeforeUnmount(() => stop?.())
}
