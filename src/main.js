import { SITE_CONFIG, WORK, LONG_FORM, getProjectById } from './config.js'

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
const isTouch = !hasFinePointer

document.body.classList.toggle('is-touch', isTouch)

let heroWantsSound = false
const HERO_VOLUME = 0.35 // 50% quieter than prior 0.7 level
let playerOpen = false
let playerWantsSound = false

/* ---------- Contact + config wiring ---------- */
function wireConfig() {
  const year = document.getElementById('year')
  if (year) year.textContent = String(new Date().getFullYear())

  const emailPrimary = document.getElementById('contactEmailPrimary')
  if (emailPrimary) {
    emailPrimary.href = SITE_CONFIG.emailUrl
    emailPrimary.target = '_blank'
    emailPrimary.rel = 'noopener noreferrer'
  }

  const links = document.getElementById('contactLinks')
  if (links) {
    const rows = [
      {
        label: 'Email',
        value: SITE_CONFIG.email,
        href: SITE_CONFIG.emailUrl,
        external: true,
      },
      {
        label: 'Instagram',
        value: SITE_CONFIG.instagramHandle,
        href: SITE_CONFIG.instagramUrl,
        external: true,
      },
      {
        label: 'WhatsApp',
        value: SITE_CONFIG.whatsapp,
        href: SITE_CONFIG.whatsappUrl,
        external: true,
      },
      {
        label: 'Discord',
        value: SITE_CONFIG.discord,
        href: null,
        copy: SITE_CONFIG.discord,
      },
    ]

    links.innerHTML = rows
      .map((row) => {
        const inner = `
          <span class="contact-row__label">${row.label}</span>
          <span class="contact-row__value">${row.value}</span>
        `
        if (row.href) {
          const ext = row.external
            ? ' target="_blank" rel="noopener noreferrer"'
            : ''
          return `<a class="contact-row" href="${row.href}"${ext}>${inner}</a>`
        }
        if (row.copy) {
          return `<button type="button" class="contact-row contact-row--button" data-copy="${row.copy}" aria-label="Copy Discord username ${row.value}">${inner}</button>`
        }
        return `<div class="contact-row">${inner}</div>`
      })
      .join('')

    links.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const value = btn.getAttribute('data-copy')
        try {
          await navigator.clipboard.writeText(value)
          const label = btn.querySelector('.contact-row__label')
          if (label) {
            const prev = label.textContent
            label.textContent = 'Copied'
            setTimeout(() => {
              label.textContent = prev
            }, 1200)
          }
        } catch {
          // ignore
        }
      })
    })
  }
}

/* ---------- Render work ---------- */
function mediaFrameMarkup(item, { eager = false } = {}) {
  const loading = eager ? 'eager' : 'lazy'
  return `
    <div
      class="media-frame"
      data-video-src="${item.src}"
      data-aspect="${item.aspect}"
      role="img"
      aria-label="${item.title} — ${item.category}"
    >
      <img src="${item.poster}" alt="" loading="${loading}" decoding="async" draggable="false" />
      <video
        muted
        loop
        playsinline
        preload="none"
        poster="${item.poster}"
        aria-hidden="true"
        tabindex="-1"
        ${eager ? '' : 'data-lazy-video'}
      ></video>
    </div>
  `
}

function renderSelected() {
  const root = document.getElementById('selectedWork')
  if (!root) return

  const featured = WORK.filter((w) => w.featured)
  root.innerHTML = featured
    .map((item) => {
      const treatment = item.featuredTreatment || 'premium'
      return `
        <article class="feature feature--${treatment}" data-project="${item.id}">
          <div class="feature__meta reveal" data-reveal>
            <span class="feature__num">${item.number}</span>
            <h3 class="feature__title">${item.title}</h3>
            <p class="feature__cat">${item.category}</p>
          </div>
          <div
            class="feature__stage reveal"
            data-reveal
            data-play-on-view
            data-open-project="${item.id}"
            role="button"
            tabindex="0"
            aria-label="Watch ${item.title}"
          >
            ${mediaFrameMarkup(item, { eager: item.id === 'watch-society' })}
          </div>
        </article>
      `
    })
    .join('')
}

