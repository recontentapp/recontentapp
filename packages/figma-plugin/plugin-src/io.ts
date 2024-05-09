export const $emit =
  <Emittable>() =>
  (data: Emittable) => {
    figma.ui.postMessage(data)
  }

export const $on = <Receivable extends string>(
  settings: Record<Receivable, (message: any) => void>,
) => {
  figma.ui.onmessage = async message => {
    if (settings[message.type as Receivable]) {
      settings[message.type as Receivable](message)
    }
  }
}
