import { createContext, useContext, useState, useEffect } from 'react'

const SavedContext = createContext()

export function SavedProvider({ children }) {
  const [saved, setSaved] = useState(() => {
    const stored = localStorage.getItem('savedRestaurants')
    return stored ? JSON.parse(stored) : []
  })

  const [passed, setPassed] = useState(() => {
    const stored = localStorage.getItem('passedRestaurants')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem('savedRestaurants', JSON.stringify(saved))
  }, [saved])

  useEffect(() => {
    localStorage.setItem('passedRestaurants', JSON.stringify(passed))
  }, [passed])

  const saveRestaurant = (id) => {
    if (!saved.includes(id)) {
      setSaved(prev => [...prev, id])
    }
  }

  const passRestaurant = (id) => {
    if (!passed.includes(id)) {
      setPassed(prev => [...prev, id])
    }
  }

  const removeFromSaved = (id) => {
    setSaved(prev => prev.filter(i => i !== id))
  }

  const isSaved = (id) => saved.includes(id)
  const isPassed = (id) => passed.includes(id)

  const resetAll = () => {
    setSaved([])
    setPassed([])
    localStorage.removeItem('savedRestaurants')
    localStorage.removeItem('passedRestaurants')
  }

  return (
    <SavedContext.Provider value={{
      saved,
      passed,
      saveRestaurant,
      passRestaurant,
      removeFromSaved,
      isSaved,
      isPassed,
      resetAll,
      savedCount: saved.length,
      passedCount: passed.length
    }}>
      {children}
    </SavedContext.Provider>
  )
}

export function useSaved() {
  const context = useContext(SavedContext)
  if (!context) {
    throw new Error('useSaved must be used within SavedProvider')
  }
  return context
}