function renderLibrary() {
  const root = document.getElementById('workLibrary')
  if (!root) return

  const order = [
    'watch-society',
    'property-by-kazy',
    'jason-watson',
    'saul-paul',
    'archit-x-inso',
  ]
  const byId = Object.fromEntries(WORK.map((w) => [w.id, w]))
  const items = order.map((id) => byId[id]).filter(Boolean)

  root.innerHTML = items
    .map((item) => {
      const aspectClass = item.aspect === 'landscape' ? 'landscape' : 'vertical'
      return `
        <article class="card card--${aspectClass}" data-project="${item.id}">
          <div
            class="card__stage reveal"
            data-reveal
            data-play-on-hover
            data-open-project="${item.id}"
            role="button"
            tabindex="0"
            aria-label="Watch ${item.title}"
          >
            ${mediaFrameMarkup(item)}
          </div>
          <div class="card__meta reveal" data-reveal>
            <h3 class="card__title">${item.title}</h3>
            <span class="card__num">${item.number}</span>
            <p class="card__cat">${item.category}</p>
          </div>
        </article>
      `
    })
    .join('')
}

function renderLongForm() {
  const root = document.getElementById('longFormWork')
  if (!root) return

  root.innerHTML = LONG_FORM.map((item) => {
    return `
      <article class="card card--landscape lf-card" data-project="${item.id}">
        <div class="card__stage reveal" data-reveal>
          <div
            class="media-frame"
            data-aspect="${item.aspect}"
            role="img"
            aria-label="${item.title} — ${item.category}"
          >
            <img
              src="${item.poster}"
              alt=""
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          </div>
        </div>
        <div class="card__meta reveal" data-reveal>
          <h3 class="card__title">${item.title}</h3>
          <p class="card__cat">${item.category}</p>
          <p class="card__desc">${item.description}</p>
          <a
            class="btn btn--ghost lf-card__cta"
            href="${item.url}"
            target="_blank"
            rel="noopener noreferrer"
            data-magnetic
            aria-label="Watch full ${item.title} project on YouTube"
          >Watch Full Project ↗</a>
        </div>
      </article>
    `
  }).join('')
}

/* ---------- Video engine ---------- */
function pauseAllPreviews() {
  document.querySelectorAll('.media-frame.is-playing').forEach(pauseFrame)
}

function ensureVideoSource(frame) {
  const video = frame.querySelector('video')
  if (!video || video.dataset.ready === '1') return video
  const src = frame.dataset.videoSrc
  if (!src) return video
  video.src = src
  video.muted = true
  video.defaultMuted = true
  video.dataset.ready = '1'
  return video
}

async function playFrame(frame) {
  if (playerOpen) return
  const video = ensureVideoSource(frame)
  if (!video) return
  video.muted = true
  try {
    const playPromise = video.play()
    if (playPromise) await playPromise
    if (playerOpen) {
      pauseFrame(frame)
      return
    }
    frame.classList.add('is-playing')
  } catch {
    frame.classList.remove('is-playing')
  }
}

function pauseFrame(frame) {
  const video = frame.querySelector('video')
  if (!video) return
  video.pause()
  frame.classList.remove('is-playing')
}

function applyHeroMuteState() {
  const hero = document.getElementById('heroVideo')
  if (!hero) return
  const silent = !heroWantsSound
  hero.muted = silent
  hero.defaultMuted = silent
  hero.volume = HERO_VOLUME
  if (silent) {
    hero.setAttribute('muted', '')
  } else {
    hero.removeAttribute('muted')
  }
}

function syncHeroSoundUi() {
  const hero = document.getElementById('heroVideo')
  const btn = document.getElementById('heroSound')
  if (!hero || !btn) return
  const on = heroWantsSound && !hero.muted
  btn.setAttribute('aria-pressed', on ? 'true' : 'false')
  btn.setAttribute('aria-label', on ? 'Mute hero video' : 'Unmute hero video')
  btn.classList.toggle('is-on', on)
  const icon = btn.querySelector('.hero__sound-icon')
  const text = btn.querySelector('.hero__sound-text')
  if (icon) icon.textContent = on ? '🔊' : '🔇'
  if (text) text.textContent = on ? 'SOUND ON' : 'SOUND OFF'
}

