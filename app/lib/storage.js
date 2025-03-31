const testResultsKey = 'results'
const testResultDetailsKey = 'results-details'
const customPresetKey = 'custom-presets'

function guidGenerator() {
  const S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}`
}

/**
 *
 * @param {string} key
 * @returns {null | object | array}
 *
 */
const getFromStorage = (key) => {
  const data = localStorage.getItem(key)
  if (!data) {
    return null
  }
  try {
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}

/**
 *
 * @param {string} key
 * @param {array | object} value
 * @returns { void }
 *
 */
const setToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 *
 * @param {string} key
 * @returns { void }
 *
 */
const removeFromStorage = (key) => {
  localStorage.removeItem(key)
}

const STORAGE = {
  resetStats: () => {
    removeFromStorage(testResultDetailsKey)
    removeFromStorage(testResultsKey)
  },
  getAllTestResultsDetails: () => {
    const data = getFromStorage(testResultDetailsKey)
    return data || []
  },
  getTestResultsDetailsByPresetId: (presetId) => {
    const data = STORAGE.getAllTestResultsDetails().filter(
      (result) => result.preset_id === presetId
    )
    return data
  },
  getTestResults: () => {
    const data = getFromStorage(testResultsKey)
    return data || []
  },
  saveTestResult: (presetId, newScore) => {
    const results = STORAGE.getTestResults()
    const result = results.find((result) => result.presetId === presetId)
    if (result) {
      result.completed += 1
      result.score = newScore
    } else {
      results.push({ presetId, completed: 1, score: newScore })
    }
    setToStorage(testResultsKey, results)

    const resultDetails = STORAGE.getAllTestResultsDetails()
    resultDetails.push({
      id: guidGenerator(),
      user_id: '0',
      preset_id: presetId,
      score: newScore,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    })
    setToStorage(testResultDetailsKey, resultDetails)
  },
  deleteCustomPreset(id) {
    const customPresets = STORAGE.getAllCustomPreset()
    const index = customPresets.findIndex((preset) => preset.id === id)
    if (index !== -1) {
      customPresets.splice(index, 1)
      setToStorage(customPresetKey, customPresets)
    }
  },
  getAllCustomPreset() {
    const customPresets = getFromStorage(customPresetKey) || []
    return customPresets
  },
  getCustomPresetByTrainerId(trainerId) {
    const filtered = STORAGE.getAllCustomPreset().filter(
      (preset) => preset.parent === trainerId
    )
    return filtered
  },
  saveCustomPreset(preset) {
    const presets = STORAGE.getAllCustomPreset()
    presets.push({ id: guidGenerator(), ...preset })
    setToStorage(customPresetKey, presets)
  },
}
