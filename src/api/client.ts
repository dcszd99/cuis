// localStorage 读写封装：统一键前缀，安全 JSON 序列化，并支持「首次种子」。
// 后续切换真实后端时，只需替换本模块的 read/write 实现，上层 API 无需改动。

const PREFIX = 'cuis:'

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function write<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function remove(key: string): void {
  localStorage.removeItem(PREFIX + key)
}

/** 首次访问时写入种子数据，之后直接读取已存储的数据。 */
export function ensureSeeded<T>(key: string, seed: T): T {
  const initKey = `${key}.initialized`
  if (read<boolean>(initKey, false)) {
    return read<T>(key, seed)
  }
  write(key, seed)
  write(initKey, true)
  return seed
}