function setupHeroSound() {
  const hero = document.getElementById('heroVideo')
  const btn = document.getElementById('heroSound')
  if (!hero || !btn) return

  // Always silent on first open. Never autoplay audio.
  heroWantsSound = false
  hero.muted = true
  hero.defaultMuted = true
  hero.volume = HERO_VOLUME
  hero.setAttribute('muted', '')
  hero.setAttribute('playsinline', '')
  hero.setAttribute('webkit-playsinline', '')
  hero.loop = true
  hero.autoplay = true
  hero.playsInline = true

  const tryPlayMuted = () => {
    if (playerOpen) return
    // Keep muted unless the visitor explicitly turned sound on.
    if (!heroWantsSound) {
      hero.muted = true
      hero.defaultMuted = true
      hero.setAttribute('muted', '')
    }
    hero.volume = HERO_VOLUME
    const p = hero.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  }

  tryPlayMuted()
  hero.addEventListener('loadeddata', tryPlayMuted)
  hero.addEventListener('canplay', tryPlayMuted)
  document.addEventListener('touchstart', tryPlayMuted, { once: true, passive: true })

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    heroWantsSound = !heroWantsSound

    if (heroWantsSound) {
      // Unmute in place — do not restart playback.
      hero.muted = false
      hero.defaultMuted = false
      hero.removeAttribute('muted')
      hero.volume = HERO_VOLUME
    } else {
      hero.muted = true
      hero.defaultMuted = true
      hero.setAttribute('muted', '')
      hero.volume = HERO_VOLUME
    }

    // Only call play if the hero was paused; never seek/reload.
    if (!playerOpen && hero.paused) {
      const p = hero.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    }

    syncHeroSoundUi()
  })

  syncHeroSoundUi()
}

function setupVideos() {
  const hero = document.getElementById('heroVideo')
  setupHeroSound()

  const viewStages = document.querySelectorAll('[data-play-on-view]')
  const viewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const frame = entry.target.querySelector('.media-frame')
        if (!frame) return
        if (!playerOpen && entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          playFrame(frame)
        } else {
          pauseFrame(frame)
        }
      })
    },
    { threshold: [0, 0.45, 0.7] },
  )
  viewStages.forEach((stage) => viewObserver.observe(stage))

  const hoverStages = document.querySelectorAll('[data-play-on-hover]')
  const visibleHover = new Set()

  const hoverObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const stage = entry.target
        const frame = stage.querySelector('.media-frame')
        if (!frame) return
        if (entry.isIntersecting) {
          visibleHover.add(stage)
          if (!frame.dataset.warmed) {
            const video = ensureVideoSource(frame)
            if (video) video.preload = 'metadata'
            frame.dataset.warmed = '1'
          }
        } else {
          visibleHover.delete(stage)
          pauseFrame(frame)
        }
      })
    },
    { rootMargin: '120px 0px', threshold: 0.15 },
  )

  hoverStages.forEach((stage) => {
    hoverObserver.observe(stage)
    const frame = stage.querySelector('.media-frame')
    if (!frame) return
    if (!isTouch) {
      stage.addEventListener('pointerenter', () => {
        if (!playerOpen && visibleHover.has(stage)) playFrame(frame)
      })
      stage.addEventListener('pointerleave', () => pauseFrame(frame))
    }
  })

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-project]')
    if (!trigger) return
    e.preventDefault()
    const id = trigger.getAttribute('data-open-project')
    // Kill background playback immediately — before the cut delay
    pauseAllPreviews()
    const heroNow = document.getElementById('heroVideo')
    if (heroNow) heroNow.pause()
    trigger.classList.add('is-opening')
    fireCutFlash()
    const delay = reducedMotion ? 0 : 160
    window.setTimeout(() => {
      openPlayer(id, trigger)
      trigger.classList.remove('is-opening')
    }, delay)
  })

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const trigger = e.target.closest?.('[data-open-project]')
    if (!trigger || playerOpen) return
    e.preventDefault()
    trigger.click()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseAllPreviews()
      if (hero) hero.pause()
      const pv = document.getElementById('playerVideo')
      if (pv && playerOpen) pv.pause()
    } else if (hero && !playerOpen) {
      applyHeroMuteState()
      hero.play()?.catch?.(() => {})
    }
  })
}

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const s = Math.floor(sec)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

