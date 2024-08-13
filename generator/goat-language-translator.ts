import fs from "fs"

const tones = ["↑", "→", "↓", "↗", "↘"]

const raw = fs.readFileSync("../lang/zh-CN.json", "utf-8")

const original: { [id: string]: string } = JSON.parse(raw)

const result: { [id: string]: string } = {}

for (const key in original) {
  let str = ""
  for (const char of original[key]) {
    const tone = tones[Math.floor(Math.random() * tones.length)]
    str += "咩" + tone
  }
  result[key] = str
}

fs.writeFileSync("../lang/ml-SG.json", JSON.stringify(result))
