import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Service worker (PWA) кешує застосунок для офлайн-роботи, але сам по собі
// може роками не перевіряти, чи є новіша версія на сервері. Форсуємо перевірку
// одразу при відкритті й раз на 30 хв, а коли нова версія готова — перезавантажуємо,
// щоб користувач завжди бачив актуальний код, а не застарілий кеш.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.update()
    setInterval(() => registration.update(), 30 * 60 * 1000)
  })

  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })
}