function setupPlayer() {
  const root = document.getElementById('player')
  const video = document.getElementById('playerVideo')
  const stage = document.getElementById('playerStage')
  const playBtn = document.getElementById('playerPlay')
  const muteBtn = document.getElementById('playerMute')
  const soundChip = document.getElementById('playerSoundChip')
  const fsBtn = document.getElementById('playerFs')
  const seek = document.getElementById('playerSeek')
  const vol = document.getElementById('playerVol')
  const timeEl = document.getElementById('playerTime')
  const stateEl = document.getElementById('playerState')
  const titleEl = document.getElementById('playerTitle')
  const catEl = document.getElementById('playerCat')
  if (!root || !video) return

  let seeking = false
  let lastVolume = 1
  let playerGen = 0

  const syncTime = () => {
    const d = video.duration || 0
    const t = video.currentTime || 0
    if (timeEl) timeEl.textContent = `${formatTime(t)} / ${formatTime(d)}`
    if (seek && !seeking && d) seek.value = String((t / d) * 100)
  }

  const syncState = () => {
    const playing = !video.paused && !video.ended
    if (playBtn) {
      playBtn.textContent = playing ? 'Pause' : 'Play'
      playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play')
    }
    if (stateEl) stateEl.textContent = video.ended ? 'Ended' : playing ? 'Playing' : 'Paused'
  }

  const syncMute = () => {
    const muted = video.muted || video.volume === 0
    if (muteBtn) {
      muteBtn.textContent = muted ? 'Unmute' : 'Mute'
      muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute')
      muteBtn.classList.toggle('is-hot', muted)
    }
    if (soundChip) {
      soundChip.hidden = !muted
      soundChip.textContent = 'Sound off — tap to unmute'
    }
    if (vol) vol.value = muted ? '0' : String(video.volume)
  }

  const playVideo = async ({ withSound = false } = {}) => {
    if (withSound) {
      video.muted = false
      video.defaultMuted = false
      video.removeAttribute('muted')
      if (video.volume === 0) video.volume = lastVolume || 1
      playerWantsSound = true
    } else {
      video.muted = true
      video.defaultMuted = true
      video.setAttribute('muted', '')
    }
    if (vol) vol.value = video.muted ? '0' : String(video.volume || lastVolume || 1)
    try {
      await video.play()
    } catch {
      /* gesture already used to open */
    }
    syncState()
    syncMute()
  }

  async function openPlayerById(id, originEl) {
    const item = getProjectById(id)
    if (!item) return

    playerOpen = true
    pauseAllPreviews()
    const hero = document.getElementById('heroVideo')
    if (hero) hero.pause()

    titleEl.textContent = item.title
    catEl.textContent = `${item.number}  ·  ${item.category}${item.duration ? `  ·  ${item.duration}` : ''}`
    stage.classList.toggle('is-landscape', item.aspect === 'landscape')
    stage.classList.toggle('is-vertical', item.aspect !== 'landscape')

    video.pause()
    video.preload = 'auto'
    video.poster = item.poster
    video.src = item.src
    video.volume = lastVolume || 1
    video.setAttribute('aria-label', `${item.title} video`)

    // Always open muted — visitor opts into sound
    playerWantsSound = false
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')

    const shell = root.querySelector('.player__shell')
    const gen = ++playerGen
    if (shell && originEl && !reducedMotion) {
      const r = originEl.getBoundingClientRect()
      const ox = ((r.left + r.width / 2) / window.innerWidth) * 100
      const oy = ((r.top + r.height / 2) / window.innerHeight) * 100
      shell.style.transformOrigin = `${ox}% ${oy}%`
    } else if (shell) {
      shell.style.transformOrigin = '50% 50%'
    }

    root.hidden = false
    root.classList.remove('is-in')
    document.body.classList.add('player-open')
    document.querySelector('.player__close')?.focus()
    // Timeout instead of rAF — rAF can stall in background/automation tabs
    window.setTimeout(() => {
      if (playerGen !== gen) return
      root.classList.add('is-in')
    }, 16)

    await new Promise((resolve, reject) => {
      if (video.readyState >= 1 && video.duration) {
        resolve()
        return
      }
      const onMeta = () => {
        video.removeEventListener('error', onErr)
        resolve()
      }
      const onErr = () => {
        video.removeEventListener('loadedmetadata', onMeta)
        reject(new Error('player media error'))
      }
      video.addEventListener('loadedmetadata', onMeta, { once: true })
      video.addEventListener('error', onErr, { once: true })
    }).catch(() => {})

    // Prefer intrinsic media ratio for stage hooks (contain sizing is CSS-driven)
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      const landscape = video.videoWidth / video.videoHeight >= 1
      stage.classList.toggle('is-landscape', landscape)
      stage.classList.toggle('is-vertical', !landscape)
    }

    await playVideo({ withSound: playerWantsSound })
    if (video.paused) await playVideo({ withSound: playerWantsSound })
    syncTime()
    syncState()
    syncMute()
  }

  function closePlayer() {
    if (!playerOpen) return
    const gen = playerGen
    playerOpen = false
    video.pause()
    root.classList.remove('is-in')

    const finish = () => {
      if (playerGen !== gen) return
      video.removeAttribute('src')
      video.load()
      root.hidden = true
      document.body.classList.remove('player-open')
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch?.(() => {})
      }
      const hero = document.getElementById('heroVideo')
      if (hero) {
        applyHeroMuteState()
        hero.play()?.catch?.(() => {})
      }
      syncState()
    }

    if (reducedMotion) finish()
    else window.setTimeout(finish, 150)
  }

  window.openPlayer = openPlayerById
  window.closePlayer = closePlayer

  playBtn?.addEventListener('click', () => {
    if (video.paused || video.ended) playVideo({ withSound: playerWantsSound })
    else video.pause()
  })

  video.addEventListener('click', () => {
    if (video.paused) playVideo({ withSound: playerWantsSound })
    else video.pause()
  })

  muteBtn?.addEventListener('click', () => {
    if (video.muted || video.volume === 0) {
      video.muted = false
      video.defaultMuted = false
      video.removeAttribute('muted')
      video.volume = lastVolume || 1
      playerWantsSound = true
    } else {
      lastVolume = video.volume || 1
      video.muted = true
      video.defaultMuted = true
      video.setAttribute('muted', '')
      playerWantsSound = false
    }
    syncMute()
  })

  soundChip?.addEventListener('click', (e) => {
    e.stopPropagation()
    muteBtn?.click()
  })

  vol?.addEventListener('input', () => {
    const v = Number(vol.value)
    video.volume = v
    video.muted = v === 0
    playerWantsSound = v > 0
    if (v > 0) lastVolume = v
    syncMute()
  })

  seek?.addEventListener('pointerdown', () => {
    seeking = true
  })
  seek?.addEventListener('input', () => {
    if (!video.duration) return
    video.currentTime = (Number(seek.value) / 100) * video.duration
    syncTime()
  })
  seek?.addEventListener('pointerup', () => {
    seeking = false
  })
  seek?.addEventListener('change', () => {
    seeking = false
  })

  fsBtn?.addEventListener('click', async () => {
    const shell = root.querySelector('.player__shell')
    const fsTarget = shell || stage
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (fsTarget.requestFullscreen) {
        await fsTarget.requestFullscreen()
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen()
      }
    } catch {
      if (video.webkitEnterFullscreen) video.webkitEnterFullscreen()
    }
  })

  const syncFullscreenCursor = () => {
    const cursorEl = document.querySelector('.cursor')
    const labelEl = document.querySelector('.cursor-label')
    const fs = document.fullscreenElement
    document.body.classList.toggle('is-fullscreen', Boolean(fs))
    if (!cursorEl || !labelEl || document.body.classList.contains('is-touch')) return
    // Custom cursor must live inside the fullscreen element to remain visible
    if (fs) {
      if (cursorEl.parentElement !== fs) fs.appendChild(cursorEl)
      if (labelEl.parentElement !== fs) fs.appendChild(labelEl)
    } else {
      if (cursorEl.parentElement !== document.body) document.body.appendChild(cursorEl)
      if (labelEl.parentElement !== document.body) document.body.appendChild(labelEl)
    }
  }
  document.addEventListener('fullscreenchange', syncFullscreenCursor)
  document.addEventListener('webkitfullscreenchange', syncFullscreenCursor)
  syncFullscreenCursor()

  root.querySelectorAll('[data-player-close]').forEach((el) => {
    el.addEventListener('click', () => closePlayer())
  })

  video.addEventListener('play', syncState)
  video.addEventListener('pause', syncState)
  video.addEventListener('ended', syncState)
  video.addEventListener('timeupdate', syncTime)
  video.addEventListener('durationchange', syncTime)
  video.addEventListener('volumechange', syncMute)

  window.addEventListener('keydown', (e) => {
    if (!playerOpen) return
    if (e.key === 'Escape') {
      e.preventDefault()
      closePlayer()
    } else if (e.key === ' ' || e.key === 'k') {
      e.preventDefault()
      if (video.paused) playVideo({ withSound: playerWantsSound })
      else video.pause()
    } else if (e.key === 'm') {
      muteBtn?.click()
    } else if (e.key === 'f') {
      fsBtn?.click()
    } else if (e.key === 'ArrowRight') {
      video.currentTime = Math.min((video.currentTime || 0) + 5, video.duration || 0)
    } else if (e.key === 'ArrowLeft') {
      video.currentTime = Math.max((video.currentTime || 0) - 5, 0)
    }
  })
}

function openPlayer(id, originEl) {
  if (typeof window.openPlayer === 'function') window.openPlayer(id, originEl)
}

/* ---------- Reveals ---------- */
function setupReveals() {
  const nodes = document.querySelectorAll('[data-reveal]')
  if (reducedMotion) {
    nodes.forEach((n) => n.classList.add('is-in'))
    return
  }

  const groups = document.querySelectorAll(
    '.hero__content, .section__head, .library__subhead, .feature, .card, .about__grid, .contact__blast, .contact__links',
  )
  groups.forEach((group) => {
    group.querySelectorAll('[data-reveal]').forEach((node, i) => {
      const delay = Math.min(i, 3) * 55
      node.style.setProperty('--delay', `${delay}ms`)
    })
  })

  // Hero waits for boot snap (setupBoot adds is-in)
  const heroNodes = document.querySelectorAll('.hero [data-reveal]')
  heroNodes.forEach((n, i) => {
    n.style.setProperty('--delay', `${90 + i * 55}ms`)
  })

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
  )

  nodes.forEach((n) => {
    if (n.closest('.hero')) return
    io.observe(n)
  })
}

function fireCutFlash() {
  if (reducedMotion) return
  const flash = document.getElementById('cutFlash')
  if (!flash) return
  flash.classList.remove('is-on')
  // reflow to restart animation
  void flash.offsetWidth
  flash.classList.add('is-on')
  window.setTimeout(() => flash.classList.remove('is-on'), 260)
}

function setupBoot() {
  const veil = document.querySelector('.boot-snap')
  let done = false

  const finish = () => {
    if (done) return
    done = true
    document.body.classList.add('is-ready')
    document.body.classList.remove('is-booting')
    document.querySelectorAll('.hero [data-reveal]').forEach((n) => n.classList.add('is-in'))
  }

  if (reducedMotion) {
    finish()
    veil?.remove()
    return
  }

  // Use timeout (not rAF) — rAF can stall in background/automation tabs
  window.setTimeout(() => {
    finish()
    window.setTimeout(() => veil?.remove(), 560)
    // Kick muted hero playback after the snap (safe — always muted until user toggles)
    const hero = document.getElementById('heroVideo')
    if (hero && !playerOpen) {
      hero.muted = true
      hero.defaultMuted = true
      hero.play()?.catch?.(() => {})
    }
  }, 50)

  // Safety: never leave the UI locked behind the boot veil
  window.setTimeout(() => {
    finish()
    document.querySelector('.boot-snap')?.remove()
  }, 900)
}

/* ---------- Nav ---------- */
function setupNav() {
  const nav = document.getElementById('nav')
  const toggle = document.getElementById('navToggle')
  const drawer = document.getElementById('navDrawer')
  let drawerTimer = 0

  const onScroll = () => {
    nav?.classList.toggle('is-solid', window.scrollY > 40)
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })

  const closeDrawer = () => {
    drawer?.classList.remove('is-open')
    drawer?.setAttribute('aria-hidden', 'true')
    toggle?.setAttribute('aria-expanded', 'false')
    toggle?.setAttribute('aria-label', 'Open menu')
    document.body.style.overflow = ''
    window.clearTimeout(drawerTimer)
    drawerTimer = window.setTimeout(() => {
      drawer?.setAttribute('hidden', '')
    }, reducedMotion ? 0 : 140)
  }

  const openDrawer = () => {
    window.clearTimeout(drawerTimer)
    drawer?.removeAttribute('hidden')
    drawer?.setAttribute('aria-hidden', 'false')
    toggle?.setAttribute('aria-expanded', 'true')
    toggle?.setAttribute('aria-label', 'Close menu')
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => drawer?.classList.add('is-open'))
  }

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true'
    if (open) closeDrawer()
    else openDrawer()
  })

  drawer?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => closeDrawer())
  })

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !playerOpen) closeDrawer()
  })

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href')
      if (!href || href === '#') return
      const target = document.querySelector(href)
      if (!target) return
      e.preventDefault()
      link.classList.add('is-pressed')
      window.setTimeout(() => link.classList.remove('is-pressed'), 140)
      target.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      })
      history.replaceState(null, '', href)
    })
  })
}

/* ---------- UI click sounds (Web Audio, no files) ---------- */
function setupClickSounds() {
  if (reducedMotion) return

  let ctx = null
  let unlocked = false
  let lastPlay = 0

  const ensure = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    unlocked = true
    return ctx
  }

  const tone = ({ freq = 880, dur = 0.04, type = 'square', gain = 0.028, slide = 0 } = {}) => {
    const audio = ensure()
    if (!audio) return
    const now = audio.currentTime
    const osc = audio.createOscillator()
    const g = audio.createGain()
    const filter = audio.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 520
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(80, freq + slide), now + dur)
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(gain, now + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
    osc.connect(filter)
    filter.connect(g)
    g.connect(audio.destination)
    osc.start(now)
    osc.stop(now + dur + 0.015)
  }

  const playClick = (kind = 'tap') => {
    const t = performance.now()
    if (t - lastPlay < 50) return
    lastPlay = t
    if (kind === 'open') {
      tone({ freq: 540, dur: 0.042, type: 'triangle', gain: 0.032, slide: 180 })
      window.setTimeout(() => tone({ freq: 880, dur: 0.028, type: 'square', gain: 0.018 }), 30)
    } else if (kind === 'cta') {
      tone({ freq: 700, dur: 0.038, type: 'triangle', gain: 0.03, slide: 120 })
    } else if (kind === 'nav') {
      tone({ freq: 1040, dur: 0.022, type: 'square', gain: 0.018 })
    } else {
      tone({ freq: 900, dur: 0.025, type: 'square', gain: 0.02 })
    }
  }

  // Unlock audio on first real gesture
  const unlock = () => {
    ensure()
    document.removeEventListener('pointerdown', unlock)
  }
  document.addEventListener('pointerdown', unlock, { passive: true })

  document.addEventListener(
    'pointerdown',
    (e) => {
      if (e.button !== 0) return
      const t = e.target
      if (!(t instanceof Element)) return

      if (t.closest('[data-open-project]')) playClick('open')
      else if (t.closest('.btn, .nav__cta, .nav-drawer__cta, .hero__actions a')) playClick('cta')
      else if (t.closest('.nav__links a, .nav-drawer a, .nav__logo, .nav__toggle, .hero__sound, .player__btn, .player__close, .contact-row, a[href^="#"]'))
        playClick('nav')
      else if (t.closest('a, button, .btn, input[type="range"]')) playClick('tap')
    },
    { passive: true },
  )

  window.playUiClick = playClick
}

/* ---------- Cursor ---------- */
function setupCursor() {
  const cursor = document.querySelector('.cursor')
  const label = document.querySelector('.cursor-label')
  if (!cursor || !label) return

  if (isTouch || reducedMotion) {
    document.body.classList.remove('has-cursor')
    cursor.hidden = true
    label.hidden = true
    return
  }

  document.body.classList.add('has-cursor')

  let x = 0
  let y = 0
  let cx = 0
  let cy = 0
  let visible = false
  let raf = 0
  let running = false
  let clickTimer = 0

  const loop = () => {
    if (!running) return
    cx += (x - cx) * 0.55
    cy += (y - cy) * 0.55
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
    label.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
    raf = requestAnimationFrame(loop)
  }

  const start = () => {
    if (running) return
    running = true
    raf = requestAnimationFrame(loop)
  }

  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return
      x = e.clientX
      y = e.clientY
      if (!visible) {
        visible = true
        cx = x
        cy = y
        cursor.classList.add('is-live')
        label.classList.add('is-live')
        start()
      }
    },
    { passive: true },
  )

  const playSel = '.card__stage, .feature__stage'
  const ctaSel = '.btn, .nav__cta, .nav-drawer__cta, .hero__actions a'
  const hoverSel = 'a, button, .btn, .hero__sound, .player__btn, .player__close, input, .contact-row'

  const setMode = (mode, text) => {
    cursor.classList.toggle('is-play', mode === 'play')
    cursor.classList.toggle('is-cta', mode === 'cta')
    cursor.classList.toggle('is-hover', mode === 'hover')
    label.classList.toggle('is-on', mode === 'play' || mode === 'cta')
    label.classList.toggle('is-arrow', mode === 'cta')
    label.textContent = text || ''
  }

  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(playSel)) setMode('play', 'VIEW')
    else if (e.target.closest(ctaSel)) setMode('cta', '→')
    else if (e.target.closest(hoverSel)) setMode('hover', '')
  })

  document.addEventListener('pointerout', (e) => {
    const playable = e.target.closest(playSel)
    if (playable && !playable.contains(e.relatedTarget)) setMode('', '')
    const cta = e.target.closest(ctaSel)
    if (cta && !cta.contains(e.relatedTarget) && !e.relatedTarget?.closest(playSel)) {
      if (e.relatedTarget?.closest(hoverSel)) setMode('hover', '')
      else setMode('', '')
    }
    const hoverable = e.target.closest(hoverSel)
    if (hoverable && !hoverable.contains(e.relatedTarget) && !e.relatedTarget?.closest(playSel)) {
      setMode('', '')
    }
  })

  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return
    cursor.classList.add('is-click')
    window.clearTimeout(clickTimer)
    clickTimer = window.setTimeout(() => cursor.classList.remove('is-click'), 120)
  })

  document.addEventListener('mouseleave', () => {
    visible = false
    cursor.classList.remove('is-live', 'is-hover', 'is-play', 'is-cta', 'is-click')
    label.classList.remove('is-on', 'is-live')
  })

  window.addEventListener('blur', stop)
  window.addEventListener('focus', () => {
    if (visible) start()
  })
}

/* ---------- Magnetic buttons ---------- */
function setupMagnetic() {
  if (isTouch || reducedMotion) return
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`
    })
    el.addEventListener('pointerleave', () => {
      el.style.transform = ''
    })
  })
}

/* ---------- Boot ---------- */
wireConfig()
renderSelected()
renderLibrary()
renderLongForm()
setupNav()
setupReveals()
setupBoot()
setupPlayer()
setupVideos()
setupCursor()
setupClickSounds()
setupMagnetic()
